import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr'),
  title: {
    template: '%s | 복지지원금24시',
    default: '정부지원금 대상 조회·계산기 | 내가 받을 금액 3초만에 확인 - 복지지원금24시',
  },
  description: '정부지원금, 청년정책, 소상공인 지원금 대상 여부를 확인하고 예상 금액까지 즉시 계산해보세요.',
  openGraph: {
    title: '정부지원금 대상 조회·계산기 | 내가 받을 금액 3초만에 확인',
    description: '정부지원금, 청년정책, 소상공인 지원금 대상 여부를 확인하고 예상 금액까지 즉시 계산해보세요.',
    url: '/',
    siteName: '복지지원금24시',
    locale: 'ko_KR',
    type: 'website',
  },
  verification: {
    google: 'LZPIpa762YBaEvnn4vlmglSsBX9nDQxkyXwp1Mmowzc',
    other: {
      'naver-site-verification': 'cc95169b88946f7e84dca3a61b7c630705a27dd3',
    },
  },
  icons: {
    icon: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/favicon.png', // S3 파비콘 이미지 URL을 여기에 입력하세요 (예: https://s3.../favicon.ico)
    apple: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/favicon.png', // (선택) S3 애플 터치 아이콘 URL (예: https://s3.../apple-touch-icon.png)
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5633731930294890"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services,clusterer&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 min-h-screen flex flex-col`}>
        {/* WebSite JSON-LD */}
        <Script id="website-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '복지지원금24시',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr'}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          })
        }} />
        {/* 상단 파란색 내비게이션 바 */}
        <header className="sticky top-0 z-50 w-full bg-blue-600 dark:bg-blue-800 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:h-16 md:py-0 md:items-center justify-between gap-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-bold tracking-tight">복지지원금24시</span>
              </Link>
              <div className="flex items-center md:hidden">
                <button className="p-1 hover:bg-blue-700 dark:hover:bg-blue-700 rounded-full transition-colors" aria-label="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </div>
            </div>

            <nav className="flex items-center gap-4 md:gap-6 font-medium overflow-x-auto whitespace-nowrap pb-1 md:pb-0 scrollbar-hide text-sm md:text-base">
              <Link href="/calculator" className="hover:text-blue-200 transition-colors flex items-center gap-1 text-yellow-300 font-bold">🧮 3초 계산기</Link>
              <Link href="/eligibility" className="hover:text-blue-200 transition-colors">대상조회</Link>
              <Link href="/guide" className="hover:text-blue-200 transition-colors">종합가이드</Link>
              <Link href="/regions" className="hover:text-blue-200 transition-colors">🗺️ 지역별</Link>
              <Link href="/faq" className="hover:text-blue-200 transition-colors">FAQ</Link>
              <Link href="/updates" className="hover:text-blue-200 transition-colors">최신업데이트</Link>
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

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>

        <footer className="bg-white dark:bg-slate-950 py-8 text-center border-t border-slate-200 dark:border-slate-800 mt-auto">
          <div className="flex items-center justify-center gap-4 mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="/about" className="hover:text-blue-600 transition-colors">사이트 소개</Link>
            <span className="text-slate-300">|</span>
            <Link href="#" className="hover:text-blue-600 transition-colors">개인정보처리방침</Link>
          </div>
          <p className="text-slate-500 text-sm">© 2026 복지지원금24시. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
