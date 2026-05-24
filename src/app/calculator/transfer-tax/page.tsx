import { Metadata } from 'next';
import Script from 'next/script';
import TransferTaxCalc from '@/components/calculator/TransferTaxCalc';

export const metadata: Metadata = {
  title: '부동산 양도소득세 계산기 | 최신 양도세 비과세·장특공제 시뮬레이터',
  description: '부동산 양도소득세, 양도세, 장기보유특별공제, 다주택자 중과, 1세대1주택 비과세 여부를 양도가액 기준으로 계산합니다.',
  keywords: [
    '양도소득세 계산기',
    '양도세 계산기',
    '부동산 양도소득세',
    '장기보유특별공제',
    '1세대1주택 비과세',
    '다주택자 양도세 중과',
    '부부 공동명의 양도세',
    '양도차익 계산'
  ],
  openGraph: {
    title: '부동산 양도소득세 계산기 | 최신 양도세 비과세·장특공제 시뮬레이터',
    description: '부동산 양도소득세, 양도세, 장기보유특별공제, 다주택자 중과, 1세대1주택 비과세 여부를 양도가액 기준으로 계산합니다.',
    url: '/calculator/transfer-tax',
  },
  twitter: {
    card: 'summary_large_image',
    title: '부동산 양도소득세 계산기 | 최신 양도세 비과세·장특공제 시뮬레이터',
    description: '부동산 양도소득세, 양도세, 장기보유특별공제, 다주택자 중과, 1세대1주택 비과세 여부를 양도가액 기준으로 계산합니다.',
  },
  alternates: {
    canonical: '/calculator/transfer-tax',
  }
};

export default function TransferTaxPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '부동산 양도소득세 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '1세대 1주택 12억 원 비과세 및 고가주택 안분계산, 장기보유특별공제 및 부부 공동명의 절세 시뮬레이션을 지원하는 양도세 계산기.',
    url: `${baseUrl}/calculator/transfer-tax`
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
        name: '부동산 양도소득세 계산기',
        item: `${baseUrl}/calculator/transfer-tax`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Script id="transfer-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="transfer-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <TransferTaxCalc />
    </div>
  );
}
