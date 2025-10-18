import React from 'react';
import { LiveSearchState } from '../types';

interface LiveSearchProgressProps {
  searchState: LiveSearchState;
  onStop?: () => void;
}

export default function LiveSearchProgress({ searchState, onStop }: LiveSearchProgressProps) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'github': return 'bg-purple-100 text-purple-800';
      case 'website': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-orange-100 text-orange-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'linkedin': return '💼';
      case 'github': return '💻';
      case 'website': return '🌐';
      case 'general': return '🔍';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'starting': return '🚀';
      case 'searching': return '🔍';
      case 'validating': return '✅';
      case 'completed': return '✨';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getPhaseIcon(searchState.currentPhase)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Live Search Progress
              {searchState.isRecovered && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Recovered
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">Session: {searchState.sessionId}</p>
            {searchState.startTime && (
              <p className="text-xs text-gray-500">
                Started: {searchState.startTime.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        {searchState.isSearching && onStop && (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Stop Search
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(searchState.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${searchState.progress}%` }}
          />
        </div>
      </div>

      {/* Current Phase */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getStatusIcon(searchState.currentPhase)}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(searchState.currentPhase)}`}>
            {searchState.currentPhase.charAt(0).toUpperCase() + searchState.currentPhase.slice(1)}
          </span>
        </div>
        <p className="text-gray-700">{searchState.message}</p>
      </div>

      {/* Errors */}
      {searchState.errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {searchState.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Search Logs */}
      {searchState.searchLogs.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Search Logs ({searchState.searchLogs.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {searchState.searchLogs.map((log, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPhaseColor(log.phase)}`}>
                  {log.phase}
                </span>
                <span className="text-gray-600">
                  {log.resultsFound} results found
                </span>
                {log.selectedUrl && (
                  <span className="text-green-600 text-xs">
                    ✓ Profile selected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partial Results Preview */}
      {searchState.results.generatedContext && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Partial Results</h4>
          <div className="space-y-2 text-sm">
            {searchState.results.generatedContext.linkedinData && (
              <div className="p-2 bg-blue-50 rounded">
                <strong className="text-blue-700">LinkedIn:</strong>
                <p className="text-gray-700 mt-1">{searchState.results.generatedContext.linkedinData}</p>
              </div>
            )}
            {searchState.results.generatedContext.githubData && (
              <div className="p-2 bg-purple-50 rounded">
                <strong className="text-purple-700">GitHub:</strong>
                <p className="text-gray-700 mt-1">{searchState.results.generatedContext.githubData}</p>
              </div>
            )}
            {searchState.results.generatedContext.websiteData && (
              <div className="p-2 bg-green-50 rounded">
                <strong className="text-green-700">Website:</strong>
                <p className="text-gray-700 mt-1">{searchState.results.generatedContext.websiteData}</p>
              </div>
            )}
            {searchState.results.generatedContext.additionalFindings && 
             searchState.results.generatedContext.additionalFindings.length > 0 && (
              <div className="p-2 bg-orange-50 rounded">
                <strong className="text-orange-700">Additional Findings:</strong>
                <p className="text-gray-700 mt-1">
                  {searchState.results.generatedContext.additionalFindings.length} findings
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
