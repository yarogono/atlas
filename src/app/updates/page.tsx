import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '최신 업데이트 및 일정 | 복지지원금24시',
  description: '이번 주 새롭게 뜬 정부지원금 소식과 곧 마감되는 지원금 신청 일정을 가장 빠르게 확인하세요.',
  openGraph: {
    title: '최신 업데이트 및 신청 일정 안내',
    description: '놓치기 쉬운 지원금 신청 일정, 여기서 확인하세요.',
    url: '/updates',
  },
  alternates: {
    canonical: '/updates',
  }
};

export default function UpdatesPage() {
  const recentUpdates = [
    { title: '2026년 하반기 소상공인 새출발기금 접수 시작', date: '2026.05.15', badge: 'NEW', type: '소상공인', url: '/posts/third-post' },
    { title: '청년내일저축계좌 신규 가입자 모집 마감 임박', date: '2026.05.10', badge: '마감임박', type: '청년', url: '/posts/sample-post' },
    { title: '에너지 바우처 하절기 지원금 신청 안내', date: '2026.05.08', badge: '신청중', type: '생활지원', url: '/posts/2026-oil-support-guide' },
    { title: '근로장려금 정기 신청 기간 안내 (5월)', date: '2026.05.01', badge: '핫이슈', type: '전국민', url: '/posts/sample-post' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          ⚡ 최신 <span className="text-blue-600">업데이트</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          이번 주 새롭게 뜬 지원금 소식과 마감 일정을 확인하세요.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-12">
        <div className="space-y-4">
          {recentUpdates.map((item, idx) => (
            <Link key={idx} href={item.url} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600 group">
              <div className="flex items-center gap-4">
                <div className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap
                  ${item.badge === 'NEW' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''}
                  ${item.badge === '마감임박' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                  ${item.badge === '신청중' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : ''}
                  ${item.badge === '핫이슈' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                `}>
                  {item.badge}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors">
            더 보기 +
          </button>
        </div>
      </div>
    </div>
  );
}
