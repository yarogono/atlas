import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '서비스 이용방법 | 복지지원금24시',
  description: '복지지원금24시의 지원금 조회 및 계산기 100% 활용하는 방법을 안내해드립니다.',
  openGraph: {
    title: '복지지원금24시 이용방법',
    description: '어떻게 써야 혜택을 다 받을 수 있을까요?',
    url: '/usage',
  },
  twitter: {
    card: 'summary_large_image',
    title: '복지지원금24시 이용방법',
    description: '어떻게 써야 혜택을 다 받을 수 있을까요?',
  },
  alternates: {
    canonical: '/usage',
  }
};

export default function UsagePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '서비스 이용방법',
        item: `${baseUrl}/usage`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <Script id="usage-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          💡 서비스 <span className="text-blue-600">이용방법</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          복지지원금24시를 100% 활용하는 꿀팁을 확인하세요.
        </p>
      </div>

      <div className="space-y-8 mb-12">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">1</span>
            대상조회기로 내 조건 확인하기
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 ml-11">
            먼저 <Link href="/eligibility" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">대상조회기</Link>를 통해 내 나이, 직업, 소득에 맞는 지원금이 있는지 확인하세요. 복잡한 표를 볼 필요 없이 클릭 몇 번이면 끝납니다.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">2</span>
            계산기로 예상 수령액 확인하기
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 ml-11">
            대상이 되신다면, <Link href="/calculator" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">3초 계산기</Link>를 이용해 정확히 얼마를 받을 수 있는지 계산해 보세요. 최대 수령액과 월별 지급액을 한 번에 보여드립니다.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">3</span>
            최신 업데이트 알림 확인하기
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 ml-11">
            지원금은 예산이 소진되면 조기 마감됩니다. 주기적으로 <Link href="/updates" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">최신 업데이트</Link> 메뉴를 확인하시어 놓치는 혜택이 없도록 관리하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
