import React from 'react';
import { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  // Group sources by depth
  const sourcesByDepth = sources.reduce((acc, source) => {
    if (!acc[source.depth]) {
      acc[source.depth] = [];
    }
    acc[source.depth].push(source);
    return acc;
  }, {} as Record<number, Source[]>);

  const depths = Object.keys(sourcesByDepth)
    .map(Number)
    .sort((a, b) => a - b);

  const getDepthColor = (depth: number) => {
    if (depth <= 2) return 'bg-green-100 text-green-800 border-green-300';
    if (depth <= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const getDepthLabel = (depth: number) => {
    if (depth <= 2) return 'High Reliability';
    if (depth <= 4) return 'Medium Reliability';
    return 'Lower Reliability';
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">Sources</h3>
      
      {depths.map((depth) => (
        <div key={depth} className="mb-4">
          <div className="flex items-center mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDepthColor(depth)}`}>
              Depth {depth} - {getDepthLabel(depth)}
            </span>
            <span className="ml-2 text-sm text-gray-600">
              ({sourcesByDepth[depth].length} source{sourcesByDepth[depth].length !== 1 ? 's' : ''})
            </span>
          </div>
          
          <div className="space-y-2 ml-4">
            {sourcesByDepth[depth].map((source) => (
              <div
                key={source.id}
                className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium break-all"
                >
                  {source.url}
                </a>
                <p className="text-sm text-gray-700 mt-2">{source.siteSummary}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sources.length === 0 && (
        <p className="text-gray-500 italic">No sources found for this profile.</p>
      )}
    </div>
  );
}

