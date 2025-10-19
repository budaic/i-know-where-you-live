import React, { useState } from 'react';
import SubjectForm from './components/SubjectForm';
import ProfileList from './components/ProfileList';
import LiveSearchProgress from './components/LiveSearchProgress';
import RevampedSearchDebugComponent from './components/RevampedSearchDebug';
import { useProfiles } from './hooks/useProfiles';
import { useLiveSearch } from './hooks/useLiveSearch';
import { Subject } from './types';

function App() {
  const { profiles, loading, error, createProfiles, deleteProfile } = useProfiles();
  const { searchState, startSearch, stopSearch, clearSearch } = useLiveSearch();
  const [creationStatus, setCreationStatus] = useState<{
    success?: string;
    errors?: string[];
  }>({});
  const [useLiveSearchMode, setUseLiveSearchMode] = useState(true);
  const [useRevampedSearch, setUseRevampedSearch] = useState(false);
  const [showDebugInterface, setShowDebugInterface] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  const handleCreateProfile = async (subjects: Subject[]) => {
    setCreationStatus({});
    
    if (useLiveSearchMode) {
      // Use live search mode
      try {
        await startSearch(subjects, useRevampedSearch);
      } catch (err) {
        setCreationStatus({
          errors: [err instanceof Error ? err.message : 'Failed to start live search'],
        });
      }
    } else {
      // Use traditional mode
      try {
        const response = await createProfiles(subjects, useRevampedSearch, showDebugInterface);
        
        // Store debug data if available
        if (response.debugData && response.debugData.length > 0) {
          setDebugData(response.debugData[0]); // Use first subject's debug data
        }
        
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

        {/* Search Mode Toggle */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Search Mode</h3>
              <p className="text-sm text-gray-600">
                {useLiveSearchMode 
                  ? 'Live search shows real-time progress and partial results' 
                  : 'Traditional search shows progress only after completion'
                }
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useLiveSearchMode}
                onChange={(e) => setUseLiveSearchMode(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useLiveSearchMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useLiveSearchMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {useLiveSearchMode ? 'Live Search' : 'Traditional'}
              </span>
            </label>
          </div>

          {/* Search System Toggle */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useRevampedSearch}
                onChange={(e) => setUseRevampedSearch(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useRevampedSearch ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useRevampedSearch ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {useRevampedSearch ? 'Revamped Search' : 'Legacy Search'}
              </span>
            </label>
          </div>

          {/* Debug Interface Toggle */}
          {useRevampedSearch && (
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDebugInterface}
                  onChange={(e) => setShowDebugInterface(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showDebugInterface ? 'bg-purple-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showDebugInterface ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Debug Interface
                </span>
              </label>
            </div>
          )}
        </div>

        <SubjectForm onSubmit={handleCreateProfile} loading={loading || searchState.isSearching} />

        {/* Live Search Progress */}
        {searchState.isSearching && (
          <LiveSearchProgress 
            searchState={searchState} 
            onStop={stopSearch}
          />
        )}

        {/* Debug Interface */}
        {showDebugInterface && debugData && (
          <RevampedSearchDebugComponent debugData={debugData} />
        )}

        {/* Search Completion Status */}
        {!searchState.isSearching && searchState.currentPhase === 'complete' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-green-800">Search completed successfully! Check the profiles below.</p>
            <button
              onClick={clearSearch}
              className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
            >
              Clear Search Results
            </button>
          </div>
        )}

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

        {loading && !searchState.isSearching && (
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

