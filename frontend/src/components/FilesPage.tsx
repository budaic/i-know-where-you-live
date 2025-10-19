import React from 'react';
import { Profile } from '../types';
import ProfileCard from './ProfileCard';

interface FilesPageProps {
  profiles: Profile[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

export default function FilesPage({ profiles, onDelete, onBack }: FilesPageProps) {
  return (
    <div className="min-h-screen terminal-bg">
      {/* Header */}
      <header className="terminal-bg border-b border-terminal-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-mono terminal-text terminal-glow">
              TERMIN<span className="terminal-white">AI</span>L v1.0.0
            </h1>
            <p className="text-sm terminal-text mt-1">
              INTELLIGENCE FILES DIRECTORY
            </p>
          </div>
          
          <button
            onClick={onBack}
            className="terminal-button"
          >
            cd /terminal
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {profiles.length === 0 ? (
          <div className="terminal-bg terminal-border p-8 text-center font-mono">
            <p className="terminal-text text-lg">No intelligence files found.</p>
            <p className="terminal-description text-sm mt-2">Create your first profile to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="terminal-text font-mono text-2xl font-bold mb-2">
                Intelligence Files ({profiles.length})
              </h2>
              <p className="terminal-description text-sm">
                Click the folders to view detailed intelligence reports.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  onDelete={onDelete}
                  mode="compact"
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
