import React from 'react';
import { Profile } from '../types';
import ProfileCard from './ProfileCard';

interface ProfileListProps {
  profiles: Profile[];
  onDelete: (id: string) => void;
}

export default function ProfileList({ profiles, onDelete }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="terminal-bg terminal-border p-8 text-center font-mono">
        <p className="terminal-text text-lg">No intelligence files found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="terminal-text font-mono text-2xl font-bold mb-4">
        Intelligence Files ({profiles.length})
      </h2>
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} onDelete={onDelete} mode="expanded" />
      ))}
    </div>
  );
}

