import React, { useState } from 'react';
import { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  
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

  const toggleSource = (sourceId: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'profile': return '👤';
      case 'post': return '📝';
      case 'company': return '🏢';
      case 'other': return '🔗';
      default: return '📄';
    }
  };

  const getMatchStatusColor = (isLikelyMatch?: boolean) => {
    if (isLikelyMatch === true) return 'text-green-400';
    if (isLikelyMatch === false) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      {sortedSources.map((source) => (
        <div 
          key={source.id} 
          className="terminal-border p-5 font-mono bg-terminal-dark-gray hover:bg-terminal-gray transition-colors"
        >
          {/* Header with URL and Score */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{getCategoryIcon(source.category)}</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-link hover:text-terminal-green-bright break-all text-base font-medium"
                >
                  {source.url}
                </a>
              </div>
              
              {/* Status indicators */}
              <div className="flex items-center gap-4 text-sm">
                {source.relevancyScore && (
                  <span className="terminal-border px-2 py-1 terminal-text text-xs font-bold">
                    Score: {source.relevancyScore}/10
                  </span>
                )}
                {source.confidence && (
                  <span className={`px-2 py-1 text-xs font-bold ${getConfidenceColor(source.confidence)}`}>
                    {source.confidence.toUpperCase()}
                  </span>
                )}
                {source.isLikelyMatch !== undefined && (
                  <span className={`px-2 py-1 text-xs font-bold ${getMatchStatusColor(source.isLikelyMatch)}`}>
                    {source.isLikelyMatch ? '✓ MATCH' : '✗ NO MATCH'}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => toggleSource(source.id)}
              className="terminal-button text-xs px-3 py-1 ml-4 hover:bg-terminal-green hover:text-terminal-bg transition-colors"
            >
              {expandedSources.has(source.id) ? '▲ Less' : '▼ More'}
            </button>
          </div>

          {/* Summary */}
          <p className="terminal-description text-sm leading-relaxed mb-3">{source.siteSummary}</p>

          {/* Validation Reasoning */}
          {source.validationReasoning && (
            <div className="mb-3">
              <span className="terminal-text text-xs font-bold">Validation:</span>
              <p className="terminal-description text-xs mt-1">{source.validationReasoning}</p>
            </div>
          )}

          {/* Expanded Details */}
          {expandedSources.has(source.id) && (
            <div className="border-t border-terminal-border pt-4 mt-4 space-y-4">
              
              {/* Same Person Elements */}
              {source.samePersonElements && source.samePersonElements.length > 0 && (
                <div>
                  <h4 className="terminal-text text-sm font-bold mb-2 flex items-center gap-2">
                    <span className="text-green-400">✓</span> Matching Elements
                  </h4>
                  <div className="space-y-1">
                    {source.samePersonElements.map((element, index) => (
                      <div key={index} className="terminal-description text-xs bg-green-900/20 p-2 rounded border-l-2 border-green-400">
                        {element}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Different Person Elements */}
              {source.differentPersonElements && source.differentPersonElements.length > 0 && (
                <div>
                  <h4 className="terminal-text text-sm font-bold mb-2 flex items-center gap-2">
                    <span className="text-red-400">✗</span> Non-Matching Elements
                  </h4>
                  <div className="space-y-1">
                    {source.differentPersonElements.map((element, index) => (
                      <div key={index} className="terminal-description text-xs bg-red-900/20 p-2 rounded border-l-2 border-red-400">
                        {element}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Prompt/Reasoning */}
              {source.prompt && (
                <div>
                  <h4 className="terminal-text text-sm font-bold mb-2 flex items-center gap-2">
                    <span className="text-blue-400">🤖</span> AI Analysis
                  </h4>
                  <div className="terminal-description text-xs bg-blue-900/20 p-3 rounded border-l-2 border-blue-400">
                    <pre className="whitespace-pre-wrap">{source.prompt}</pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="terminal-text font-bold">Depth:</span>
                  <span className="terminal-description ml-2">{source.depth}</span>
                </div>
                <div>
                  <span className="terminal-text font-bold">Category:</span>
                  <span className="terminal-description ml-2">{source.category || 'Unknown'}</span>
                </div>
                <div>
                  <span className="terminal-text font-bold">Created:</span>
                  <span className="terminal-description ml-2">{new Date(source.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="terminal-text font-bold">ID:</span>
                  <span className="terminal-description ml-2 font-mono text-xs">{source.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
