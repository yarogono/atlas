'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  title: string;
  slug: string;
}

export default function BreakingNews({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [posts.length, currentIndex]);

  const handleNext = () => {
    if (animating || posts.length === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
      setAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (animating || posts.length === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
      setAnimating(false);
    }, 300);
  };

  if (posts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 my-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 h-12">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 속보 레이블 */}
          <span className="flex-shrink-0 bg-rose-600 text-white px-2.5 py-1 rounded text-xs font-black tracking-tight inline-flex items-center gap-1.5 shadow-sm">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            속보
          </span>
          
          {/* 뉴스 롤링 영역 */}
          <div className="relative overflow-hidden h-6 flex-1 min-w-0">
            <div 
              className={`transition-all duration-300 transform ${
                animating ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'
              }`}
            >
              <Link 
                href={`/posts/${posts[currentIndex].slug}`}
                className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block leading-6"
              >
                {posts[currentIndex].title}
              </Link>
            </div>
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-1 flex-shrink-0">
          <button 
            onClick={handlePrev}
            className="w-6 h-6 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous news"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={handleNext}
            className="w-6 h-6 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Next news"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
