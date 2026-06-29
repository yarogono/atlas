'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();

  if (pathname === '/hmbti') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-blue-600 dark:bg-blue-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:h-16 md:py-0 md:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xl md:text-3xl font-extrabold tracking-tight">복지지원금24시</span>
          </Link>
          <div className="flex items-center md:hidden">
            <button className="p-1 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-full transition-colors" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-5 md:gap-7 font-semibold overflow-x-auto whitespace-nowrap pb-1 md:pb-0 scrollbar-hide text-base md:text-lg">
          <Link href="/calculator" className="hover:text-blue-200 transition-colors flex items-center gap-1 text-yellow-350 font-black">계산기 목록</Link>
          <Link href="/calculator/stock-average" className="hover:text-blue-200 transition-colors flex items-center gap-1 text-white">평단가</Link>
          <Link href="/calculator/compound-interest" className="hover:text-blue-200 transition-colors flex items-center gap-1 text-white">복리</Link>
          <Link href="/calculator/transfer-tax" className="hover:text-blue-200 transition-colors flex items-center gap-1 text-white">양도세</Link>
          <Link href="/compress" className="hover:text-blue-200 transition-colors flex items-center gap-1 text-white">이미지 압축</Link>
          <span className="text-white/20 hidden md:inline">|</span>
          <Link href="/eligibility" className="hover:text-blue-200 transition-colors text-white/90 text-sm md:text-base">대상조회</Link>
          <Link href="/guide" className="hover:text-blue-200 transition-colors text-white/90 text-sm md:text-base">가이드</Link>
        </nav>

        <div className="hidden md:flex items-center">
          <button className="p-2 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-full transition-colors" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
