import { Metadata } from 'next';
import Script from 'next/script';
import NationalGrowthFundLimitCalc from '@/components/calculator/NationalGrowthFundLimitCalc';

export const metadata: Metadata = {
  title: '국민성장펀드 소득공제 한도 계산기 | 실질 세금 환급액 및 절세 수익률 시뮬레이터',
  description: '2026년 출시된 국민참여형 국민성장펀드의 투자금액별 소득공제 한도를 실시간 계산합니다. 4단계 누진 공제 산식(최대 1,800만 원 한도)과 실효세율 구간별 예상 세금 환급액 및 확정 선수익률을 즉시 모의 계산해 보세요.',
  keywords: [
    '국민성장펀드 소득공제 한도 계산기',
    '국민성장펀드 소득공제',
    '국민성장펀드 한도',
    '국민성장펀드 환급액',
    '국민성장펀드 계산기',
    '연말정산 소득공제 한도',
    '세금 환급액 계산기',
    '소득공제 펀드 계산'
  ],
  openGraph: {
    title: '국민성장펀드 소득공제 한도 계산기 | 실질 세금 환급액 및 절세 수익률 시뮬레이터',
    description: '2026년 출시된 국민참여형 국민성장펀드의 투자금액별 소득공제 한도를 실시간 계산합니다. 4단계 누진 공제 산식(최대 1,800만 원 한도)과 실효세율 구간별 예상 세금 환급액 및 확정 선수익률을 즉시 모의 계산해 보세요.',
    url: '/calculator/national-growth-fund-limit',
  },
  twitter: {
    card: 'summary_large_image',
    title: '국민성장펀드 소득공제 한도 계산기 | 실질 세금 환급액 및 절세 수익률 시뮬레이터',
    description: '2026년 출시된 국민참여형 국민성장펀드의 투자금액별 소득공제 한도를 실시간 계산합니다. 4단계 누진 공제 산식(최대 1,800만 원 한도)과 실효세율 구간별 예상 세금 환급액 및 확정 선수익률을 즉시 모의 계산해 보세요.',
  },
  alternates: {
    canonical: '/calculator/national-growth-fund-limit',
  }
};

export default function NationalGrowthFundLimitPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '국민성장펀드 소득공제 한도 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '2026년형 국민성장펀드 투자자들을 위한 실시간 소득공제 한도 및 세금 환급액 산출 계산기. 4단계 누진 소득공제(최대 1,800만 원)와 실효세율을 결합해 절세 수익률을 모의 계산합니다.',
    url: `${baseUrl}/calculator/national-growth-fund-limit`
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
        name: '국민성장펀드 소득공제 한도 계산기',
        item: `${baseUrl}/calculator/national-growth-fund-limit`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Script id="limit-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="limit-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NationalGrowthFundLimitCalc />
    </div>
  );
}
