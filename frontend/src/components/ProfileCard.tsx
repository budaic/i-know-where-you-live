import React, { useState } from 'react';
import { Profile } from '../types';
import SourcesList from './SourcesList';

interface ProfileCardProps {
  profile: Profile;
  onDelete: (id: string) => void;
}

export default function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  const [showSources, setShowSources] = useState(false);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-sm text-gray-500">
            Created: {formatDate(profile.createdAt)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className={`px-3 py-1 rounded ${
            confirmDelete
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
          } transition-colors`}
        >
          {confirmDelete ? 'Confirm Delete?' : 'Delete'}
        </button>
      </div>

      {profile.aliases.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Aliases & Usernames:</h3>
          <div className="flex flex-wrap gap-2">
            {profile.aliases.map((alias, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Summary</h3>
        <p className="text-gray-700 whitespace-pre-line">{profile.profileSummary}</p>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setShowSources(!showSources)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span>{showSources ? '▼' : '▶'}</span>
          <span className="ml-2">
            {showSources ? 'Hide' : 'Show'} Sources ({profile.sources.length})
          </span>
        </button>

        {showSources && <SourcesList sources={profile.sources} />}
      </div>
    </div>
  );
}

