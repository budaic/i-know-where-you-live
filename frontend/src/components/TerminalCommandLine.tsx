import React, { useState, useRef, useEffect } from 'react';
import { useTerminalHistory } from '../contexts/TerminalHistoryContext';

interface TerminalCommandLineProps {
  onSubmit: (command: string, args: string[]) => void;
  disabled: boolean;
  onShowInputForm?: () => void;
}

export default function TerminalCommandLine({ onSubmit, disabled, onShowInputForm }: TerminalCommandLineProps) {
  const [command, setCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addEntry, clearHistory, commandHistory, addCommandToHistory, clearCommandHistory } = useTerminalHistory();


  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Additional focus restoration when component becomes enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (inputRef.current && !disabled) {
          inputRef.current.focus();
          // Force focus even if the element seems unresponsive
          inputRef.current.click();
        }
      }, 100);
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (command.trim()) {
      // Add command to terminal history
      addEntry({
        type: 'command',
        content: command.trim(),
      });

      // Parse command with proper handling of quoted strings
      const parts = command.trim().match(/(?:[^\s"]+|"[^"]*")+/g);
      if (!parts || parts.length === 0) return;

      const cmd = parts[0];
      const args = parts.slice(1);

      // Handle different commands
      if (cmd === 'clear') {
        clearHistory();
        clearCommandHistory();
      } else if (cmd === 'search') {
        // Show the input form
        if (onShowInputForm) {
          onShowInputForm();
        }
      } else if (cmd === '--help' || cmd === 'help') {
        // Show help information
        addEntry({
          type: 'info',
          content: 'Available commands:',
        });
        addEntry({
          type: 'info',
          content: '  profile_target --name=NAME --hard-context=CONTEXT --soft-context=CONTEXT',
        });
        addEntry({
          type: 'info',
          content: '    Start profiling a target with the specified parameters',
        });
        addEntry({
          type: 'info',
          content: '  search',
        });
        addEntry({
          type: 'info',
          content: '    Show the input form for traditional data entry',
        });
        addEntry({
          type: 'info',
          content: '  cd /files',
        });
        addEntry({
          type: 'info',
          content: '    Navigate to the intelligence files directory',
        });
        addEntry({
          type: 'info',
          content: '  clear',
        });
        addEntry({
          type: 'info',
          content: '    Clear all terminal output and command history',
        });
        addEntry({
          type: 'info',
          content: '  --help or help',
        });
        addEntry({
          type: 'info',
          content: '    Show this help information',
        });
      } else if (cmd === 'cd' && args[0] === '/files') {
        // This will be handled by the parent component
        onSubmit('cd', args);
      } else if (cmd === 'profile_target') {
        // Parse profile_target command with proper quoted string handling
        const argMap: { [key: string]: string } = {};
        
        for (const arg of args) {
          if (arg.startsWith('--')) {
            const equalIndex = arg.indexOf('=');
            if (equalIndex !== -1) {
              const flag = arg.substring(2, equalIndex);
              const value = arg.substring(equalIndex + 1);
              // Remove quotes from value if present
              argMap[flag] = value.replace(/^"|"$/g, '');
            } else {
              argMap[arg.substring(2)] = '';
            }
          }
        }

        const name = argMap['name'];
        const hardContext = argMap['hard-context'];
        const softContext = argMap['soft-context'];

        if (!name || !hardContext) {
          addEntry({
            type: 'error',
            content: 'Error: --name and --hard-context are required',
          });
          setCommand('');
          return;
        }

        onSubmit('profile_target', [name, hardContext, softContext || '']);
      } else {
        addEntry({
          type: 'error',
          content: `Command not found: ${cmd}. Type "--help" to see all available commands.`,
        });
      }

      // Add command to history
      addCommandToHistory(command);
      
      setCommand('');
      setHistoryIndex(-1); // Reset history index
      
      // Refocus input after command submission
      setTimeout(() => {
        if (inputRef.current && !disabled) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      addEntry({
        type: 'error',
        content: 'Process terminated by user (Ctrl+C)',
      });
      // You could add logic here to actually terminate the process
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        let newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        if (historyIndex < commandHistory.length - 1) {
          let newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        } else {
          // Reached the end of history, clear the input
          setHistoryIndex(-1);
          setCommand('');
        }
      }
    }
  };

  return (
    <div 
      className="font-mono"
      onClick={() => {
        if (inputRef.current && !disabled) {
          inputRef.current.focus();
          inputRef.current.click();
        }
      }}
    >
      {/* Help text - always visible */}
      <div className="terminal-text text-sm mb-4 opacity-75">
        (type "profile_target --name=NAME --hard-context=CONTEXT --soft-context=CONTEXT" to profile anyone)
      </div>

      {/* Command input */}
      <form onSubmit={handleSubmit} className="flex items-start" onClick={() => {
        if (inputRef.current && !disabled) {
          inputRef.current.focus();
        }
      }}>
        <span className="terminal-text text-sm mr-2 mt-0.5">
          {new Date().toLocaleTimeString()} $
        </span>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={() => {
              if (inputRef.current && !disabled) {
                inputRef.current.focus();
              }
            }}
            disabled={disabled}
            className="terminal-bg terminal-text text-sm border-none outline-none w-full"
            placeholder=""
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
}
