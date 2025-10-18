import React, { useState } from 'react';
import { Subject } from '../types';

interface SubjectFormProps {
  onSubmit: (subjects: Subject[]) => void;
  loading: boolean;
}

export default function SubjectForm({ onSubmit, loading }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const maxDepth = 6; // Fixed at 6 as per specification

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a subject name');
      return;
    }

    const subject: Subject = {
      name: name.trim(),
      context: context.trim(),
      maxDepth,
    };

    onSubmit([subject]);
    
    // Reset form
    setName('');
    setContext('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Create New Profile</h2>
      <p className="text-gray-600 mb-4">
        Enter information about a person to create an OSINT profile. This is for educational purposes only.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Subject Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Smith"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
            Context
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., An engineering student at SUTD"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Additional information to help narrow down the search (job, education, location, etc.)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>Search Depth:</strong> Fixed at 6 levels (0-6) for optimal balance between specificity and coverage.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors`}
        >
          {loading ? 'Processing...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}

