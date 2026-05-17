import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정부지원금 종합 가이드 | 복지지원금24시',
  description: '청년, 소상공인, 기초수급자 등 대상별 핵심 정부지원금 정책을 한눈에 정리한 종합 가이드입니다.',
  openGraph: {
    title: '정부지원금 종합 가이드',
    description: '나에게 맞는 정책, 종합 가이드에서 한눈에 확인하세요.',
    url: '/guide',
  },
  alternates: {
    canonical: '/guide',
  }
};

export default function GuidePage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          📖 정부지원금 <span className="text-blue-600">종합 가이드</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          대상별, 목적별로 나에게 맞는 정책을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { title: '청년 특별대책', desc: '만 19~34세 청년을 위한 주거, 일자리, 금융 지원 정책 모음', color: 'bg-blue-50 dark:bg-slate-800', url: '/posts/sample-post' },
          { title: '소상공인/자영업자', desc: '경영 안정자금, 이자 지원, 고용유지 지원금 등 총정리', color: 'bg-green-50 dark:bg-slate-800', url: '/posts/third-post' },
          { title: '취약계층/저소득층', desc: '기초생활수급자, 차상위계층을 위한 생계비 및 의료비 지원', color: 'bg-yellow-50 dark:bg-slate-800', url: '/posts/2026-oil-support-guide' },
          { title: '임산부/영유아/육아', desc: '부모급여, 아동수당, 산후조리 지원, 보육료 지원 혜택', color: 'bg-pink-50 dark:bg-slate-800', url: '/eligibility' },
          { title: '구직자/실업자', desc: '실업급여, 국민취업지원제도, 내일배움카드 활용법', color: 'bg-purple-50 dark:bg-slate-800', url: '/calculator' },
          { title: '주거/부동산', desc: '전세자금 대출, 월세 지원, 청년 도약 계좌 등 주거 안정 지원', color: 'bg-indigo-50 dark:bg-slate-800', url: '/posts/second-post' },
        ].map((item, i) => (
          <Link key={i} href={item.url} className={`${item.color} rounded-3xl p-8 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all group`}>
            <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            <div className="mt-6 flex items-center text-sm font-bold text-blue-600 dark:text-blue-400">
              자세히 보기 <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
