import Link from 'next/link';
import React from 'react';

interface BreadcrumbProps {
  title: string;
}

export function Breadcrumb({ title }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-xs md:text-sm text-slate-500 mb-6 mt-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        홈
      </Link>
      <span className="mx-2.5 opacity-40">›</span>
      <Link href="/posts" className="hover:text-blue-600 transition-colors font-medium">정부지원정책</Link>
      <span className="mx-2.5 opacity-40">›</span>
      <span className="text-slate-800 font-bold truncate max-w-[200px] md:max-w-sm">{title}</span>
    </nav>
  );
}
