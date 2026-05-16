import Link from 'next/link';
import React from 'react';

interface PostLink {
  slug: string;
  title: string;
}

interface PaginationProps {
  prev?: PostLink | null;
  next?: PostLink | null;
}

export function Pagination({ prev, next }: PaginationProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 mt-16 mb-8 pt-8 border-t border-slate-200">
      {prev ? (
        <Link href={`/posts/${prev.slug}`} className="flex-1 group bg-white border border-slate-200 hover:border-[#0a3d7e] p-5 rounded-2xl transition-all hover:shadow-md flex flex-col items-start">
          <span className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 group-hover:text-[#0a3d7e] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            이전 글
          </span>
          <span className="font-bold text-slate-800 group-hover:text-[#0a3d7e] line-clamp-2 text-sm md:text-base leading-snug transition-colors">{prev.title}</span>
        </Link>
      ) : <div className="flex-1 hidden md:block" />}
      
      {next ? (
        <Link href={`/posts/${next.slug}`} className="flex-1 group bg-white border border-slate-200 hover:border-[#0a3d7e] p-5 rounded-2xl transition-all hover:shadow-md flex flex-col items-end text-right">
          <span className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 group-hover:text-[#0a3d7e] transition-colors">
            다음 글
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="font-bold text-slate-800 group-hover:text-[#0a3d7e] line-clamp-2 text-sm md:text-base leading-snug transition-colors">{next.title}</span>
        </Link>
      ) : <div className="flex-1 hidden md:block" />}
    </div>
  );
}
