import React from 'react';

interface TerminalHeaderProps {
  onRunProfile?: () => void;
  onOpenFiles?: () => void;
  isSearching?: boolean;
  profilesCount?: number;
}

export default function TerminalHeader({ onRunProfile, onOpenFiles, isSearching, profilesCount }: TerminalHeaderProps) {
  return (
    <header className="terminal-bg border-b border-terminal-border py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-mono terminal-text terminal-glow">
            TERMIN<span className="terminal-white">AI</span>L v1.0.0
          </h1>
          <p className="text-sm terminal-text mt-1">
            OPEN SOURCE INTELLIGENCE SYSTEM
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {onOpenFiles && (
            <button
              onClick={onOpenFiles}
              className="terminal-button px-4 py-2 min-w-[140px] h-10 flex items-center justify-center"
            >
              cd /files {profilesCount !== undefined && `(${profilesCount})`}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
