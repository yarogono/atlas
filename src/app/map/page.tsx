import { FullMap } from '@/components/map/FullMap';
import { Metadata } from 'next';
import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

export const metadata: Metadata = {
  title: '내 주변 사용처 찾기 | 복지지원금24시',
  description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
  openGraph: {
    title: '내 주변 사용처 찾기 | 복지지원금24시',
    description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
    url: `${baseUrl}/map`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '내 주변 사용처 찾기 | 복지지원금24시',
    description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
  },
  alternates: {
    canonical: `${baseUrl}/map`,
  }
};

export default function MapPage() {
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
        name: '내 주변 사용처 찾기',
        item: `${baseUrl}/map`
      }
    ]
  };

  return (
    <div className="w-[100vw] relative left-[50%] -translate-x-[50%] -mt-8 -mb-8 h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] bg-white flex flex-col z-0">
      <Script id="map-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <FullMap />
    </div>
  );
}
