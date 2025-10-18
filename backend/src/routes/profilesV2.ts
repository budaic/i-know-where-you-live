import { Router, Request, Response } from 'express';
import {
  createProfile as dbCreateProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile,
} from '../services/database';
import { executeMultiPhaseSearch } from '../services/searchOrchestrator';
import { generateProfileFromLog } from '../services/profileGeneratorV2';
import { ProfileRequest, ProfileResponse } from '../types';
import * as progressTracker from '../services/progressTracker';

const router = Router();

// Debug endpoint to check active sessions
router.get('/debug/sessions', (req: Request, res: Response) => {
  const sessions = progressTracker.getActiveSessions();
  res.json({
    activeSessions: sessions.length,
    sessions: sessions.map(s => ({
      sessionId: s.sessionId,
      subjectName: s.subjectName,
      currentPhase: s.currentPhase,
      progress: s.progress,
      isActive: s.isActive,
      startTime: s.startTime,
    }))
  });
});

// Get all sessions (active and completed)
router.get('/sessions', (req: Request, res: Response) => {
  try {
    const sessions = progressTracker.getAllSessions();
    res.json({
      totalSessions: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        subjectName: s.subjectName,
        currentPhase: s.currentPhase,
        progress: s.progress,
        isActive: s.isActive,
        isComplete: s.isComplete,
        startTime: s.startTime,
        lastUpdate: s.lastUpdate,
        source: s.source,
        errors: s.errors,
        searchLogs: s.searchLogs || [],
        generatedContext: s.generatedContext,
        partialProfile: s.partialProfile,
      }))
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get specific session status
router.get('/sessions/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = progressTracker.getSessionStatus(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      sessionId: session.sessionId,
      subjectName: session.subjectName,
      currentPhase: session.currentPhase,
      progress: session.progress,
      isActive: session.isActive,
      isComplete: session.isComplete,
      startTime: session.startTime,
      lastUpdate: session.lastUpdate,
      source: session.source,
      errors: session.errors,
      searchLogs: session.searchLogs || [],
      generatedContext: session.generatedContext,
      partialProfile: session.partialProfile,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Recover a session (restore to active state)
router.post('/sessions/:sessionId/recover', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const recoveredSession = progressTracker.recoverSession(sessionId);
    
    if (!recoveredSession) {
      return res.status(404).json({ error: 'Session not found or already completed' });
    }
    
    res.json({
      message: 'Session recovered successfully',
      session: {
        sessionId: recoveredSession.sessionId,
        subjectName: recoveredSession.subjectName,
        currentPhase: recoveredSession.currentPhase,
        progress: recoveredSession.progress,
        isActive: recoveredSession.isActive,
        startTime: recoveredSession.startTime,
      }
    });
  } catch (error) {
    console.error('Error recovering session:', error);
    res.status(500).json({ error: 'Failed to recover session' });
  }
});

// SSE endpoint for live search progress
router.get('/create/stream/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });
  
  // Register the connection
  progressTracker.registerConnection(sessionId, res);
  
  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      if (!res.destroyed && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`);
      } else {
        clearInterval(heartbeat);
        progressTracker.unregisterSession(sessionId);
      }
    } catch (error) {
      console.error(`Heartbeat error for session ${sessionId}:`, error);
      clearInterval(heartbeat);
      progressTracker.unregisterSession(sessionId);
    }
  }, 30000);
  
  // Handle client disconnect
  req.on('close', () => {
    console.log(`Client disconnected from session: ${sessionId}`);
    clearInterval(heartbeat);
    progressTracker.unregisterSession(sessionId);
  });
  
  req.on('error', (error) => {
    console.error(`SSE connection error for session ${sessionId}:`, error);
    clearInterval(heartbeat);
    progressTracker.unregisterSession(sessionId);
  });
});

// Create new profile(s) using the redesigned 4-phase system
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { subjects, sessionId }: ProfileRequest & { sessionId?: string } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Invalid subjects array' });
    }

    const profiles = [];
    const errors = [];

    for (const subject of subjects) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing subject: ${subject.name}`);
        console.log(`Hard Context: ${subject.hardContext}`);
        console.log(`Soft Context: ${subject.softContext}`);
        console.log(`${'='.repeat(60)}\n`);

        // Register session for live updates if sessionId provided
        if (sessionId) {
          progressTracker.registerSession(sessionId, subject.name);
          // Give a moment for the SSE connection to be established
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Execute 4-phase search with progress tracking
        const searchLog = await executeMultiPhaseSearch(
          subject.name,
          subject.hardContext,
          subject.softContext,
          sessionId
        );

        // Generate profile from search log
        const profile = await generateProfileFromLog(searchLog);

        console.log('\n--- Saving to database ---');
        const savedProfile = await dbCreateProfile(profile);
        console.log(`Saved with ID: ${savedProfile.id}\n`);

        profiles.push(savedProfile);
      } catch (error) {
        console.error(`Error processing subject ${subject.name}:`, error);
        const errorMessage = `Error processing ${subject.name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        errors.push(errorMessage);
        
        if (sessionId) {
          progressTracker.sendError(sessionId, errorMessage);
        }
      }
    }

    const response: ProfileResponse = {
      profiles,
      errors: errors.length > 0 ? errors : undefined,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /create endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get profile by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await getProfileById(id);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(404).json({
      error: 'Profile not found',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all profiles
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await getAllProfiles();
    res.json(profiles);
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete profile
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProfile(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

