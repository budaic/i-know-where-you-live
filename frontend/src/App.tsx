import React, { useState, useEffect, useRef } from 'react';
import TerminalHeader from './components/TerminalHeader';
import TerminalCommandLine from './components/TerminalCommandLine';
import TerminalOutput from './components/TerminalOutput';
import FilesPage from './components/FilesPage';
import SubjectForm, { SubjectFormRef } from './components/SubjectForm';
import { TerminalHistoryProvider, useTerminalHistory } from './contexts/TerminalHistoryContext';
import { useProfiles } from './hooks/useProfiles';
import { useLiveSearch } from './hooks/useLiveSearch';
import { Subject } from './types';

function AppContent() {
  const { profiles, loading, deleteProfile, refreshProfiles } = useProfiles();
  const { searchState, startSearch } = useLiveSearch();
  const { addEntry } = useTerminalHistory();
  const [currentPage, setCurrentPage] = useState<'terminal' | 'files'>('terminal');
  const [showInputForm, setShowInputForm] = useState(false);
  const formRef = useRef<SubjectFormRef>(null);

  // Refresh profiles when search completes
  useEffect(() => {
    if (!searchState.isSearching && searchState.currentPhase === 'complete') {
      refreshProfiles();
    }
  }, [searchState.isSearching, searchState.currentPhase, refreshProfiles]);

  // Track the last logged phase to avoid duplicate entries
  const [lastLoggedPhase, setLastLoggedPhase] = useState<string>('');

  // Add terminal entries when search state changes
  useEffect(() => {
    if (searchState.isSearching && searchState.currentPhase !== lastLoggedPhase) {
      const phaseMessages: { [key: string]: string } = {
        'linkedin': 'identifying individual...',
        'github': 'acquiring profiles and usernames...',
        'website': 'scanning personal domains...',
        'general': 'gathering additional intel...',
        'complete': 'PROFILING COMPLETE. Navigate to /files directory',
        'error': 'ERROR: Operation failed',
      };

      const message = phaseMessages[searchState.currentPhase] || 'initializing...';
      
      addEntry({
        type: 'progress',
        content: message,
        phase: searchState.currentPhase,
        progress: searchState.progress,
      });
      
      setLastLoggedPhase(searchState.currentPhase);
    }
  }, [searchState.currentPhase, searchState.progress, searchState.isSearching, addEntry, lastLoggedPhase]);

  // Add completion entry when search finishes
  useEffect(() => {
    if (!searchState.isSearching && searchState.currentPhase === 'complete' && lastLoggedPhase !== '') {
      addEntry({
        type: 'success',
        content: 'Profile created successfully. Use "cd /files" to view intelligence directory.',
      });
      setLastLoggedPhase('');
    }
  }, [searchState.isSearching, searchState.currentPhase, lastLoggedPhase, addEntry]);

  const handleCommand = async (command: string, args: string[]) => {
    if (command === 'cd' && args[0] === '/files') {
      setCurrentPage('files');
      return;
    }

    if (command === 'profile_target') {
      const [name, hardContext, softContext] = args;
      
      
      const subject: Subject = {
        name,
        hardContext,
        softContext,
        maxDepth: 6,
      };

      // Always use live search mode (default)
      try {
        await startSearch([subject]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start live search';
        addEntry({
          type: 'error',
          content: errorMessage,
        });
      }
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
    } catch (err) {
      alert('Failed to delete profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleShowInputForm = () => {
    setShowInputForm(true);
  };

  const handleInputFormSubmit = async (subjects: Subject[]) => {
    try {
      await startSearch(subjects);
      setShowInputForm(false); // Hide form after submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start live search';
      addEntry({
        type: 'error',
        content: errorMessage,
      });
    }
  };

  // Show Files page
  if (currentPage === 'files') {
    return (
      <FilesPage 
        profiles={profiles} 
        onDelete={handleDeleteProfile}
        onBack={() => setCurrentPage('terminal')}
      />
    );
  }

  // Show Terminal page
  return (
    <div className="min-h-screen terminal-bg">
      <TerminalHeader 
        onOpenFiles={() => setCurrentPage('files')}
        isSearching={loading || searchState.isSearching}
        profilesCount={profiles.length}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Terminal Output */}
        <TerminalOutput />

        {/* Terminal Command Line */}
        <TerminalCommandLine 
          onSubmit={handleCommand}
          disabled={loading}
          onShowInputForm={handleShowInputForm}
        />

        {/* Input Form (shown when 'input' command is used) */}
        {showInputForm && (
          <div className="mt-6">
            <SubjectForm
              ref={formRef}
              onSubmit={handleInputFormSubmit}
              loading={loading || searchState.isSearching}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowInputForm(false)}
                className="terminal-button px-4 py-2 mr-2"
              >
                Close Form
              </button>
              <button
                onClick={() => formRef.current?.submit()}
                disabled={loading || searchState.isSearching}
                className="terminal-button px-4 py-2"
              >
                Run Profile
              </button>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

function App() {
  return (
    <TerminalHistoryProvider>
      <AppContent />
    </TerminalHistoryProvider>
  );
}

export default App;

