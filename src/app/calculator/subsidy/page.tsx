import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정부지원금 계산기 | 내 예상 수령액 3초만에 확인',
  description: '나이, 직업, 소득만 입력하면 내가 받을 수 있는 정부지원금과 청년정책 예상 수령액을 즉시 계산해드립니다.',
  openGraph: {
    title: '정부지원금 3초 계산기 | 즉시 확인하기',
    description: '나에게 맞는 지원금을 3초만에 계산해보세요.',
    url: '/calculator/subsidy',
  },
  twitter: {
    card: 'summary_large_image',
    title: '정부지원금 3초 계산기 | 즉시 확인하기',
    description: '나에게 맞는 지원금을 3초만에 계산해보세요.',
  },
  alternates: {
    canonical: '/calculator/subsidy',
  }
};

export default function SubsidyCalculatorPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '정부지원금 3초 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'WebApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '나에게 맞는 정부지원금 예상 수령액을 3초만에 계산해주는 도구입니다.',
    url: `${baseUrl}/calculator/subsidy`
  };

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
        name: '계산기 목록',
        item: `${baseUrl}/calculator`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '정부지원금 계산기',
        item: `${baseUrl}/calculator/subsidy`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Script id="calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="calc-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          💰 정부지원금 <span className="text-blue-600">3초 계산기</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          복잡한 서류 없이 기본적인 정보만으로<br className="md:hidden" /> 내가 받을 금액을 미리 확인해보세요.
        </p>
      </div>

      {/* Calculator Form UI */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100 dark:border-slate-700 mb-12">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">나이 (만 나이)</label>
              <input type="number" placeholder="예: 28" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">직업 상태</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option>직업 상태 선택</option>
                <option>근로자 (정규직)</option>
                <option>근로자 (계약직/알바)</option>
                <option>소상공인/자영업자</option>
                <option>구직자/무직</option>
                <option>대학(원)생</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">월 평균 소득</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option>소득 구간 선택</option>
                <option>없음</option>
                <option>100만원 미만</option>
                <option>100만원 ~ 200만원</option>
                <option>200만원 ~ 300만원</option>
                <option>300만원 이상</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">거주 지역</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option>시/도 선택</option>
                <option>서울특별시</option>
                <option>경기도</option>
                <option>인천광역시</option>
                <option>기타 지역</option>
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              <span>내 지원금 결과 보기 🚀</span>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center bg-blue-50 dark:bg-slate-800 p-8 rounded-2xl border border-blue-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">정확한 대상 여부가 궁금하다면?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">자세한 조건 분석이 필요한 정책은 대상조회기를 이용하세요.</p>
        <Link href="/eligibility" className="inline-block bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold px-6 py-3 rounded-full border border-blue-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors">
          ✅ 1분 대상조회기로 이동하기
        </Link>
      </div>
    </div>
  );
}
