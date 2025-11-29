import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, FileText, Loader2, FileType, MousePointerClick, Paperclip } from 'lucide-react';

interface DocumentInputProps {
  label: string;
  value: string;
  onChange: (value: string, fileName?: string) => void;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({ label, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize PDF.js worker
  useEffect(() => {
    const initPdf = async () => {
      if (typeof window !== 'undefined') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }
    };
    initPdf();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsLoading(true);

    try {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange(e.target?.result as string, file.name);
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const buffer = await file.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        const pdf = await pdfjs.getDocument({ data: buffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        onChange(fullText, file.name);
        setIsLoading(false);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to parse document');

        const data = await response.json();
        onChange(data.text, file.name);
        setIsLoading(false);
      } else {
        alert('Unsupported file type. Please upload .txt, .pdf, or .docx');
        setFileName(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file');
      setFileName(null);
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    onChange('', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col gap-3 group">
      <div className="flex justify-between items-center px-1">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
          {label}
        </label>
        {value && (
          <span className="text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full animate-fade-in">
            {value.length} chars
          </span>
        )}
      </div>
      
      <div 
        className={`
          relative flex flex-col h-[300px] rounded-2xl transition-all duration-300 overflow-hidden
          ${isDragging 
            ? 'border-2 border-dashed border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-[1.02]' 
            : fileName 
              ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800' 
              : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-semibold animate-pulse">Parsing Document...</span>
          </div>
        )}

        <textarea
          className={`
            flex-1 w-full p-5 resize-none bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 custom-scrollbar text-sm leading-relaxed font-mono z-10
            ${fileName ? 'opacity-50 pointer-events-none' : ''}
          `}
          placeholder="Type or paste text here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Compact Footer Bar */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between relative z-10">
          {fileName ? (
            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{fileName}</span>
              <button
                onClick={clearFile}
                className="ml-auto p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
                Or upload file
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 transition-all shadow-sm active:scale-95 ml-auto w-full sm:w-auto justify-center"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Select Document</span>
              </button>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.pdf,.docx" 
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};
