import { Metadata } from 'next';
import Script from 'next/script';
import NationalGrowthFundCoupleCalc from '@/components/calculator/NationalGrowthFundCoupleCalc';

export const metadata: Metadata = {
  title: '국민성장펀드 부부 절세 전략 계산기 | 연말정산 누구 명의가 유리할까?',
  description: '부부가 함께 국민성장펀드 가입 시 누구 명의로 가입해야 더 많은 세금 환급금을 받는지 실시간 비교합니다. 배우자 간 6억 원 증여세 공제 한도 안전 검증 및 우리 동네 오프라인 재고 여유 판매처 정보까지 확인해 보세요.',
  keywords: [
    '국민성장펀드 부부 계산기',
    '국민성장펀드 명의 비교',
    '국민성장펀드 부부 절세',
    '부부 세금 환급금 비교',
    '배우자 증여세 한도',
    '부부 절세 전략',
    '국민성장펀드 오프라인 판매처',
    '국민성장펀드 재고'
  ],
  openGraph: {
    title: '국민성장펀드 부부 절세 전략 계산기 | 연말정산 누구 명의가 유리할까?',
    description: '부부가 함께 국민성장펀드 가입 시 누구 명의로 가입해야 더 많은 세금 환급금을 받는지 실시간 비교합니다. 배우자 간 6억 원 증여세 공제 한도 안전 검증 및 우리 동네 오프라인 재고 여유 판매처 정보까지 확인해 보세요.',
    url: '/calculator/national-growth-fund-couple',
  },
  twitter: {
    card: 'summary_large_image',
    title: '국민성장펀드 부부 절세 전략 계산기 | 연말정산 누구 명의가 유리할까?',
    description: '부부가 함께 국민성장펀드 가입 시 누구 명의로 가입해야 더 많은 세금 환급금을 받는지 실시간 비교합니다. 배우자 간 6억 원 증여세 공제 한도 안전 검증 및 우리 동네 오프라인 재고 여유 판매처 정보까지 확인해 보세요.',
  },
  alternates: {
    canonical: '/calculator/national-growth-fund-couple',
  }
};

export default function NationalGrowthFundCouplePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '국민성장펀드 부부 절세 전략 계산기',
    operatingSystem: 'Any',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW'
    },
    description: '부부를 위한 국민성장펀드 가입 명의 유불리 판단기 및 배우자 간 증여세 법적 한도 실시간 검증 툴. 지역별 오프라인 실시간 판매처 리스트 추천 기능 내장.',
    url: `${baseUrl}/calculator/national-growth-fund-couple`
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
        name: '국민성장펀드 부부 절세 전략 계산기',
        item: `${baseUrl}/calculator/national-growth-fund-couple`
      }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Script id="couple-calc-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="couple-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NationalGrowthFundCoupleCalc />
    </div>
  );
}
