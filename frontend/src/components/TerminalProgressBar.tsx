import React from 'react';

interface TerminalProgressBarProps {
  progress: number; // 0-100
  width?: number; // number of blocks for the progress bar
}

export default function TerminalProgressBar({ progress, width = 20 }: TerminalProgressBarProps) {
  const filledBlocks = Math.round((progress / 100) * width);
  const emptyBlocks = width - filledBlocks;
  
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  
  return (
    <div className="terminal-text font-mono text-sm">
      <div className="mb-1">
        [{progressBar}] {Math.round(progress)}%
      </div>
    </div>
  );
}
