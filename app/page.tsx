'use client';

import { useState, useEffect } from 'react';
import { DocumentInput } from '@/components/DocumentInput';
import { DiffDisplay } from '@/components/DiffDisplay';
import { AISummary } from '@/components/AISummary';
import { StatsDashboard } from '@/components/StatsDashboard';
import { compareText, ComparisonResult } from '@/lib/diff';
import { ArrowRightLeft, ChevronDown, ChevronUp, Plus, History, Trash2, Menu, X, FileText, Sparkles, Layout, Zap, PlayCircle, CheckCircle2, ArrowRight, ArrowLeft, Home as HomeIcon, HelpCircle, PanelLeftClose, PanelLeftOpen, RotateCcw, Code, ArrowDown, Moon, Sun, Share2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  doc1: string;
  doc2: string;
  fileName1?: string;
  fileName2?: string;
  summary: string | null;
  diffResult: ComparisonResult;
}

// Example Data
const EXAMPLE_DOC_1 = `Contract Agreement
Date: January 1, 2024
Party A: Tech Corp
Party B: John Doe

1. Term: This agreement shall last for 12 months.
2. Compensation: Party B shall be paid $50 per hour.
3. Termination: 2 weeks notice required.
`;

const EXAMPLE_DOC_2 = `Contract Agreement
Date: January 15, 2024
Party A: Tech Corp
Party B: John Doe

1. Term: This agreement shall last for 24 months.
2. Compensation: Party B shall be paid $60 per hour.
3. Termination: 4 weeks notice required immediately.
`;

