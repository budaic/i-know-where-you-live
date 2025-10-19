import React, { useState } from 'react';
import { Profile } from '../types';
import SourcesList from './SourcesList';

interface ProfileCardProps {
  profile: Profile;
  onDelete: (id: string) => void;
  mode?: 'compact' | 'expanded';
}

export default function ProfileCard({ profile, onDelete, mode = 'compact' }: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(profile.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Compact mode for directory view
  if (mode === 'compact') {
    return (
      <div className="terminal-bg terminal-border p-5 font-mono bg-terminal-dark-gray">
        <div className="mb-3">
          <h3 className="terminal-text font-bold text-lg mb-2">{profile.name}</h3>
          <p className="terminal-description text-sm mb-3 leading-relaxed">
            {profile.profileSummary.substring(0, 150)}
            {profile.profileSummary.length > 150 ? '...' : ''}
          </p>
          <div className="flex justify-between items-center">
            <p className="terminal-gray text-xs">
              {formatDate(profile.createdAt)} • {profile.sources.filter(s => (s.relevancyScore || 0) >= 6).length} valid sources
            </p>
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="terminal-button text-sm px-3 py-1 flex items-center justify-center hover:bg-terminal-green hover:text-terminal-bg transition-colors group"
                      title="Open Profile"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="terminal-text group-hover:fill-black transition-colors">
                        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                      </svg>
                    </button>
          </div>
        </div>

        {/* Expanded Modal */}
        {isExpanded && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
            <div className="terminal-bg terminal-border w-full h-full max-w-6xl max-h-[95vh] m-4 flex flex-col">
              {/* Header */}
              <div className="terminal-border-b p-6 flex justify-between items-center">
                <h2 className="terminal-text font-mono text-2xl font-bold">{profile.name}</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="terminal-button text-sm px-4 py-2"
                >
                  Close
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Profile Summary */}
                <div>
                  <h3 className="terminal-text font-bold text-xl mb-4">Intelligence Summary</h3>
                  <div className="terminal-description text-base leading-relaxed whitespace-pre-line bg-terminal-dark-gray p-4 rounded">
                    {profile.profileSummary}
                  </div>
                </div>

                {/* Valid Sources */}
                <div>
                  <h3 className="terminal-text font-bold text-xl mb-4">
                    Valid Sources ({profile.sources.filter(s => (s.relevancyScore || 0) >= 6).length})
                  </h3>
                  <SourcesList sources={profile.sources.filter(s => (s.relevancyScore || 0) >= 6)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded mode (original functionality, but with terminal styling)
  return (
    <div className="terminal-bg terminal-border p-6 mb-4 font-mono">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="terminal-text font-bold text-2xl">{profile.name}</h2>
          <p className="terminal-gray text-sm">
            Created: {formatDate(profile.createdAt)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className={`terminal-button text-sm px-3 py-1 ${
            confirmDelete ? 'bg-red-500 text-white' : ''
          }`}
        >
          {confirmDelete ? 'Confirm Delete?' : 'Delete'}
        </button>
      </div>

      {profile.aliases.length > 0 && (
        <div className="mb-4">
          <h3 className="terminal-text font-bold mb-2">Aliases & Usernames:</h3>
          <div className="flex flex-wrap gap-2">
            {profile.aliases.map((alias, index) => (
              <span
                key={index}
                className="terminal-border px-3 py-1 terminal-text text-sm"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="terminal-text font-bold text-lg mb-2">Profile Summary</h3>
        <p className="terminal-text text-sm leading-relaxed whitespace-pre-line">{profile.profileSummary}</p>
      </div>

      <div className="terminal-border-t pt-4">
        <h3 className="terminal-text font-bold text-lg mb-3">
          Valid Sources ({profile.sources.filter(s => (s.relevancyScore || 0) >= 6).length})
        </h3>
        <SourcesList sources={profile.sources.filter(s => (s.relevancyScore || 0) >= 6)} />
      </div>
    </div>
  );
}

