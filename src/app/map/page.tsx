import { FullMap } from '@/components/map/FullMap';
import { Metadata } from 'next';
import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

const mapThumbnailUrl = 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/map-thumbnail.webp';

export const metadata: Metadata = {
  title: '내 주변 사용처 찾기 | 복지지원금24시',
  description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
  openGraph: {
    title: '내 주변 사용처 찾기 | 복지지원금24시',
    description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
    url: `${baseUrl}/map`,
    type: 'website',
    images: [
      {
        url: mapThumbnailUrl,
        width: 1200,
        height: 630,
        alt: '내 주변 사용처 찾기 지도 | 복지지원금24시',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '내 주변 사용처 찾기 | 복지지원금24시',
    description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
    images: [
      {
        url: mapThumbnailUrl,
        width: 1200,
        height: 630,
        alt: '내 주변 사용처 찾기 지도 | 복지지원금24시',
      }
    ]
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

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/map#webpage`,
    'url': `${baseUrl}/map`,
    'name': '내 주변 사용처 찾기 | 복지지원금24시',
    'description': '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
    'publisher': {
      '@type': 'Organization',
      'name': '복지지원금24시',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/favicon.png'
      }
    },
    'image': mapThumbnailUrl,
    'thumbnailUrl': mapThumbnailUrl,
    'primaryImageOfPage': {
      '@type': 'ImageObject',
      'url': mapThumbnailUrl
    }
  };

  return (
    <div className="w-[100vw] relative left-[50%] -translate-x-[50%] -mt-8 -mb-8 h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] bg-white flex flex-col z-0">
      <Script id="map-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="map-webpage-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }} />
      <FullMap />
    </div>
  );
}

