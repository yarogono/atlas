import type { Metadata } from 'next';
import HmbtiTest from '@/components/HmbtiTest';

export const metadata: Metadata = {
  title: '홍명보 지수 테스트(HMBTI)',
  description: '축구 밈과 리더십 스타일을 바탕으로 만든 유희용 HMBTI 테스트입니다.',
  alternates: {
    canonical: '/hmbti',
  },
  openGraph: {
    title: '홍명보 지수 테스트(HMBTI)',
    description: '나는 자유로운 전술가일까, 원팀 지상주의자일까? 5문항으로 확인해 보세요.',
    url: '/hmbti',
    type: 'website',
  },
};

export default function HmbtiPage() {
  return <HmbtiTest />;
}
