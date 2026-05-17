import { Metadata } from 'next';
import EligibilityClient from './EligibilityClient';

export const metadata: Metadata = {
  title: '고유가 피해지원금 1분 확인 | 대상 조회',
  description: '건강보험료를 입력하면 받을 수 있는 고유가 피해지원금 금액을 즉시 확인합니다.',
  openGraph: {
    title: '고유가 피해지원금 1분 확인 | 대상 조회',
    description: '건강보험료를 입력하면 받을 수 있는 고유가 피해지원금 금액을 즉시 확인합니다.',
    url: '/eligibility',
    images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '고유가 피해지원금 1분 확인 | 대상 조회',
    description: '건강보험료를 입력하면 받을 수 있는 고유가 피해지원금 금액을 즉시 확인합니다.',
    images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
  },
  alternates: {
    canonical: '/eligibility',
  }
};

export default function EligibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <EligibilityClient />
    </div>
  );
}
