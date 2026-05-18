import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

export const metadata: Metadata = {
  title: '고유가 피해지원금 지역별 신청 방법 가이드 | 복지지원금24시',
  description: '전국 지자체별 2026년 고유가 피해지원금 신청 자격, 대상 조건, 온·오프라인 신청 절차 및 가이드를 지도와 함께 확인해 보세요.',
  openGraph: {
    title: '고유가 피해지원금 지역별 신청 방법 가이드 | 복지지원금24시',
    description: '전국 지자체별 고유가 피해지원금 신청 자격과 온·오프라인 실시간 신청 가이드를 제공합니다.',
    url: `${baseUrl}/regions`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '고유가 피해지원금 지역별 신청 방법 가이드 | 복지지원금24시',
    description: '전국 지자체별 고유가 피해지원금 신청 자격과 온·오프라인 실시간 신청 가이드를 제공합니다.',
  },
  alternates: {
    canonical: `${baseUrl}/regions`,
  }
};

export default function RegionsPage() {
  const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
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
        name: '고유가 피해지원금 지역별 신청 방법 가이드',
        item: `${baseUrl}/regions`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 w-full">
      <Script id="regions-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          📍 고유가 피해지원금 <span className="text-blue-600">지역별 신청 방법 가이드</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          전국 지자체별 2026 고유가 피해지원금 온라인·오프라인 신청 절차와 대상 기준을 확인하세요.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-4">지역 선택</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {regions.map(region => (
            <Link key={region} href={`/regions/${region}`} className="py-3 px-2 text-center rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
              {region}
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center bg-blue-600 text-white p-8 rounded-3xl shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-2">지도에서 내 주변 지원 기관 찾기</h2>
        <p className="mb-6 text-blue-100">가장 가까운 행정복지센터와 고용센터를 지도에서 바로 확인하세요.</p>
        <Link href="/map" className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-md">
          🗺️ 지도로 이동하기
        </Link>
      </div>
    </div>
  );
}
