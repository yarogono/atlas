import { Metadata } from 'next';
import Script from 'next/script';
import StockAverageCalc from '@/components/calculator/StockAverageCalc';

export const metadata: Metadata = {
  title: '주식·코인 평단가 계산기 | 실시간 물타기 평균단가 계산기',
  description: '물타기 계산기는 주식 또는 코인의 추가 매입 시 평단가를 계산하기 위한 도구입니다. 평단가 계산기를 통해 자산의 평균 취득 단가를 계산하세요.',
  keywords: [
    '주식 평단가 계산기',
    '코인 평단가 계산기',
    '주식 평균단가 계산기',
    '코인 평균단가 계산기',
    '주식 물타기 계산기',
    '코인 물타기 계산기'
  ],
  openGraph: {
    title: '주식·코인 평단가 계산기 | 실시간 물타기 평균단가 계산기',
    description: '물타기 계산기는 주식 또는 코인의 추가 매입 시 평단가를 계산하기 위한 도구입니다. 평단가 계산기를 통해 자산의 평균 취득 단가를 계산하세요.',
    url: '/calculator/stock-average',
  },
  twitter: {
    card: 'summary_large_image',
    title: '주식·코인 평단가 계산기 | 실시간 물타기 평균단가 계산기',
    description: '물타기 계산기는 주식 또는 코인의 추가 매입 시 평단가를 계산하기 위한 도구입니다. 평단가 계산기를 통해 자산의 평균 취득 단가를 계산하세요.',
  },
  alternates: {
    canonical: '/calculator/stock-average',
  }
};

export default function StockAveragePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '주식 물타기 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '물타기 이후의 최종 평단가를 실시간으로 계산하고, 목표 평단가 도달을 위한 매수량을 역산하는 스마트 주식 도구.',
    url: `${baseUrl}/calculator/stock-average`
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
        name: '주식 물타기 계산기',
        item: `${baseUrl}/calculator/stock-average`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Script id="stock-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="stock-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <StockAverageCalc />
    </div>
  );
}
