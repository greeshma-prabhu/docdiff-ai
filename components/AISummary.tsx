import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, FileDown, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AISummaryProps {
  summary: string | null;
  loading: boolean;
}

export const AISummary: React.FC<AISummaryProps> = ({ summary, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-summary.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[300px] transition-all hover:shadow-2xl">
      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-slate-800 dark:to-slate-800 px-6 py-4 border-b border-indigo-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">AI Analysis 🤖✨</h3>
        </div>
        
        {summary && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-indigo-100 dark:border-slate-600 rounded-lg transition-colors shadow-sm"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-indigo-100 dark:border-slate-600 rounded-lg transition-colors shadow-sm"
              title="Download Summary"
            >
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-8 flex-1 relative overflow-auto custom-scrollbar bg-white/40 dark:bg-slate-900/40">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 animate-pulse">Generating insights... ⚡</span>
          </div>
        ) : summary ? (
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
             <ReactMarkdown 
               components={{
                 ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
                 li: ({node, ...props}) => <li className="marker:text-indigo-500 dark:marker:text-indigo-400" {...props} />,
                 p: ({node, ...props}) => <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />,
                 strong: ({node, ...props}) => <strong className="text-indigo-900 dark:text-indigo-200 font-bold" {...props} />
               }}
             >
               {summary}
             </ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
              <Sparkles className="w-8 h-8 text-indigo-200 dark:text-slate-600" />
            </div>
            <p className="text-center text-sm font-medium max-w-[200px]">
              Ready to analyze differences 🔍
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
