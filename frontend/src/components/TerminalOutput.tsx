import React from 'react';
import { useTerminalHistory } from '../contexts/TerminalHistoryContext';
import TerminalProgressBar from './TerminalProgressBar';

export default function TerminalOutput() {
  const { entries } = useTerminalHistory();

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const getEntryIcon = (type: string, phase?: string) => {
    switch (type) {
      case 'command':
        return '$';
      case 'progress':
        switch (phase) {
          case 'linkedin': return '>>';
          case 'github': return '>>';
          case 'website': return '>>';
          case 'general': return '>>';
          case 'complete': return '>>';
          default: return '>>';
        }
      case 'error':
        return 'ERROR:';
      case 'success':
        return 'SUCCESS:';
      default:
        return '';
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'command':
        return 'terminal-green-bright';
      case 'progress':
        return 'terminal-text';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'info':
        return 'text-terminal-green-dim';
      default:
        return 'terminal-text';
    }
  };

  // Find the latest progress entry that's not complete
  const latestProgressEntry = entries
    .filter(entry => entry.type === 'progress' && entry.phase !== 'complete')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  const isLatestProgress = (entry: any) => entry.id === latestProgressEntry?.id;

  // Check if there's a success entry after the latest progress entry
  const hasSuccessAfterProgress = latestProgressEntry && entries.some(entry => 
    entry.type === 'success' && entry.timestamp > latestProgressEntry.timestamp
  );

  return (
    <div className="font-mono">
      <div className="space-y-1">
        {entries.length === 0 ? (
          <div className="terminal-text text-sm opacity-50">
            Terminal ready. Use profile_target command to start profiling.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start space-x-2">
              <span className="terminal-gray text-xs mt-0.5 min-w-[60px]">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className={`${getEntryColor(entry.type)} text-sm font-medium min-w-[20px]`}>
                {entry.type === 'command' ? '$' : getEntryIcon(entry.type, entry.phase)}
              </span>
              <div className="flex-1">
                <div className={`${getEntryColor(entry.type)} text-sm`}>
                  {entry.content}
                </div>
                        {/* Only show progress bar for the latest progress entry if no success entry follows */}
                        {entry.type === 'progress' && entry.progress !== undefined && isLatestProgress(entry) && !hasSuccessAfterProgress && (
                          <div className="mt-1">
                            <TerminalProgressBar progress={entry.progress} />
                          </div>
                        )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
