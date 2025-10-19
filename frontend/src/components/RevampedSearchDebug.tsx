import React, { useState } from 'react';
import { RevampedSearchDebug, RevampedSearchRound, RevampedSearchStep, SearchQuery } from '../types';

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

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="terminal-bg terminal-border p-6 mb-6 font-mono">
      <div className="flex items-center justify-between mb-6">
        <h3 className="terminal-text text-xl font-bold">🔍 Revamped Search Debug</h3>
        <div className="terminal-description text-sm">
          Duration: {formatDuration(debugData.totalDuration)}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="terminal-border p-4 bg-terminal-dark-gray">
          <div className="text-2xl font-bold text-blue-400">{debugData.totalResultsCollected}</div>
          <div className="terminal-description text-sm">Results Collected</div>
        </div>
        <div className="terminal-border p-4 bg-terminal-dark-gray">
          <div className="text-2xl font-bold text-green-400">{debugData.totalResultsProcessed}</div>
          <div className="terminal-description text-sm">Results Processed</div>
        </div>
        <div className="terminal-border p-4 bg-terminal-dark-gray">
          <div className="text-2xl font-bold text-purple-400">{debugData.totalResultsValid}</div>
          <div className="terminal-description text-sm">Valid Results</div>
        </div>
        <div className="terminal-border p-4 bg-terminal-dark-gray">
          <div className="text-2xl font-bold text-orange-400">{debugData.totalContextPoints}</div>
          <div className="terminal-description text-sm">Context Points</div>
        </div>
      </div>

      {/* Overall Confidence */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="terminal-text text-sm font-medium">Overall Confidence</span>
          <span className="terminal-description text-sm">{(debugData.overallConfidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-terminal-gray rounded-full h-2">
          <div
            className="bg-terminal-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${debugData.overallConfidence * 100}%` }}
          />
        </div>
      </div>

      {/* Errors and Warnings */}
      {(debugData.errors.length > 0 || debugData.warnings.length > 0) && (
        <div className="mb-6">
          {debugData.errors.length > 0 && (
            <div className="terminal-border border-l-4 border-red-400 p-4 mb-4 bg-red-900/20">
              <h4 className="text-red-400 font-semibold mb-2">⚠️ Errors ({debugData.errors.length})</h4>
              <ul className="text-red-300 text-sm space-y-1">
                {debugData.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          {debugData.warnings.length > 0 && (
            <div className="terminal-border border-l-4 border-yellow-400 p-4 bg-yellow-900/20">
              <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Warnings ({debugData.warnings.length})</h4>
              <ul className="text-yellow-300 text-sm space-y-1">
                {debugData.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Search Rounds */}
      <div className="space-y-4">
        <h4 className="terminal-text text-lg font-semibold">🔍 Search Rounds ({debugData.rounds.length})</h4>
        {debugData.rounds.map((round: RevampedSearchRound) => (
          <div key={round.roundNumber} className="terminal-border bg-terminal-dark-gray">
            <div
              className="p-4 cursor-pointer hover:bg-terminal-gray flex items-center justify-between transition-colors"
              onClick={() => toggleRound(round.roundNumber)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{expandedRounds.has(round.roundNumber) ? '📂' : '📁'}</span>
                <div>
                  <h5 className="terminal-text font-medium">Round {round.roundNumber}/{round.totalRounds}</h5>
                  <p className="terminal-description text-sm">
                    {round.resultsValid} valid results • {round.contextPointsGenerated} context points • 
                    Avg confidence: {(round.averageConfidence * 100).toFixed(1)}% • 
                    Duration: {formatDuration(round.duration)}
                  </p>
                </div>
              </div>
              <div className="terminal-description text-sm">
                {formatTimestamp(round.startTime)} - {formatTimestamp(round.endTime)}
              </div>
            </div>

            {expandedRounds.has(round.roundNumber) && (
              <div className="border-t border-terminal-border p-4 bg-terminal-gray">
                {/* Round Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{round.resultsCollected}</div>
                    <div className="terminal-description text-xs">Collected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{round.resultsProcessed}</div>
                    <div className="terminal-description text-xs">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{round.resultsValid}</div>
                    <div className="terminal-description text-xs">Valid</div>
                  </div>
                </div>

                {/* Queries */}
                <div className="mb-4">
                  <h6 className="terminal-text font-medium mb-2">📋 Queries ({round.queries.length})</h6>
                  <div className="space-y-2">
                    {round.queries.map((query: SearchQuery, index: number) => (
                      <div key={index} className="terminal-bg p-3 terminal-border">
                        <div className="flex items-center justify-between">
                          <span className="terminal-text font-medium">{query.query}</span>
                          <span className={`px-2 py-1 terminal-border text-xs font-medium ${
                            query.type === 'simple' ? 'text-blue-400' :
                            query.type === 'hard-context' ? 'text-green-400' :
                            'text-orange-400'
                          }`}>
                            {query.type}
                          </span>
                        </div>
                        {query.actualResults !== undefined && (
                          <div className="terminal-description text-sm mt-1">
                            Results: {query.actualResults}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h6 className="terminal-text font-medium mb-2">⚙️ Steps ({round.steps.length})</h6>
                  <div className="space-y-2">
                    {round.steps.map((step: RevampedSearchStep) => (
                      <div key={step.stepId} className="terminal-bg terminal-border">
                        <div
                          className="p-3 cursor-pointer hover:bg-terminal-gray flex items-center justify-between transition-colors"
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
                              <p className="terminal-description text-sm mt-1">{step.details}</p>
                            </div>
                          </div>
                          <div className="terminal-description text-sm">
                            {formatTimestamp(step.timestamp)}
                          </div>
                        </div>

                        {expandedSteps.has(step.stepId) && (
                          <div className="border-t border-terminal-border p-3 bg-terminal-gray">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {step.query && (
                                <div>
                                  <span className="terminal-text font-medium">Query:</span>
                                  <p className="terminal-description">{step.query}</p>
                                </div>
                              )}
                              {step.resultsCount !== undefined && (
                                <div>
                                  <span className="terminal-text font-medium">Results:</span>
                                  <p className="terminal-description">{step.resultsCount}</p>
                                </div>
                              )}
                              {step.processedCount !== undefined && (
                                <div>
                                  <span className="terminal-text font-medium">Processed:</span>
                                  <p className="terminal-description">{step.processedCount}</p>
                                </div>
                              )}
                              {step.validCount !== undefined && (
                                <div>
                                  <span className="terminal-text font-medium">Valid:</span>
                                  <p className="terminal-description">{step.validCount}</p>
                                </div>
                              )}
                            </div>
                            {step.errors && step.errors.length > 0 && (
                              <div className="mt-3">
                                <span className="terminal-text font-medium text-red-400">Errors:</span>
                                <ul className="text-red-300 text-sm mt-1">
                                  {step.errors.map((error: string, index: number) => (
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
          <h4 className="terminal-text text-lg font-semibold mb-3">📝 Generated Context</h4>
          <div className="terminal-border p-4 bg-terminal-dark-gray">
            <pre className="terminal-description text-sm whitespace-pre-wrap">{debugData.generatedContext}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