export default function Home() {
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  const [fileName1, setFileName1] = useState<string | undefined>(undefined);
  const [fileName2, setFileName2] = useState<string | undefined>(undefined);
  const [resetKey, setResetKey] = useState(0); 

  const [diffResult, setDiffResult] = useState<ComparisonResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputsExpanded, setInputsExpanded] = useState(true);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Custom Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Modal States
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // Initialize State on Mount
  useEffect(() => {
    // 1. Sidebar on Mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
         setIsSidebarOpen(false);
      } else {
         setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 2. Dark Mode Preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist Dark Mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const saved = localStorage.getItem('diffHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diffHistory', JSON.stringify(history));
  }, [history]);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };
  
  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleNewComparison = () => {
    setDoc1('');
    setDoc2('');
    setFileName1(undefined);
    setFileName2(undefined);
    setDiffResult(null);
    setSummary(null);
    setError(null);
    setProcessingTime(null);
    setInputsExpanded(true);
    setResetKey(prev => prev + 1);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleFullReset = () => {
    handleNewComparison();
    setShowWelcome(true);
  };

  const handleShare = () => {
    if (!summary || !diffResult) return;

    const additions = diffResult.additions;
    const deletions = diffResult.deletions;
    const report = `
📊 *DocDiff AI Report*
----------------------
⏱️ Time: ${processingTime ? processingTime.toFixed(2) + 's' : 'N/A'}
🟢 Added: ${additions} lines
🔴 Removed: ${deletions} lines

📝 *AI Summary:*
${summary}

----------------------
Generated by DocDiff AI
`.trim();

    navigator.clipboard.writeText(report);
    showToast('Report copied to clipboard! Ready to share.');
  };

  const loadExample = () => {
    setDoc1(EXAMPLE_DOC_1);
    setDoc2(EXAMPLE_DOC_2);
    setFileName1('Contract_v1.txt');
    setFileName2('Contract_v2.txt');
    setProcessingTime(null);
    setResetKey(prev => prev + 1);
    showToast('Example documents loaded! Click Run Comparison.');
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setDoc1(item.doc1);
    setDoc2(item.doc2);
    setFileName1(item.fileName1);
    setFileName2(item.fileName2);
    setDiffResult(item.diffResult);
    setSummary(item.summary);
    setProcessingTime(null);
    setInputsExpanded(false);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast('History item deleted');
  };

  const generateTitle = (f1?: string, f2?: string, t1?: string, t2?: string) => {
    if (f1 && f2) return `${f1} vs ${f2}`;
    if (f1) return `${f1} vs Text`;
    if (f2) return `Text vs ${f2}`;
    
    const snippet1 = t1 ? t1.slice(0, 15).replace(/\n/g, ' ') : 'Empty';
    const snippet2 = t2 ? t2.slice(0, 15).replace(/\n/g, ' ') : 'Empty';
    return `${snippet1}... vs ${snippet2}...`;
  };

  const handleCompare = async () => {
    if (!doc1 || !doc2) {
      showToast('Please provide both documents to compare.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);
    setInputsExpanded(false);
    setProcessingTime(null);

    const startTime = performance.now();

    try {
      const result = compareText(doc1, doc2);
      setDiffResult(result);

      let diffTextForAI = '';
      result.diffs.forEach(part => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
        diffTextForAI += prefix + part.value + '\n';
      });

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diffText: diffTextForAI,
          additions: result.additions,
          deletions: result.deletions,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      setSummary(data.summary);

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      setProcessingTime(duration);

      const isExample = doc1 === EXAMPLE_DOC_1 && doc2 === EXAMPLE_DOC_2;
      
      if (!isExample) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          title: generateTitle(fileName1, fileName2, doc1, doc2),
          timestamp: new Date(),
          doc1,
          doc2,
          fileName1,
          fileName2,
          diffResult: result,
          summary: data.summary
        };
        setHistory(prev => [newItem, ...prev]);
      }
      
      showToast('Analysis complete!');

    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the documents.');
      showToast('An error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 dark:text-slate-100 bg-transparent transition-colors duration-300">
      
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100 relative dark:border dark:border-slate-700">
             <button 
                onClick={closeWelcome}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h2 className="text-3xl font-bold mb-2">Welcome to DocDiff AI 🚀</h2>
              <p className="text-indigo-100 text-lg">Compare documents intelligently in seconds.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">1. Upload Documents</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Paste text or upload .txt/.docx files easily.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-50 dark:bg-slate-800 rounded-lg text-purple-600 dark:text-purple-400">
                    <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">2. Instant Comparison</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">See changes side-by-side with color coding.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-50 dark:bg-slate-800 rounded-lg text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">3. AI Insights</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get a concise summary of what changed and why.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={closeWelcome}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group hover:shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={toggleGuide}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative dark:border dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <button 
              onClick={toggleGuide}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Quick Guide
            </h3>
            
            <div className="space-y-4 mb-2">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase">Step 1</span>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Enter or Upload two documents.</p>
              </div>
              <div className="flex justify-center text-slate-300 dark:text-slate-600">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase">Step 2</span>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Click <strong>Run Comparison</strong>.</p>
              </div>
              <div className="flex justify-center text-slate-300 dark:text-slate-600">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase">Step 3</span>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Review Visual Diff & AI Summary.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`
          fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in
          ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}
        `}>
          {toast.type === 'success' ? <Sparkles className="w-4 h-4 text-yellow-400" /> : <X className="w-4 h-4" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out
          bg-white/90 backdrop-blur-xl border-r border-slate-200 shadow-2xl
          dark:bg-slate-900/90 dark:border-slate-800
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-400 dark:to-violet-400 leading-none">
                    DocDiff AI
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">
                    AI-Powered Document Intelligence
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
           </div>

          <button 
            onClick={handleNewComparison}
            className="w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/20 active:scale-95 hover:translate-y-[-1px]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            New Comparison
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="px-2 mb-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            History 🕒
          </div>
          
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-10 italic bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                No comparisons yet 📂<br/>Start one above!
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="mt-1 p-1 bg-indigo-50 dark:bg-slate-700 rounded-md text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300 text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={item.title}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-2">
           <div className="flex justify-between items-center w-full">
             <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                <Code className="w-3 h-3" />
                <span>v1.0</span>
             </div>
            
             <button 
                onClick={toggleGuide}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                title="View Guide"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Guide</span>
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`
          flex-1 flex flex-col h-full overflow-hidden w-full relative transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:pl-72' : 'pl-0'}
        `}
      >
        {/* Header */}
        <header className="h-20 flex items-center px-6 md:px-10 justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm border border-white/50 dark:border-slate-700 backdrop-blur-sm transition-all"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight hidden sm:block">
              {diffResult ? 'Analysis Results ✨' : 'Dashboard 🚀'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Share Button (Primary Style) */}
            {diffResult && (
              <button 
                onClick={handleShare}
                className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm border border-white/50 dark:border-slate-700 backdrop-blur-sm transition-all active:scale-95"
                title="Share Result"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-yellow-400 rounded-xl shadow-sm border border-white/50 dark:border-slate-700 backdrop-blur-sm transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Home/Reset Button */}
            {diffResult && (
              <button 
                onClick={handleFullReset}
                className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm border border-white/50 dark:border-slate-700 backdrop-blur-sm transition-all hover:-translate-y-0.5 active:scale-95"
                title="Go back to Start Screen"
              >
                <HomeIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Input Section - Floating Glass Card */}
            <div className={`
                relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-white/60 dark:border-slate-700 overflow-hidden transition-all duration-500 ease-in-out
                ${inputsExpanded ? 'ring-4 ring-white/40 dark:ring-slate-700/40' : 'hover:bg-white/80 dark:hover:bg-slate-800/80'}
            `}>
              <button 
                onClick={() => setInputsExpanded(!inputsExpanded)}
                className="w-full flex items-center justify-between px-8 py-6 transition-colors group"
              >
                 <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl shadow-inner ${inputsExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'} transition-all duration-300`}>
                     <FileText className="w-6 h-6" />
                   </div>
                   <div className="text-left">
                     <h2 className="text-lg font-bold text-slate-800 dark:text-white">Source Documents 📄</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Upload or paste text to begin analysis</p>
                   </div>
                 </div>
                 <div className={`p-2 rounded-full ${inputsExpanded ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : 'bg-transparent text-slate-400'} transition-all`}>
                   {inputsExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                 </div>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${inputsExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-8 pt-2 border-t border-indigo-50/50 dark:border-slate-700">
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={loadExample}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Try Example
                    </button>
                  </div>

                  <section className="grid md:grid-cols-2 gap-8 mb-8">
                    <DocumentInput
                      key={`doc1-${resetKey}`}
                      label="Document A 📝"
                      value={doc1}
                      onChange={(val, name) => {
                        setDoc1(val);
                        if (name) setFileName1(name);
                      }}
                    />
                    <DocumentInput
                      key={`doc2-${resetKey}`}
                      label="Document B 📝"
                      value={doc2}
                      onChange={(val, name) => {
                        setDoc2(val);
                        if (name) setFileName2(name);
                      }}
                    />
                  </section>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleCompare}
                      disabled={loading || !doc1 || !doc2}
                      className={`
                        group relative overflow-hidden flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-white shadow-2xl shadow-indigo-500/30 dark:shadow-none transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95
                        ${loading || !doc1 || !doc2 
                          ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' 
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/50 dark:hover:shadow-indigo-900/50'
                        }
                      `}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loading ? 'Processing... ⚡' : 'Run Comparison 🔍'}
                        {!loading && <ArrowRightLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </span>
                      {!loading && (
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {(diffResult || loading) && (
              <div className="flex flex-col gap-8 animate-fade-in pb-10">
                {diffResult && <StatsDashboard diffResult={diffResult} processingTime={processingTime} />}
                
                <div className="h-[600px] w-full transition-all duration-500 hover:translate-y-[-4px]">
                  {diffResult && <DiffDisplay diffData={diffResult} />}
                </div>

                <div className="w-full transition-all duration-500 hover:translate-y-[-4px]">
                   <AISummary summary={summary} loading={loading} />
                   {error && (
                     <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-3 shadow-sm animate-pulse">
                       <X className="w-5 h-5" /> {error}
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
