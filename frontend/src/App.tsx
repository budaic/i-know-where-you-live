import React, { useState } from 'react';
import SubjectForm from './components/SubjectForm';
import ProfileList from './components/ProfileList';
import { useProfiles } from './hooks/useProfiles';
import { Subject } from './types';

function App() {
  const { profiles, loading, error, createProfiles, deleteProfile } = useProfiles();
  const [creationStatus, setCreationStatus] = useState<{
    success?: string;
    errors?: string[];
  }>({});

  const handleCreateProfile = async (subjects: Subject[]) => {
    setCreationStatus({});
    
    try {
      const response = await createProfiles(subjects);
      
      const successCount = response.profiles.length;
      
      setCreationStatus({
        success: `Successfully created ${successCount} profile${successCount !== 1 ? 's' : ''}!`,
        errors: response.errors,
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setCreationStatus(prev => ({ ...prev, success: undefined }));
      }, 5000);
    } catch (err) {
      setCreationStatus({
        errors: [err instanceof Error ? err.message : 'Failed to create profile'],
      });
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
    } catch (err) {
      alert('Failed to delete profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">OSINT Profiler</h1>
          <p className="text-blue-100 mt-1">
            Educational tool demonstrating online information exposure
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Warning:</strong> This tool is for educational purposes only. 
            Always respect privacy and obtain consent before researching individuals.
          </p>
        </div>

        <SubjectForm onSubmit={handleCreateProfile} loading={loading} />

        {creationStatus.success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-green-800">{creationStatus.success}</p>
          </div>
        )}

        {creationStatus.errors && creationStatus.errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-800 font-semibold mb-2">Errors occurred:</p>
            <ul className="list-disc list-inside">
              {creationStatus.errors.map((err, idx) => (
                <li key={idx} className="text-red-700">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-800">Processing profile... This may take several minutes.</p>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        <ProfileList profiles={profiles} onDelete={handleDeleteProfile} />
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>OSINT Profiler - Educational Purposes Only</p>
          <p className="text-sm mt-2">
            Demonstrating how easily personal information can be gathered from public sources
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

