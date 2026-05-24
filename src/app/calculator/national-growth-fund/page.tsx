import { Metadata } from 'next';
import Script from 'next/script';
import NationalGrowthFundCalc from '@/components/calculator/NationalGrowthFundCalc';

export const metadata: Metadata = {
  title: '국민성장펀드 나의 실질 투자 가성비 계산기 | 절세 및 손실방어 시뮬레이터',
  description: '국민성장펀드 가입 시 세제 혜택(소득공제 최대 1,600만 원)과 연말정산 환급 세액 및 확정 절세 수익률을 실시간 계산합니다. 정부의 20% 후순위 손실 우선분담이 적용된 나의 실제 원금 변동률을 실시간 차트로 시뮬레이션해 보세요.',
  keywords: [
    '국민성장펀드',
    '국민성장펀드 계산기',
    '국민성장펀드 가성비 계산기',
    '국민성장펀드 수익률 계산기',
    '국민성장펀드 절세 계산기',
    '국민성장펀드 소득공제',
    '국민성장펀드 환급금',
    '국민성장펀드 손실방어',
    '연말정산 소득공제 계산기',
    '절세 펀드 계산기'
  ],
  openGraph: {
    title: '국민성장펀드 나의 실질 투자 가성비 계산기 | 절세 및 손실방어 시뮬레이터',
    description: '국민성장펀드 가입 시 세제 혜택(소득공제 최대 1,600만 원)과 연말정산 환급 세액 및 확정 절세 수익률을 실시간 계산합니다. 정부의 20% 후순위 손실 우선분담이 적용된 나의 실제 원금 변동률을 실시간 차트로 시뮬레이션해 보세요.',
    url: '/calculator/national-growth-fund',
  },
  twitter: {
    card: 'summary_large_image',
    title: '국민성장펀드 나의 실질 투자 가성비 계산기 | 절세 및 손실방어 시뮬레이터',
    description: '국민성장펀드 가입 시 세제 혜택(소득공제 최대 1,600만 원)과 연말정산 환급 세액 및 확정 절세 수익률을 실시간 계산합니다. 정부의 20% 후순위 손실 우선분담이 적용된 나의 실제 원금 변동률을 실시간 차트로 시뮬레이션해 보세요.',
  },
  alternates: {
    canonical: '/calculator/national-growth-fund',
  }
};

export default function NationalGrowthFundPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '국민성장펀드 나의 실질 투자 가성비 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '국민성장펀드 가입자를 위한 연말정산 절세 혜택 시뮬레이터. 소득공제 금액, 예상 세금 환급액, 확정 절세 수익률 및 최고세율 자산가 대비 가성비 지수를 산출하며, 정부 20% 후순위 손실 보전 우선분담 구조에 따른 실제 원금 변동률을 실시간 비교 차트로 시각화합니다.',
    url: `${baseUrl}/calculator/national-growth-fund`
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
        name: '국민성장펀드 나의 실질 투자 가성비 계산기',
        item: `${baseUrl}/calculator/national-growth-fund`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Script id="fund-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="fund-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Load Chart.js CDN before the page becomes interactive */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/chart.js" 
        strategy="beforeInteractive"
      />
      <NationalGrowthFundCalc />
    </div>
  );
}
