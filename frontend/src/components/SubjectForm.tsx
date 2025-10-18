import React, { useState } from 'react';
import { Subject } from '../types';
import { parseName } from '../utils/nameParser';

interface SubjectFormProps {
  onSubmit: (subjects: Subject[]) => void;
  loading: boolean;
}

export default function SubjectForm({ onSubmit, loading }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [hardContext, setHardContext] = useState('');
  const [softContext, setSoftContext] = useState('');
  const maxDepth = 6; // Fixed at 6 as per specification

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a subject name');
      return;
    }

    // Parse the name to validate format
    const { firstName, lastName } = parseName(name.trim());
    if (!firstName || !lastName) {
      alert('Please enter both first name and last name (e.g., "John Smith" or "John Michael Smith")');
      return;
    }

    const subject: Subject = {
      name: name.trim(),
      hardContext: hardContext.trim(),
      softContext: softContext.trim(),
      maxDepth,
    };

    onSubmit([subject]);
    
    // Reset form
    setName('');
    setHardContext('');
    setSoftContext('');
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
            placeholder="e.g., John Michael Smith"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            <strong>Format:</strong> FIRSTNAME MIDDLENAME1 MIDDLENAME2 LASTNAME (separated by spaces only)
          </p>
          <p className="text-sm text-gray-500">
            <strong>Examples:</strong> "John Smith", "John Michael Smith", "Sarah Jane Doe"
          </p>
        </div>

        <div>
          <label htmlFor="hardContext" className="block text-sm font-medium text-gray-700 mb-1">
            Hard Context (Facts that MUST be true) *
          </label>
          <textarea
            id="hardContext"
            value={hardContext}
            onChange={(e) => setHardContext(e.target.value)}
            placeholder="e.g., Engineering student at SUTD in Singapore"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            <strong>Certainties:</strong> Information that must be true (job, education, location, etc.)
          </p>
        </div>

        <div>
          <label htmlFor="softContext" className="block text-sm font-medium text-gray-700 mb-1">
            Soft Context (Possible hints/guidance)
          </label>
          <textarea
            id="softContext"
            value={softContext}
            onChange={(e) => setSoftContext(e.target.value)}
            placeholder="e.g., Interested in AI, may have GitHub account, possibly worked at tech companies"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            <strong>Guidance:</strong> Information that could be true - helps guide the search
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>New 4-Phase System:</strong> LinkedIn → GitHub → Website → General Queries. Only sources scoring 6-10/10 are included.
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

