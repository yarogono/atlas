import React from 'react';

interface SourceRefProps {
  name: string;
  url: string;
  date?: string;
}

export function SourceRef({ name, url, date }: SourceRefProps) {
  return (
    <div className="not-prose mt-12 mb-8 bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors hover:border-slate-300">
      <div className="flex items-center gap-2.5">
         <span className="text-lg bg-white p-1 rounded shadow-sm border border-slate-100">🏛️</span>
         <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
           <span className="text-slate-500 font-medium text-xs sm:text-sm">공식 자료 출처:</span>
           <span className="font-bold text-slate-700">{name}</span>
           {date && <span className="text-xs text-slate-400 hidden sm:inline">({date} 기준)</span>}
         </div>
      </div>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium bg-white sm:bg-transparent border border-slate-200 sm:border-none px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none w-fit text-xs sm:text-sm"
      >
        <span>공식 원문 확인하기</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </a>
    </div>
  );
}
