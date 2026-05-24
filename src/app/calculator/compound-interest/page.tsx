import { Metadata } from 'next';
import Script from 'next/script';
import CompoundInterestCalc from '@/components/calculator/CompoundInterestCalc';

export const metadata: Metadata = {
  title: '간편 복리계산기 | 주식·코인·적립식 복리 수익률 계산기',
  description: '누구나 사용하기 쉬운 간편 복리계산기입니다. 주식, 코인(비트코인), 적립식 투자의 일복리, 월복리, 연복리 수익률을 차트와 함께 한눈에 확인해보세요. 복리의 마법을 지금 경험하세요.',
  keywords: [
    '복리계산기',
    '주식복리계산기',
    '일복리계산기',
    '간편복리계산기',
    '코인복리계산기',
    '쉬운복리계산기',
    '월복리계산기',
    '연복리계산기',
    '복복리계산기',
    '복리매매',
    '수익률계산기',
    '적립식복리계산기',
    '달러복리계산기',
    '복리의마법'
  ],
  openGraph: {
    title: '간편 복리계산기 | 주식·코인·적립식 복리 수익률 계산기',
    description: '누구나 사용하기 쉬운 간편 복리계산기입니다. 주식, 코인(비트코인), 적립식 투자의 일복리, 월복리, 연복리 수익률을 차트와 함께 한눈에 확인해보세요. 복리의 마법을 지금 경험하세요.',
    url: '/calculator/compound-interest',
  },
  twitter: {
    card: 'summary_large_image',
    title: '간편 복리계산기 | 주식·코인·적립식 복리 수익률 계산기',
    description: '누구나 사용하기 쉬운 간편 복리계산기입니다. 주식, 코인(비트코인), 적립식 투자의 일복리, 월복리, 연복리 수익률을 차트와 함께 한눈에 확인해보세요. 복리의 마법을 지금 경험하세요.',
  },
  alternates: {
    canonical: '/calculator/compound-interest',
  }
};

export default function CompoundInterestPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '간편 복리계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '주식, 코인, 적립식 투자 등의 일복리, 월복리, 연복리 계산을 차트 및 보고서와 함께 지원하는 금융 도구.',
    url: `${baseUrl}/calculator/compound-interest`
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
        name: '간편 복리계산기',
        item: `${baseUrl}/calculator/compound-interest`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Script id="compound-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="compound-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CompoundInterestCalc />
    </div>
  );
}
