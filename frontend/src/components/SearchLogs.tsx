import React, { useState } from 'react';
import { SearchLog } from '../types';

interface SearchLogsProps {
  logs: SearchLog[];
}

export default function SearchLogs({ logs }: SearchLogsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        <span className="font-medium text-gray-700">
          {expanded ? '▼' : '▶'} Show Search Logs ({logs.length} phases)
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          {logs.map((log, index) => (
            <LogEntry key={index} log={log} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

interface LogEntryProps {
  log: SearchLog;
  index: number;
}

function LogEntry({ log, index }: LogEntryProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Determine phase color
  const getPhaseColor = (phase: string) => {
    if (phase.includes('LinkedIn')) return 'bg-blue-100 text-blue-800';
    if (phase.includes('GitHub')) return 'bg-purple-100 text-purple-800';
    if (phase.includes('Website')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const qualifiedCount = log.validatedResults.filter(
    v => v.isLikelyMatch && v.relevancyScore >= 6
  ).length;

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-sm font-medium ${getPhaseColor(log.phase)}`}>
              Phase {index + 1}: {log.phase}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="text-sm text-gray-700 mb-2">
            <strong>Query:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{log.query}</code>
          </div>

          <div className="flex gap-4 text-sm">
            <span>
              <strong>Results Found:</strong> {log.resultsFound}
            </span>
            <span className="text-green-600">
              <strong>Qualified (6-10):</strong> {qualifiedCount}
            </span>
          </div>

          {log.selectedUrl && (
            <div className="mt-2 text-sm">
              <strong className="text-green-600">✓ Selected Profile:</strong>{' '}
              <a href={log.selectedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {log.selectedUrl}
              </a>
            </div>
          )}

          {log.contextAdded && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              <strong>Context Added:</strong> {log.contextAdded}
            </div>
          )}
        </div>

        {log.validatedResults.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        )}
      </div>

      {showDetails && log.validatedResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Validation Results:</h4>
          {log.validatedResults.map((result, idx) => (
            <ValidationResultCard key={idx} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ValidationResultCardProps {
  result: any;
}

function ValidationResultCard({ result }: ValidationResultCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-green-700 text-white';
    if (score >= 7) return 'bg-green-500 text-white';
    if (score >= 6) return 'bg-yellow-500 text-white';
    if (score >= 4) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800',
    };
    return colors[confidence as keyof typeof colors] || colors.low;
  };

  return (
    <div className={`p-3 rounded border ${result.relevancyScore >= 6 ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
      <div className="flex items-start justify-between mb-2">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm flex-1 break-all"
        >
          {result.url}
        </a>
        <div className="flex gap-2 ml-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(result.relevancyScore)}`}>
            {result.relevancyScore}/10
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(result.confidence)}`}>
            {result.confidence}
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-700 mb-2">
        <strong>Match:</strong> {result.isLikelyMatch ? '✓ Yes' : '✗ No'}
      </div>

      <div className="text-sm text-gray-700 mb-2">
        <strong>Reasoning:</strong> {result.reasoning}
      </div>

      {result.prompt && (
        <div className="text-sm mt-2">
          <strong className="text-gray-700">Prompt:</strong>
          <div className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {result.prompt}
          </div>
        </div>
      )}

      {result.samePersonElements && result.samePersonElements.length > 0 && (
        <div className="text-sm mt-2">
          <strong className="text-green-600">Same Person Indicators:</strong>
          <ul className="list-disc ml-5 mt-1">
            {result.samePersonElements.map((element: string, idx: number) => (
              <li key={idx}>{element}</li>
            ))}
          </ul>
        </div>
      )}

      {result.differentPersonElements && result.differentPersonElements.length > 0 && (
        <div className="text-sm mt-2">
          <strong className="text-red-600">Different Person Indicators:</strong>
          <ul className="list-disc ml-5 mt-1">
            {result.differentPersonElements.map((element: string, idx: number) => (
              <li key={idx}>{element}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

