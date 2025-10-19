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
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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
                <div>
                  <h2 className="terminal-text font-mono text-2xl font-bold">{profile.name}</h2>
                  <p className="terminal-description text-sm mt-1">
                    Created: {formatDate(profile.createdAt)} • {profile.sources.filter(s => (s.relevancyScore || 0) >= 6).length} valid sources
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="terminal-button text-sm px-4 py-2"
                  >
                    {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="terminal-button text-sm px-4 py-2"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Profile Summary */}
                <div>
                  <h3 className="terminal-text font-bold text-xl mb-4">📊 Intelligence Summary</h3>
                  <div className="terminal-description text-base leading-relaxed whitespace-pre-line bg-terminal-dark-gray p-4 terminal-border">
                    {profile.profileSummary}
                  </div>
                </div>

                {/* Aliases */}
                {profile.aliases.length > 0 && (
                  <div>
                    <h3 className="terminal-text font-bold text-xl mb-4">🏷️ Aliases & Usernames</h3>
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

                {/* Context Information */}
                {(profile.hardContext || profile.softContext || profile.generatedContext) && (
                  <div>
                    <h3 className="terminal-text font-bold text-xl mb-4">🎯 Context Information</h3>
                    <div className="space-y-4">
                      {profile.hardContext && (
                        <div>
                          <h4 className="terminal-text font-semibold mb-2">Hard Context (Must be true):</h4>
                          <div className="terminal-description text-sm bg-red-900/20 p-3 terminal-border border-l-4 border-red-400">
                            {profile.hardContext}
                          </div>
                        </div>
                      )}
                      {profile.softContext && (
                        <div>
                          <h4 className="terminal-text font-semibold mb-2">Soft Context (Could be true):</h4>
                          <div className="terminal-description text-sm bg-yellow-900/20 p-3 terminal-border border-l-4 border-yellow-400">
                            {profile.softContext}
                          </div>
                        </div>
                      )}
                      {profile.generatedContext && (
                        <div>
                          <h4 className="terminal-text font-semibold mb-2">Generated Context:</h4>
                          <div className="terminal-description text-sm bg-blue-900/20 p-3 terminal-border border-l-4 border-blue-400">
                            {profile.generatedContext.linkedinData && (
                              <div className="mb-2">
                                <strong>LinkedIn:</strong> {profile.generatedContext.linkedinData}
                              </div>
                            )}
                            {profile.generatedContext.githubData && (
                              <div className="mb-2">
                                <strong>GitHub:</strong> {profile.generatedContext.githubData}
                              </div>
                            )}
                            {profile.generatedContext.websiteData && (
                              <div className="mb-2">
                                <strong>Website:</strong> {profile.generatedContext.websiteData}
                              </div>
                            )}
                            {profile.generatedContext.additionalFindings.length > 0 && (
                              <div>
                                <strong>Additional Findings:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {profile.generatedContext.additionalFindings.map((finding, index) => (
                                    <li key={index}>{finding}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Valid Sources */}
                <div>
                  <h3 className="terminal-text font-bold text-xl mb-4">
                    🔗 Valid Sources ({profile.sources.filter(s => (s.relevancyScore || 0) >= 6).length})
                  </h3>
                  <SourcesList sources={profile.sources.filter(s => (s.relevancyScore || 0) >= 6)} />
                </div>

                {/* Debug Information */}
                {showDebugInfo && (
                  <div>
                    <h3 className="terminal-text font-bold text-xl mb-4">🔍 Debug Information</h3>
                    
                    {/* Search Logs */}
                    {profile.searchLogs && profile.searchLogs.length > 0 && (
                      <div className="mb-6">
                        <h4 className="terminal-text font-semibold mb-3">📋 Search Logs ({profile.searchLogs.length})</h4>
                        <div className="space-y-4">
                          {profile.searchLogs.map((log, index) => (
                            <div key={index} className="terminal-border p-4 bg-terminal-dark-gray">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="terminal-text font-medium">{log.phase}</h5>
                                <span className="terminal-description text-xs">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="terminal-description text-sm mb-2">Query: {log.query}</p>
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="terminal-text font-bold">Results Found:</span>
                                  <span className="terminal-description ml-2">{log.resultsFound}</span>
                                </div>
                                <div>
                                  <span className="terminal-text font-bold">Validated:</span>
                                  <span className="terminal-description ml-2">{log.validatedResults.length}</span>
                                </div>
                                {log.searchRound && (
                                  <div>
                                    <span className="terminal-text font-bold">Round:</span>
                                    <span className="terminal-description ml-2">{log.searchRound}/{log.totalRounds}</span>
                                  </div>
                                )}
                              </div>
                              {log.contextAdded && (
                                <div className="mt-2">
                                  <span className="terminal-text font-bold text-xs">Context Added:</span>
                                  <p className="terminal-description text-xs mt-1">{log.contextAdded}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Profile Metadata */}
                    <div className="terminal-border p-4 bg-terminal-dark-gray">
                      <h4 className="terminal-text font-semibold mb-3">📊 Profile Metadata</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="terminal-text font-bold">Profile ID:</span>
                          <span className="terminal-description ml-2 font-mono text-xs">{profile.id}</span>
                        </div>
                        <div>
                          <span className="terminal-text font-bold">Total Sources:</span>
                          <span className="terminal-description ml-2">{profile.sources.length}</span>
                        </div>
                        <div>
                          <span className="terminal-text font-bold">Valid Sources:</span>
                          <span className="terminal-description ml-2">{profile.sources.filter(s => (s.relevancyScore || 0) >= 6).length}</span>
                        </div>
                        <div>
                          <span className="terminal-text font-bold">Aliases:</span>
                          <span className="terminal-description ml-2">{profile.aliases.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

