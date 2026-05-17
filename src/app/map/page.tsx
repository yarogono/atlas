import { FullMap } from '@/components/map/FullMap';
import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

export const metadata: Metadata = {
  title: '내 주변 사용처 찾기 | 복지지원금24시',
  description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
  openGraph: {
    title: '내 주변 사용처 찾기 | 복지지원금24시',
    description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
    url: `${baseUrl}/map`,
    type: 'website',
    images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '내 주변 사용처 찾기 | 복지지원금24시',
    description: '내 주변 고유가 피해지원금, 지역사랑상품권 사용처를 실시간 지도로 확인하세요.',
    images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
  },
  alternates: {
    canonical: `${baseUrl}/map`,
  }
};

export default function MapPage() {
  return (
    <div className="w-[100vw] relative left-[50%] -translate-x-[50%] -mt-8 -mb-8 h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] bg-white flex flex-col z-0">
      <FullMap />
    </div>
  );
}
