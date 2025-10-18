import { useState, useCallback, useRef, useEffect } from 'react';
import { Subject, LiveSearchState, ProgressUpdate } from '../types';
import { createProfiles, getSession, recoverSession } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export function useLiveSearch() {
  const [searchState, setSearchState] = useState<LiveSearchState>({
    isSearching: false,
    currentPhase: '',
    progress: 0,
    message: '',
    results: {},
    errors: [],
    searchLogs: [],
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const handleProgressUpdate = useCallback((update: ProgressUpdate) => {
    setSearchState(prev => {
      const newState = { ...prev };
      
      // Update basic progress info
      newState.currentPhase = update.phase;
      newState.progress = update.progress;
      newState.message = update.message;
      
      // Handle phase-specific updates
      if (update.results?.searchLog) {
        newState.searchLogs = [...prev.searchLogs, update.results.searchLog];
        
        // Update partial profile with new search log
        if (newState.results.searchLogs) {
          newState.results.searchLogs = [...newState.results.searchLogs, update.results.searchLog];
        } else {
          newState.results.searchLogs = [update.results.searchLog];
        }
      }
      
      // Handle context updates
      if (update.results?.contextAdded) {
        if (!newState.results.generatedContext) {
          newState.results.generatedContext = {
            additionalFindings: [],
          };
        }
        
        // Add context based on phase
        switch (update.phase) {
          case 'linkedin':
            newState.results.generatedContext.linkedinData = update.results.contextAdded;
            break;
          case 'github':
            newState.results.generatedContext.githubData = update.results.contextAdded;
            break;
          case 'website':
            newState.results.generatedContext.websiteData = update.results.contextAdded;
            break;
          case 'general':
            if (update.results.contextAdded) {
              newState.results.generatedContext.additionalFindings = [
                ...(newState.results.generatedContext.additionalFindings || []),
                update.results.contextAdded,
              ];
            }
            break;
        }
      }
      
      // Handle completion
      if (update.phase === 'complete') {
        newState.isSearching = false;
        newState.message = 'Search completed successfully!';
        // Close SSE connection after a short delay to ensure all updates are received
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          // Clear session from localStorage when complete
          localStorage.removeItem('currentSearchSessionId');
        }, 1000);
      }
      
      // Handle errors
      if (update.phase === 'error' || update.status === 'failed') {
        newState.errors = [...prev.errors, update.message];
        if (update.phase === 'error') {
          newState.isSearching = false;
          // Close SSE connection
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
        }
      }
      
      return newState;
    });
  }, []);

  const recoverExistingSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      // Recover the session on the backend
      await recoverSession(sessionId);
      
      // Get the session data
      const session = await getSession(sessionId);
      
      // Set up the search state with recovered data
      setSearchState({
        isSearching: true,
        sessionId,
        currentPhase: session.currentPhase,
        progress: session.progress,
        message: `Recovered search for ${session.subjectName}`,
        results: {
          name: session.subjectName,
          aliases: [],
          profileSummary: '',
          sources: [],
          searchLogs: session.searchLogs || [],
          generatedContext: session.generatedContext,
        },
        errors: session.errors || [],
        searchLogs: session.searchLogs || [],
        isRecovered: true,
        startTime: new Date(session.startTime),
        lastUpdate: new Date(session.lastUpdate),
      });

      // Set up SSE connection for the recovered session
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const eventSource = new EventSource(`${API_BASE_URL}/profiles/create/stream/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat messages
          if (data.type === 'heartbeat') {
            console.log('Received heartbeat:', data.timestamp);
            return;
          }
          
          // Handle progress updates
          const update: ProgressUpdate = data;
          handleProgressUpdate(update);
        } catch (error) {
          console.error('Error parsing progress update:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        console.error('EventSource readyState:', eventSource.readyState);
        console.error('EventSource URL:', eventSource.url);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setSearchState(prev => ({
            ...prev,
            errors: [...prev.errors, 'Connection closed. Search may still be running.'],
          }));
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          setSearchState(prev => ({
            ...prev,
            errors: [...prev.errors, 'Connection lost. Attempting to reconnect...'],
          }));
        }
      };

      eventSource.onopen = () => {
        console.log('SSE connection established successfully for recovered session');
        console.log('EventSource URL:', eventSource.url);
        console.log('EventSource readyState:', eventSource.readyState);
      };

      console.log('Successfully recovered session:', sessionId);
    } catch (error) {
      console.error('Error recovering session:', error);
      setSearchState(prev => ({
        ...prev,
        errors: [...prev.errors, `Failed to recover session: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }));
    }
  }, [handleProgressUpdate]);

  // Check for existing session on mount
  useEffect(() => {
    const checkForExistingSession = async () => {
      const sessionId = localStorage.getItem('currentSearchSessionId');
      if (sessionId) {
        try {
          const session = await getSession(sessionId);
          if (session && !session.isComplete) {
            console.log('Found existing session, attempting to recover:', sessionId);
            await recoverExistingSession(sessionId);
          } else if (session && session.isComplete) {
            // Session is complete, clear it from localStorage
            localStorage.removeItem('currentSearchSessionId');
          }
        } catch (error) {
          console.error('Error checking for existing session:', error);
          localStorage.removeItem('currentSearchSessionId');
        }
      }
    };

    checkForExistingSession();
  }, [recoverExistingSession]);

  const startSearch = useCallback(async (subjects: Subject[]): Promise<void> => {
    if (searchState.isSearching) {
      console.warn('Search already in progress');
      return;
    }

    // Generate session ID
    const sessionId = uuidv4();
    
    // Save session ID to localStorage for recovery
    localStorage.setItem('currentSearchSessionId', sessionId);
    
    // Reset state
    setSearchState({
      isSearching: true,
      sessionId,
      currentPhase: 'starting',
      progress: 0,
      message: 'Initializing search...',
      results: {
        name: subjects[0]?.name || '',
        aliases: [],
        profileSummary: '',
        sources: [],
        searchLogs: [],
      },
      errors: [],
      searchLogs: [],
      isRecovered: false,
      startTime: new Date(),
    });

    try {
      // Set up SSE connection
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const eventSource = new EventSource(`${API_BASE_URL}/profiles/create/stream/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat messages
          if (data.type === 'heartbeat') {
            console.log('Received heartbeat:', data.timestamp);
            return;
          }
          
          // Handle progress updates
          const update: ProgressUpdate = data;
          handleProgressUpdate(update);
        } catch (error) {
          console.error('Error parsing progress update:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        console.error('EventSource readyState:', eventSource.readyState);
        console.error('EventSource URL:', eventSource.url);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setSearchState(prev => ({
            ...prev,
            errors: [...prev.errors, 'Connection closed. Search may still be running.'],
          }));
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          setSearchState(prev => ({
            ...prev,
            errors: [...prev.errors, 'Connection lost. Attempting to reconnect...'],
          }));
        }
      };

      eventSource.onopen = () => {
        console.log('SSE connection established successfully');
        console.log('EventSource URL:', eventSource.url);
        console.log('EventSource readyState:', eventSource.readyState);
      };

      // Start the search
      await createProfiles(subjects, sessionId);
      
    } catch (error) {
      console.error('Error starting search:', error);
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        errors: [...prev.errors, `Failed to start search: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }));
    }
  }, [searchState.isSearching, handleProgressUpdate]);

  const stopSearch = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setSearchState(prev => ({
      ...prev,
      isSearching: false,
      message: 'Search stopped by user',
    }));
  }, []);

  const clearSearch = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Clear session from localStorage
    localStorage.removeItem('currentSearchSessionId');
    
    setSearchState({
      isSearching: false,
      currentPhase: '',
      progress: 0,
      message: '',
      results: {},
      errors: [],
      searchLogs: [],
    });
  }, []);

  return {
    searchState,
    startSearch,
    stopSearch,
    clearSearch,
  };
}

