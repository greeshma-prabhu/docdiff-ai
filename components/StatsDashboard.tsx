import React from 'react';
import { BarChart, PlusCircle, MinusCircle, Hash, PieChart, Clock } from 'lucide-react';
import { ComparisonResult } from '@/lib/diff';

interface StatsDashboardProps {
  diffResult: ComparisonResult;
  processingTime?: number | null;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ diffResult, processingTime }) => {
  // Calculate detailed stats based on line counts
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  // diffResult.diffs contains chunks. We need to count newlines for line accuracy, 
  // or just use the chunk count if line-by-line isn't strictly parsed yet.
  // Assuming diffLines was used, each chunk value contains the text.
  diffResult.diffs.forEach(part => {
    // Count newlines to approximate lines. 
    // If text doesn't end with newline, we count it as 1 line at least.
    const lines = part.value.split('\n').filter(l => l.length > 0).length;
    
    if (part.added) {
      additions += lines;
    } else if (part.removed) {
      deletions += lines;
    } else {
      unchanged += lines;
    }
  });

  const totalLines = additions + deletions + unchanged;
  const changedLines = additions + deletions;
  const changePercentage = totalLines > 0 ? Math.round((changedLines / totalLines) * 100) : 0;

  return (
    <div className={`grid grid-cols-2 ${processingTime ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-6 animate-fade-in`}>
      {/* Total Changes Card */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm flex items-center gap-3 overflow-hidden">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
          <PieChart className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide truncate">Impact</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{changePercentage}%</h4>
            <span className="text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-300 truncate">Changed</span>
          </div>
        </div>
      </div>

      {/* Additions Card */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl border border-green-100 dark:border-green-900/30 shadow-sm flex items-center gap-3 overflow-hidden">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg shrink-0">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide truncate">Added</p>
          <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-green-600 dark:text-green-400">+{additions}</h4>
        </div>
      </div>

      {/* Deletions Card */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex items-center gap-3 overflow-hidden">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg shrink-0">
          <MinusCircle className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide truncate">Removed</p>
          <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white text-red-600 dark:text-red-400">-{deletions}</h4>
        </div>
      </div>

      {/* Total Lines Card */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 overflow-hidden">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg shrink-0">
          <Hash className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide truncate">Total Lines</p>
          <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{totalLines}</h4>
        </div>
      </div>

      {/* Time Card */}
      {processingTime && (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm flex items-center gap-3 overflow-hidden col-span-2 md:col-span-1">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide truncate">Time</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{processingTime.toFixed(2)}s</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
