import React, { useState } from 'react';
import { ComparisonResult } from '@/lib/diff';
import { Columns, List, Copy, Check, Info } from 'lucide-react';

interface DiffDisplayProps {
  diffData: ComparisonResult;
}

export const DiffDisplay: React.FC<DiffDisplayProps> = ({ diffData }) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [copied, setCopied] = useState(false);

  const isIdentical = diffData.additions === 0 && diffData.deletions === 0;

  const handleCopy = () => {
    // Copy logic if needed
  };

  const renderSplitView = () => {
    return (
      <div className="flex h-full font-mono text-sm overflow-hidden rounded-b-2xl">
        {/* Left Column (Document A) */}
        <div className="w-1/2 overflow-auto custom-scrollbar border-r border-slate-200 dark:border-slate-700 bg-red-50/10 dark:bg-red-900/5">
          <div className="sticky top-0 left-0 right-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider z-10 flex justify-between">
            <span>Document A</span>
            <span className="text-red-500 dark:text-red-400">-{diffData.deletions}</span>
          </div>
          <div className="p-4">
            {diffData.diffs.map((part, index) => (
              <span
                key={index}
                className={`
                  ${part.removed ? 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 decoration-red-300 dark:decoration-red-700' : ''} 
                  ${part.added ? 'hidden' : ''} 
                  ${!part.added && !part.removed ? 'text-slate-600 dark:text-slate-400' : ''}
                  whitespace-pre-wrap break-all
                `}
              >
                {part.value}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column (Document B) */}
        <div className="w-1/2 overflow-auto custom-scrollbar bg-green-50/10 dark:bg-green-900/5">
          <div className="sticky top-0 left-0 right-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider z-10 flex justify-between">
            <span>Document B</span>
            <span className="text-green-600 dark:text-green-400">+{diffData.additions}</span>
          </div>
          <div className="p-4">
            {diffData.diffs.map((part, index) => (
              <span
                key={index}
                className={`
                  ${part.added ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 decoration-green-300 dark:decoration-green-700' : ''} 
                  ${part.removed ? 'hidden' : ''} 
                  ${!part.added && !part.removed ? 'text-slate-600 dark:text-slate-400' : ''}
                  whitespace-pre-wrap break-all
                `}
              >
                {part.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUnifiedView = () => {
    return (
      <div className="h-full overflow-auto custom-scrollbar p-6 font-mono text-sm bg-white dark:bg-slate-900 rounded-b-2xl">
        {diffData.diffs.map((part, index) => (
          <span
            key={index}
            className={`
              whitespace-pre-wrap break-all
              ${part.added ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200' : ''}
              ${part.removed ? 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 line-through decoration-red-300/50 dark:decoration-red-700/50' : ''}
              ${!part.added && !part.removed ? 'text-slate-600 dark:text-slate-400' : ''}
            `}
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  if (isIdentical) {
    return (
      <div className="h-full w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 dark:border-slate-700 flex flex-col items-center justify-center gap-4 animate-fade-in p-8 text-center">
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-2">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Documents are Identical!</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          No differences were found between the two texts. They are an exact match character-for-character.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 dark:border-slate-700 overflow-hidden transition-all">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'split' 
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Split
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'unified' 
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Unified
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
      </div>
    </div>
  );
};
