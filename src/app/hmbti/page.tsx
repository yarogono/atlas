import type { Metadata } from 'next';
import HmbtiTest from '@/components/HmbtiTest';

export const metadata: Metadata = {
  title: '나의 홍명보 성향 테스트 (HMBT) | 국대 감독 자격 시험',
  description:
    '나도 감독 하면 이것보단 잘하겠다! 내 안의 전술 똥고집과 자격지심 수치를 10초 만에 측정하는 축덕 필수 밈 테스트.',
  keywords: [
    '홍명보 테스트',
    '홍명보 MBTI',
    'HMBT',
    '국대 감독 자격시험',
    '축구 심리테스트',
    '홍명보 밈',
    '축구 커뮤니티',
    '축덕 테스트',
    '감독 성향 테스트',
    '축구 밈 테스트',
  ],
  alternates: {
    canonical: '/hmbti', // TODO: 필요 시 실제 페이지 경로로 변경
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: '나의 홍명보 성향 테스트 (HMBT) | 국대 감독 자격 시험',
    description:
      '나도 감독 하면 이것보단 잘하겠다! 내 안의 전술 똥고집과 자격지심 수치를 10초 만에 측정하는 축덕 필수 밈 테스트.',
    url: '/hmbti', // TODO: 운영 도메인 적용 시 절대경로로 변경
    siteName: '홍명보 지수 밈 테스트',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: '/images/hmbti/thumbnail.png', // TODO: 공유용 썸네일 경로
        width: 1200,
        height: 630,
        alt: '국대 감독직 뺏으러 가기 HMBTI 공유 썸네일',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '나의 홍명보 성향 테스트 (HMBT) | 국대 감독 자격 시험',
    description:
      '나도 감독 하면 이것보단 잘하겠다! 내 안의 전술 똥고집과 자격지심 수치를 10초 만에 측정하는 축덕 필수 밈 테스트.',
    images: [
      {
        url: '/images/hmbti/thumbnail.png', // TODO: 공유용 썸네일 경로
        alt: '국대 감독직 뺏으러 가기 HMBTI 공유 썸네일',
      },
    ],
  },
};

export default function HmbtiPage() {
  return <HmbtiTest />;
}
