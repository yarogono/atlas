import { Metadata } from 'next';
import Script from 'next/script';
import EligibilityClient from './EligibilityClient';

export const metadata: Metadata = {
  title: '고유가 피해지원금 1분 확인 | 대상 조회',
  description: '건강보험료를 입력하면 받을 수 있는 고유가 피해지원금 금액을 즉시 확인합니다.',
  openGraph: {
    title: '고유가 피해지원금 1분 확인 | 대상 조회',
    description: '건강보험료를 입력하면 받을 수 있는 고유가 피해지원금 금액을 즉시 확인합니다.',
    url: '/eligibility',
  },
  twitter: {
    card: 'summary_large_image',
    title: '고유가 피해지원금 1분 확인 | 대상 조회',
    description: '건강보험료를 입력하면 받을 수 있는 고유가 피해지원금 금액을 즉시 확인합니다.',
  },
  alternates: {
    canonical: '/eligibility',
  }
};

export default function EligibilityPage() {
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
        name: '고유가 피해지원금 1분 확인',
        item: `${baseUrl}/eligibility`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <Script id="eligibility-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <EligibilityClient />
    </div>
  );
}
