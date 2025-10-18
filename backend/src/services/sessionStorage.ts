import { LiveSearchSession, ProgressUpdate, SearchLog, GeneratedContext } from '../types';
import * as fs from 'fs';
import * as path from 'path';

const SESSIONS_DIR = path.join(__dirname, '../../data/sessions');

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

interface PersistentSession extends LiveSearchSession {
  searchLogs: SearchLog[];
  generatedContext: GeneratedContext;
  lastUpdate: Date;
  isComplete: boolean;
  finalProfile?: any;
}

/**
 * Save session to persistent storage
 */
export function saveSession(session: LiveSearchSession, searchLogs: SearchLog[] = [], generatedContext?: GeneratedContext): void {
  try {
    const persistentSession: PersistentSession = {
      ...session,
      searchLogs,
      generatedContext: generatedContext || { additionalFindings: [] },
      lastUpdate: new Date(),
      isComplete: false,
    };

    const filePath = path.join(SESSIONS_DIR, `${session.sessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(persistentSession, null, 2));
    console.log(`💾 Saved session ${session.sessionId} to persistent storage`);
  } catch (error) {
    console.error(`Error saving session ${session.sessionId}:`, error);
  }
}

/**
 * Load session from persistent storage
 */
export function loadSession(sessionId: string): PersistentSession | null {
  try {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const session = JSON.parse(data);
    
    // Convert date strings back to Date objects
    session.startTime = new Date(session.startTime);
    session.lastUpdate = new Date(session.lastUpdate);
    
    console.log(`📂 Loaded session ${sessionId} from persistent storage`);
    return session;
  } catch (error) {
    console.error(`Error loading session ${sessionId}:`, error);
    return null;
  }
}

/**
 * Update session in persistent storage
 */
export function updateSession(sessionId: string, updates: Partial<PersistentSession>): void {
  try {
    const existingSession = loadSession(sessionId);
    if (!existingSession) {
      console.warn(`Session ${sessionId} not found for update`);
      return;
    }

    const updatedSession: PersistentSession = {
      ...existingSession,
      ...updates,
      lastUpdate: new Date(),
    };

    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(updatedSession, null, 2));
    console.log(`🔄 Updated session ${sessionId} in persistent storage`);
  } catch (error) {
    console.error(`Error updating session ${sessionId}:`, error);
  }
}

/**
 * Mark session as complete
 */
export function completeSession(sessionId: string, finalProfile?: any): void {
  try {
    const existingSession = loadSession(sessionId);
    if (!existingSession) {
      console.warn(`Session ${sessionId} not found for completion`);
      return;
    }

    const completedSession: PersistentSession = {
      ...existingSession,
      isComplete: true,
      finalProfile,
      lastUpdate: new Date(),
    };

    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(completedSession, null, 2));
    console.log(`✅ Marked session ${sessionId} as complete`);
  } catch (error) {
    console.error(`Error completing session ${sessionId}:`, error);
  }
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): PersistentSession[] {
  try {
    const files = fs.readdirSync(SESSIONS_DIR);
    const sessions: PersistentSession[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const sessionId = file.replace('.json', '');
        const session = loadSession(sessionId);
        if (session && !session.isComplete) {
          sessions.push(session);
        }
      }
    }

    return sessions;
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return [];
  }
}

/**
 * Get all sessions (active and completed)
 */
export function getAllSessions(): PersistentSession[] {
  try {
    const files = fs.readdirSync(SESSIONS_DIR);
    const sessions: PersistentSession[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const sessionId = file.replace('.json', '');
        const session = loadSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }
    }

    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  } catch (error) {
    console.error('Error getting all sessions:', error);
    return [];
  }
}

/**
 * Clean up old sessions (older than 24 hours)
 */
export function cleanupOldSessions(): void {
  try {
    const files = fs.readdirSync(SESSIONS_DIR);
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      if (file.endsWith('.json')) {
        const sessionId = file.replace('.json', '');
        const session = loadSession(sessionId);
        
        if (session && (now.getTime() - session.lastUpdate.getTime()) > maxAge) {
          const filePath = path.join(SESSIONS_DIR, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up old session ${sessionId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
  }
}

/**
 * Delete a specific session
 */
export function deleteSession(sessionId: string): void {
  try {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted session ${sessionId}`);
    }
  } catch (error) {
    console.error(`Error deleting session ${sessionId}:`, error);
  }
}
