import { v4 as uuidv4 } from 'uuid';
import { ProgressUpdate, LiveSearchSession, PhaseResults, SearchLog, GeneratedContext } from '../types';
import * as sessionStorage from './sessionStorage';

// Store active SSE connections
const activeConnections = new Map<string, any>();

// Store active search sessions
const activeSessions = new Map<string, LiveSearchSession>();

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Register a new search session
 */
export function registerSession(sessionId: string, subjectName: string): void {
  const session: LiveSearchSession = {
    sessionId,
    subjectName,
    startTime: new Date(),
    currentPhase: 'starting',
    progress: 0,
    errors: [],
    isActive: true,
  };
  
  activeSessions.set(sessionId, session);
  
  // Save to persistent storage
  sessionStorage.saveSession(session);
  
  console.log(`📊 Registered search session: ${sessionId} for ${subjectName}`);
}

/**
 * Register an SSE connection for a session
 */
export function registerConnection(sessionId: string, response: any): void {
  activeConnections.set(sessionId, response);
  console.log(`🔗 Registered SSE connection for session: ${sessionId}`);
  
  // Send initial connection confirmation
  try {
    const data = JSON.stringify({
      sessionId,
      subjectName: activeSessions.get(sessionId)?.subjectName || 'Unknown',
      phase: 'linkedin',
      status: 'starting',
      message: 'Connected to live search updates',
      progress: 0,
      timestamp: new Date(),
    });
    response.write(`data: ${data}\n\n`);
    console.log(`📡 Sent initial connection confirmation for ${sessionId}`);
  } catch (error) {
    console.error(`Error sending initial connection confirmation for ${sessionId}:`, error);
  }
}

/**
 * Unregister a session and its connection
 */
export function unregisterSession(sessionId: string): void {
  activeConnections.delete(sessionId);
  const session = activeSessions.get(sessionId);
  if (session) {
    session.isActive = false;
  }
  console.log(`📊 Unregistered search session: ${sessionId}`);
}

/**
 * Send progress update to client
 */
export function sendProgressUpdate(sessionId: string, update: ProgressUpdate): void {
  const connection = activeConnections.get(sessionId);
  const session = activeSessions.get(sessionId);
  
  if (!connection || !session || !session.isActive) {
    console.log(`⚠️ Cannot send update for ${sessionId}: connection=${!!connection}, session=${!!session}, active=${session?.isActive}`);
    return;
  }
  
  try {
    // Check if connection is still writable
    if (connection.destroyed || connection.writableEnded) {
      console.log(`⚠️ Connection for ${sessionId} is no longer writable, removing`);
      activeConnections.delete(sessionId);
      return;
    }
    
    // Update session state
    session.currentPhase = update.phase;
    session.progress = update.progress;
    
    if (update.results?.searchLog) {
      if (!session.partialProfile) {
        session.partialProfile = {
          name: session.subjectName,
          aliases: [],
          profileSummary: '',
          sources: [],
          searchLogs: [],
        };
      }
      
      if (!session.partialProfile.searchLogs) {
        session.partialProfile.searchLogs = [];
      }
      session.partialProfile.searchLogs.push(update.results.searchLog);
    }
    
    if (update.status === 'failed') {
      session.errors.push(update.message);
    }
    
    // Update persistent storage
    sessionStorage.updateSession(sessionId, {
      currentPhase: session.currentPhase,
      progress: session.progress,
      errors: session.errors,
      partialProfile: session.partialProfile,
    });
    
    // Send SSE update
    const data = JSON.stringify(update);
    connection.write(`data: ${data}\n\n`);
    
    console.log(`📡 Sent progress update for ${sessionId}: ${update.phase} - ${update.message}`);
  } catch (error) {
    console.error(`Error sending progress update for ${sessionId}:`, error);
    // Remove broken connection
    activeConnections.delete(sessionId);
  }
}

/**
 * Send phase start update
 */
export function sendPhaseStart(sessionId: string, phase: ProgressUpdate['phase'], message: string): void {
  const progress = getPhaseProgress(phase, 'starting');
  sendProgressUpdate(sessionId, {
    sessionId,
    subjectName: activeSessions.get(sessionId)?.subjectName || 'Unknown',
    phase,
    status: 'starting',
    message,
    progress,
    timestamp: new Date(),
  });
}

/**
 * Send phase progress update
 */
export function sendPhaseProgress(
  sessionId: string, 
  phase: ProgressUpdate['phase'], 
  status: ProgressUpdate['status'],
  message: string,
  results?: PhaseResults
): void {
  const progress = getPhaseProgress(phase, status);
  sendProgressUpdate(sessionId, {
    sessionId,
    subjectName: activeSessions.get(sessionId)?.subjectName || 'Unknown',
    phase,
    status,
    message,
    progress,
    results,
    timestamp: new Date(),
  });
}

