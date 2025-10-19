import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Subject } from '../types';
import { parseName } from '../utils/nameParser';

interface SubjectFormProps {
  onSubmit: (subjects: Subject[]) => void;
  loading: boolean;
}

export interface SubjectFormRef {
  submit: () => void;
}

const SubjectForm = forwardRef<SubjectFormRef, SubjectFormProps>(({ onSubmit, loading }, ref) => {
  const [name, setName] = useState('');
  const [hardContext, setHardContext] = useState('');
  const [softContext, setSoftContext] = useState('');
  const maxDepth = 6; // Fixed at 6 as per specification

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (!name.trim()) {
        alert('Please enter a subject name');
        return;
      }

      // Parse the name to validate format
      const { firstName, lastName } = parseName(name.trim());
      if (!firstName || !lastName) {
        alert('Please enter both first name and last name (e.g., "John Smith" or "John Michael Smith")');
        return;
      }

      const subject: Subject = {
        name: name.trim(),
        hardContext: hardContext.trim(),
        softContext: softContext.trim(),
        maxDepth,
      };

      onSubmit([subject]);
      
      // Reset form
      setName('');
      setHardContext('');
      setSoftContext('');
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a subject name');
      return;
    }

    // Parse the name to validate format
    const { firstName, lastName } = parseName(name.trim());
    if (!firstName || !lastName) {
      alert('Please enter both first name and last name (e.g., "John Smith" or "John Michael Smith")');
      return;
    }

    const subject: Subject = {
      name: name.trim(),
      hardContext: hardContext.trim(),
      softContext: softContext.trim(),
      maxDepth,
    };

    onSubmit([subject]);
    
    // Reset form
    setName('');
    setHardContext('');
    setSoftContext('');
  };

  return (
    <div className="terminal-bg terminal-border p-6 mb-6 font-mono">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="terminal-text">name:</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Michael Smith"
            className="flex-1 terminal-input"
            disabled={loading}
            required
          />
        </div>

        <div className="flex items-start space-x-2">
          <span className="terminal-text whitespace-nowrap mt-2">hard_context:</span>
          <textarea
            value={hardContext}
            onChange={(e) => setHardContext(e.target.value)}
            placeholder="Engineering student at SUTD in Singapore"
            rows={2}
            className="flex-1 terminal-input resize-none"
            disabled={loading}
            required
          />
        </div>

        <div className="flex items-start space-x-2">
          <span className="terminal-text whitespace-nowrap mt-2">soft_context:</span>
          <textarea
            value={softContext}
            onChange={(e) => setSoftContext(e.target.value)}
            placeholder="Interested in AI, may have GitHub account"
            rows={2}
            className="flex-1 terminal-input resize-none"
            disabled={loading}
          />
        </div>

      </form>
    </div>
  );
});

SubjectForm.displayName = 'SubjectForm';

export default SubjectForm;

