import { Metadata } from 'next';
import Script from 'next/script';
import NationalGrowthFundCalc from '@/components/calculator/NationalGrowthFundCalc';

export const metadata: Metadata = {
  title: '국민성장펀드 절세 계산기 & 수익률 계산기 | 연말정산 환급금 시뮬레이터',
  description: '국민성장펀드 절세 계산기 및 국민성장펀드 수익률 계산기 서비스를 제공합니다. 연봉과 펀드 투자금액을 입력하고, 연말정산 세액 소득공제 환급금과 가입 즉시 얻는 확정 절세 수익률을 실시간 시뮬레이션해 보세요.',
  keywords: [
    '국민성장펀드 절세 계산기',
    '국민성장펀드 수익률 계산기',
    '국민성장펀드 계산기',
    '국민성장펀드 소득공제 계산기',
    '국민성장펀드 환급금 계산기',
    '연말정산 소득공제',
    '연말정산 환급금',
    '종합소득세율 환급',
    '세제혜택 펀드'
  ],
  openGraph: {
    title: '국민성장펀드 절세 계산기 & 수익률 계산기 | 연말정산 환급금 시뮬레이터',
    description: '국민성장펀드 절세 계산기 및 국민성장펀드 수익률 계산기 서비스를 제공합니다. 연봉과 펀드 투자금액을 입력하고, 연말정산 세액 소득공제 환급금과 가입 즉시 얻는 확정 절세 수익률을 실시간 시뮬레이션해 보세요.',
    url: '/calculator/national-growth-fund',
  },
  twitter: {
    card: 'summary_large_image',
    title: '국민성장펀드 절세 계산기 & 수익률 계산기 | 연말정산 환급금 시뮬레이터',
    description: '국민성장펀드 절세 계산기 및 국민성장펀드 수익률 계산기 서비스를 제공합니다. 연봉과 펀드 투자금액을 입력하고, 연말정산 세액 소득공제 환급금과 가입 즉시 얻는 확정 절세 수익률을 실시간 시뮬레이션해 보세요.',
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
    name: '국민성장펀드 절세 계산기 & 수익률 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '국민성장펀드 절세 계산기 및 국민성장펀드 수익률 계산기. 투자예정 금액과 연간 소득을 기반으로 연말정산 소득공제 예상 환급 세액 및 실질 절세 수익률을 실시간 산출하는 계산기.',
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
        name: '국민성장펀드 절세 & 수익률 계산기',
        item: `${baseUrl}/calculator/national-growth-fund`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Script id="fund-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="fund-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NationalGrowthFundCalc />
    </div>
  );
}