/**
 * Send phase completion update
 */
export function sendPhaseComplete(
  sessionId: string, 
  phase: ProgressUpdate['phase'], 
  message: string,
  results?: PhaseResults
): void {
  sendProgressUpdate(sessionId, {
    sessionId,
    subjectName: activeSessions.get(sessionId)?.subjectName || 'Unknown',
    phase,
    status: 'completed',
    message,
    progress: getPhaseProgress(phase, 'completed'),
    results,
    timestamp: new Date(),
  });
}

/**
 * Send search completion update
 */
export function sendSearchComplete(sessionId: string, message: string, finalProfile?: any): void {
  sendProgressUpdate(sessionId, {
    sessionId,
    subjectName: activeSessions.get(sessionId)?.subjectName || 'Unknown',
    phase: 'complete',
    status: 'completed',
    message,
    progress: 100,
    timestamp: new Date(),
  });
  
  // Mark session as complete in persistent storage
  sessionStorage.completeSession(sessionId, finalProfile);
  
  // Clean up after a delay
  setTimeout(() => {
    unregisterSession(sessionId);
  }, 5000);
}

/**
 * Send error update
 */
export function sendError(sessionId: string, message: string): void {
  sendProgressUpdate(sessionId, {
    sessionId,
    subjectName: activeSessions.get(sessionId)?.subjectName || 'Unknown',
    phase: 'error',
    status: 'failed',
    message,
    progress: 0,
    timestamp: new Date(),
  });
}

/**
 * Get progress percentage for a phase and status
 */
function getPhaseProgress(phase: ProgressUpdate['phase'], status: ProgressUpdate['status']): number {
  const phaseProgress = {
    linkedin: 0,
    github: 25,
    website: 50,
    general: 75,
    complete: 100,
    error: 0,
  };
  
  const statusProgress = {
    starting: 0,
    searching: 0.3,
    validating: 0.6,
    completed: 1,
    failed: 0,
  };
  
  const baseProgress = phaseProgress[phase];
  const statusMultiplier = statusProgress[status];
  
  // For phases other than complete, add status-based progress within the phase
  if (phase !== 'complete' && phase !== 'error') {
    const phaseRange = 25; // Each phase is 25% of total progress
    return baseProgress + (phaseRange * statusMultiplier);
  }
  
  return baseProgress;
}

/**
 * Get active session info
 */
export function getSession(sessionId: string): LiveSearchSession | undefined {
  return activeSessions.get(sessionId);
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): LiveSearchSession[] {
  return Array.from(activeSessions.values()).filter(session => session.isActive);
}

/**
 * Clean up inactive sessions (call periodically)
 */
export function cleanupInactiveSessions(): void {
  const now = new Date();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now.getTime() - session.startTime.getTime() > maxAge) {
      unregisterSession(sessionId);
    }
  }
  
  // Also clean up old persistent sessions
  sessionStorage.cleanupOldSessions();
}

/**
 * Recover a session from persistent storage
 */
export function recoverSession(sessionId: string): LiveSearchSession | null {
  const persistentSession = sessionStorage.loadSession(sessionId);
  if (!persistentSession || persistentSession.isComplete) {
    return null;
  }
  
  // Restore to active sessions
  activeSessions.set(sessionId, persistentSession);
  console.log(`🔄 Recovered session ${sessionId} from persistent storage`);
  
  return persistentSession;
}

/**
 * Get session status (from memory or persistent storage)
 */
export function getSessionStatus(sessionId: string): any {
  // First check active sessions
  const activeSession = activeSessions.get(sessionId);
  if (activeSession) {
    return {
      ...activeSession,
      isActive: true,
      source: 'memory',
    };
  }
  
  // Then check persistent storage
  const persistentSession = sessionStorage.loadSession(sessionId);
  if (persistentSession) {
    return {
      ...persistentSession,
      isActive: false,
      source: 'storage',
    };
  }
  
  return null;
}

/**
 * Get all sessions (active and persistent)
 */
export function getAllSessions(): any[] {
  const activeSessionsList = Array.from(activeSessions.values()).map(s => ({
    ...s,
    isActive: true,
    source: 'memory',
  }));
  
  const persistentSessions = sessionStorage.getAllSessions().map(s => ({
    ...s,
    isActive: false,
    source: 'storage',
  }));
  
  // Combine and deduplicate (persistent takes precedence for completed sessions)
  const allSessions = [...activeSessionsList];
  for (const persistent of persistentSessions) {
    if (!activeSessionsList.find(s => s.sessionId === persistent.sessionId)) {
      allSessions.push(persistent);
    }
  }
  
  return allSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}
