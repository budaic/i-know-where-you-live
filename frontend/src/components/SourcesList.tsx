import React from 'react';
import { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  // Filter to only show valid sources (score >= 6)
  const validSources = sources.filter(source => (source.relevancyScore || 0) >= 6);
  
  if (!validSources || validSources.length === 0) {
    return (
      <div className="terminal-text text-center py-4 font-mono">
        No valid sources found.
      </div>
    );
  }

  // Sort sources by relevancy score (descending)
  const sortedSources = [...validSources].sort((a, b) => {
    if (a.relevancyScore && b.relevancyScore) {
      return b.relevancyScore - a.relevancyScore;
    }
    if (a.relevancyScore) return -1;
    if (b.relevancyScore) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {sortedSources.map((source) => (
        <div 
          key={source.id} 
          className="terminal-border p-5 font-mono bg-terminal-dark-gray"
        >
          <div className="flex items-start justify-between mb-4">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link hover:text-terminal-green-bright break-all flex-1 text-base font-medium"
            >
              {source.url}
            </a>
            {source.relevancyScore && (
              <span className="terminal-border px-3 py-1 terminal-text text-sm font-bold ml-4">
                {source.relevancyScore}/10
              </span>
            )}
          </div>

          <p className="terminal-description text-sm leading-relaxed">{source.siteSummary}</p>
        </div>
      ))}
    </div>
  );
}
