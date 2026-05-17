import { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정부지원금 자주 묻는 질문(FAQ) | 복지지원금24시',
  description: '정부지원금, 기초생활수급자, 청년정책 등과 관련된 자주 묻는 질문과 답변을 모았습니다.',
  openGraph: {
    title: '정부지원금 자주 묻는 질문(FAQ)',
    description: '가장 많이 묻는 질문들을 속 시원하게 해결해드립니다.',
    url: '/faq',
    images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '정부지원금 자주 묻는 질문(FAQ)',
    description: '가장 많이 묻는 질문들을 속 시원하게 해결해드립니다.',
    images: ['https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/subsidy24-1779012468324.webp'],
  },
  alternates: {
    canonical: '/faq',
  }
};

export default function FaqPage() {
  const faqs = [
    { q: '청년도약계좌와 청년내일저축계좌는 중복 가입이 가능한가요?', a: '기본적으로 두 상품은 가입 대상과 목적이 달라 중복 가입이 원칙적으로 제한될 수 있습니다. 단, 정책 변경에 따라 일부 허용되는 경우가 있으니 관할 기관에 문의하시는 것이 가장 정확합니다.' },
    { q: '기초생활수급자 신청 시 자동차 가액 기준은 어떻게 되나요?', a: '일반적으로 2000cc 미만이며 10년 이상 된 차량, 혹은 가액이 500만 원 미만인 차량의 경우 재산 산정에서 유리하게 적용됩니다. 자세한 산정 방식은 지자체마다 다를 수 있습니다.' },
    { q: '실업급여 수급 중 아르바이트를 해도 되나요?', a: '실업급여 수급 중 소득이 발생하면 반드시 고용센터에 신고해야 합니다. 신고하지 않고 적발될 경우 부정수급으로 간주되어 지급된 급여의 환수 및 추가 징수를 받을 수 있습니다.' },
    { q: '지원금 신청은 꼭 방문해야만 하나요?', a: '최근 대부분의 정부지원금은 "보조금24" 또는 "복지로" 홈페이지를 통해 온라인으로 신청 가능합니다. 다만 일부 지자체 자체 사업의 경우 방문 접수만 받는 곳도 있습니다.' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          💬 자주 묻는 질문 <span className="text-blue-600">(FAQ)</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          가장 많이 묻는 질문들을 모아 속 시원하게 답변해드립니다.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-slate-800 dark:text-slate-200 group-open:text-blue-600 group-open:dark:text-blue-400">
              <span className="flex items-center gap-3">
                <span className="text-blue-600 dark:text-blue-400">Q.</span>
                {faq.q}
              </span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">A.</span>
              {faq.a}
            </div>
          </details>
        ))}
      </div>

    </div>
  );
}
