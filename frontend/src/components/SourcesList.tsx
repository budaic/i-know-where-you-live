import React from 'react';
import { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <p className="text-gray-600 text-center">No sources found.</p>
      </div>
    );
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 9) return 'bg-green-700 text-white';
    if (score >= 7) return 'bg-green-500 text-white';
    if (score >= 6) return 'bg-yellow-500 text-white';
    return 'bg-gray-400 text-white';
  };

  const getConfidenceBadge = (confidence?: string) => {
    if (!confidence) return 'bg-gray-100 text-gray-800';
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[confidence as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Sort sources by relevancy score (descending) if available
  const sortedSources = [...sources].sort((a, b) => {
    if (a.relevancyScore && b.relevancyScore) {
      return b.relevancyScore - a.relevancyScore;
    }
    if (a.relevancyScore) return -1;
    if (b.relevancyScore) return 1;
    return 0;
  });

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {sortedSources.map((source) => (
          <div 
            key={source.id} 
            className={`rounded-md p-4 border-2 ${
              source.relevancyScore && source.relevancyScore >= 6 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium break-all flex-1"
              >
                {source.url}
              </a>
              <div className="flex gap-2 ml-3">
                {source.relevancyScore && (
                  <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getScoreColor(source.relevancyScore)}`}>
                    {source.relevancyScore}/10
                  </span>
                )}
                {source.confidence && (
                  <span className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getConfidenceBadge(source.confidence)}`}>
                    {source.confidence}
                  </span>
                )}
              </div>
            </div>

            {source.validationReasoning && (
              <div className="mb-2 p-2 bg-white rounded border border-gray-200">
                <strong className="text-sm text-gray-700">Validation:</strong>
                <p className="text-sm text-gray-600 mt-1">{source.validationReasoning}</p>
              </div>
            )}

            <p className="text-sm text-gray-600">{source.siteSummary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
