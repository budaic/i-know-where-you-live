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
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No profiles yet. Create your first profile above!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Saved Profiles ({profiles.length})</h2>
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} onDelete={onDelete} />
      ))}
    </div>
  );
}

