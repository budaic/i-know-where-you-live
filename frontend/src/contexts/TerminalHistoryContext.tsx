import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'progress' | 'error' | 'success' | 'info';
  content: string;
  timestamp: Date;
  phase?: string;
  progress?: number;
}

interface TerminalHistoryContextType {
  entries: TerminalEntry[];
  addEntry: (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  getEntriesByType: (type: TerminalEntry['type']) => TerminalEntry[];
  commandHistory: string[];
  addCommandToHistory: (command: string) => void;
  clearCommandHistory: () => void;
}

const TerminalHistoryContext = createContext<TerminalHistoryContextType | undefined>(undefined);

export function TerminalHistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const addEntry = (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => {
    const newEntry: TerminalEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const clearHistory = () => {
    setEntries([]);
  };

  const getEntriesByType = (type: TerminalEntry['type']) => {
    return entries.filter(entry => entry.type === type);
  };

  const addCommandToHistory = (command: string) => {
    const trimmedCommand = command.trim();
    if (trimmedCommand && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== trimmedCommand)) {
      setCommandHistory(prev => [...prev, trimmedCommand]);
    }
  };

  const clearCommandHistory = () => {
    setCommandHistory([]);
  };

  return (
    <TerminalHistoryContext.Provider value={{
      entries,
      addEntry,
      clearHistory,
      getEntriesByType,
      commandHistory,
      addCommandToHistory,
      clearCommandHistory,
    }}>
      {children}
    </TerminalHistoryContext.Provider>
  );
}

export function useTerminalHistory() {
  const context = useContext(TerminalHistoryContext);
  if (context === undefined) {
    throw new Error('useTerminalHistory must be used within a TerminalHistoryProvider');
  }
  return context;
}
