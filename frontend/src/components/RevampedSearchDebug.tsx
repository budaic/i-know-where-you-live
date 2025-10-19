import React, { useState } from 'react';
import { RevampedSearchDebug, RevampedSearchRound, RevampedSearchStep } from '../types';

interface RevampedSearchDebugProps {
  debugData: RevampedSearchDebug;
}

export default function RevampedSearchDebugComponent({ debugData }: RevampedSearchDebugProps) {
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleRound = (roundNumber: number) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(roundNumber)) {
      newExpanded.delete(roundNumber);
    } else {
      newExpanded.add(roundNumber);
    }
    setExpandedRounds(newExpanded);
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (stepType: RevampedSearchStep['stepType']) => {
    switch (stepType) {
      case 'query_generation': return '📋';
      case 'search_execution': return '🔍';
      case 'name_validation': return '👤';
      case 'context_validation': return '✅';
      case 'point_generation': return '📝';
      case 'confidence_scoring': return '📊';
      default: return '📌';
    }
  };

  const getStepColor = (stepType: RevampedSearchStep['stepType']) => {
    switch (stepType) {
      case 'query_generation': return 'bg-blue-100 text-blue-800';
      case 'search_execution': return 'bg-green-100 text-green-800';
      case 'name_validation': return 'bg-yellow-100 text-yellow-800';
      case 'context_validation': return 'bg-purple-100 text-purple-800';
      case 'point_generation': return 'bg-orange-100 text-orange-800';
      case 'confidence_scoring': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Revamped Search Debug</h3>
        <div className="text-sm text-gray-600">
          Duration: {formatDuration(debugData.totalDuration)}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{debugData.totalResultsCollected}</div>
          <div className="text-sm text-blue-800">Results Collected</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{debugData.totalResultsProcessed}</div>
          <div className="text-sm text-green-800">Results Processed</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{debugData.totalResultsValid}</div>
          <div className="text-sm text-purple-800">Valid Results</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{debugData.totalContextPoints}</div>
          <div className="text-sm text-orange-800">Context Points</div>
        </div>
      </div>

      {/* Overall Confidence */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Confidence</span>
          <span className="text-sm text-gray-600">{(debugData.overallConfidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${debugData.overallConfidence * 100}%` }}
          />
        </div>
      </div>

      {/* Errors and Warnings */}
      {(debugData.errors.length > 0 || debugData.warnings.length > 0) && (
        <div className="mb-6">
          {debugData.errors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <h4 className="text-red-800 font-semibold mb-2">Errors ({debugData.errors.length})</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {debugData.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          {debugData.warnings.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="text-yellow-800 font-semibold mb-2">Warnings ({debugData.warnings.length})</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                {debugData.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Search Rounds */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Search Rounds ({debugData.rounds.length})</h4>
        {debugData.rounds.map((round) => (
          <div key={round.roundNumber} className="border border-gray-200 rounded-lg">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              onClick={() => toggleRound(round.roundNumber)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{expandedRounds.has(round.roundNumber) ? '📂' : '📁'}</span>
                <div>
                  <h5 className="font-medium text-gray-800">Round {round.roundNumber}/{round.totalRounds}</h5>
                  <p className="text-sm text-gray-600">
                    {round.resultsValid} valid results • {round.contextPointsGenerated} context points • 
                    Avg confidence: {(round.averageConfidence * 100).toFixed(1)}% • 
                    Duration: {formatDuration(round.duration)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatTimestamp(round.startTime)} - {formatTimestamp(round.endTime)}
              </div>
            </div>

            {expandedRounds.has(round.roundNumber) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Round Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{round.resultsCollected}</div>
                    <div className="text-xs text-blue-800">Collected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{round.resultsProcessed}</div>
                    <div className="text-xs text-green-800">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{round.resultsValid}</div>
                    <div className="text-xs text-purple-800">Valid</div>
                  </div>
                </div>

                {/* Queries */}
                <div className="mb-4">
                  <h6 className="font-medium text-gray-700 mb-2">Queries ({round.queries.length})</h6>
                  <div className="space-y-2">
                    {round.queries.map((query, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{query.query}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            query.type === 'simple' ? 'bg-blue-100 text-blue-800' :
                            query.type === 'hard-context' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {query.type}
                          </span>
                        </div>
                        {query.actualResults !== undefined && (
                          <div className="text-sm text-gray-600 mt-1">
                            Results: {query.actualResults}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h6 className="font-medium text-gray-700 mb-2">Steps ({round.steps.length})</h6>
                  <div className="space-y-2">
                    {round.steps.map((step) => (
                      <div key={step.stepId} className="bg-white rounded border">
                        <div
                          className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => toggleStep(step.stepId)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getStepIcon(step.stepType)}</span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStepColor(step.stepType)}`}>
                                  {step.stepType.replace('_', ' ')}
                                </span>
                                {step.confidence !== undefined && (
                                  <span className="text-sm text-gray-600">
                                    Confidence: {(step.confidence * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{step.details}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTimestamp(step.timestamp)}
                          </div>
                        </div>

                        {expandedSteps.has(step.stepId) && (
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {step.query && (
                                <div>
                                  <span className="font-medium text-gray-700">Query:</span>
                                  <p className="text-gray-600">{step.query}</p>
                                </div>
                              )}
                              {step.resultsCount !== undefined && (
                                <div>
                                  <span className="font-medium text-gray-700">Results:</span>
                                  <p className="text-gray-600">{step.resultsCount}</p>
                                </div>
                              )}
                              {step.processedCount !== undefined && (
                                <div>
                                  <span className="font-medium text-gray-700">Processed:</span>
                                  <p className="text-gray-600">{step.processedCount}</p>
                                </div>
                              )}
                              {step.validCount !== undefined && (
                                <div>
                                  <span className="font-medium text-gray-700">Valid:</span>
                                  <p className="text-gray-600">{step.validCount}</p>
                                </div>
                              )}
                            </div>
                            {step.errors && step.errors.length > 0 && (
                              <div className="mt-3">
                                <span className="font-medium text-red-700">Errors:</span>
                                <ul className="text-red-600 text-sm mt-1">
                                  {step.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generated Context */}
      {debugData.generatedContext && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Generated Context</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{debugData.generatedContext}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
