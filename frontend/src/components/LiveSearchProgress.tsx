import React from 'react';
import { LiveSearchState } from '../types';
import TerminalProgressBar from './TerminalProgressBar';

interface LiveSearchProgressProps {
  searchState: LiveSearchState;
  onStop?: () => void;
}

export default function LiveSearchProgress({ searchState, onStop }: LiveSearchProgressProps) {
  const getPhaseMessage = (phase: string) => {
    switch (phase) {
      case 'linkedin': return '>> identifying individual...';
      case 'github': return '>> acquiring profiles and usernames...';
      case 'website': return '>> scanning personal domains...';
      case 'general': return '>> gathering additional intel...';
      case 'complete': return '>> PROFILING COMPLETE. Navigate to /files directory';
      case 'error': return '>> ERROR: Operation failed';
      default: return '>> initializing...';
    }
  };

  if (!searchState.isSearching && searchState.currentPhase !== 'complete') {
    return null;
  }

  return (
    <div className="terminal-bg terminal-border p-6 mb-6 font-mono">
      <div className="space-y-2">
        {/* Progress Updates Stack */}
        {searchState.searchLogs.map((log, index) => (
          <div key={index} className="terminal-text text-sm">
            <div>{getPhaseMessage(log.phase)}</div>
          </div>
        ))}
        
        {/* Current Phase */}
        {searchState.currentPhase && searchState.currentPhase !== 'complete' && (
          <div className="terminal-text text-sm">
            <div>{getPhaseMessage(searchState.currentPhase)}</div>
            <div className="mt-1">
              <TerminalProgressBar progress={searchState.progress} />
            </div>
          </div>
        )}

        {/* Completion Message */}
        {searchState.currentPhase === 'complete' && (
          <div className="terminal-text text-sm">
            <div>{getPhaseMessage('complete')}</div>
          </div>
        )}

        {/* Errors */}
        {searchState.errors.length > 0 && (
          <div className="terminal-text text-sm">
            {searchState.errors.map((error, index) => (
              <div key={index} className="text-red-400">
                {'>> ERROR: '}{error}
              </div>
            ))}
          </div>
        )}

        {/* Stop Button */}
        {searchState.isSearching && onStop && (
          <div className="mt-4">
            <button
              onClick={onStop}
              className="terminal-button text-sm px-4 py-1"
            >
              Abort Operation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
