import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정부지원금 대상 조회기 | 내 자격 조건 1분만에 확인',
  description: '청년, 소상공인, 저소득층 등 다양한 정부지원금과 복지 정책 중 내가 신청할 수 있는 대상을 빠르게 조회해보세요.',
  openGraph: {
    title: '정부지원금 대상 조회기 | 내 자격 조건 1분만에 확인',
    description: '내가 받을 수 있는 지원금, 자격이 되는지 바로 확인해보세요.',
    url: '/eligibility',
  },
  alternates: {
    canonical: '/eligibility',
  }
};

export default function EligibilityPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          ✅ 정부지원금 <span className="text-blue-600">대상 조회기</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 break-keep">
          나는 어떤 지원금을 받을 수 있을까?<br className="md:hidden" /> 몇 가지 질문에 답하고 나에게 맞는 정책을 찾아보세요.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100 dark:border-slate-700 mb-12">
        <div className="space-y-8">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Q1. 현재 연령대가 어떻게 되시나요?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">청년 (만 19~34세)</button>
              <button className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">중장년 (만 35~64세)</button>
              <button className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">노년 (만 65세 이상)</button>
              <button className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">해당 없음</button>
            </div>
          </div>
          
          <div className="text-center">
            <button className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold py-3 px-8 rounded-full cursor-not-allowed">다음 단계로</button>
          </div>
        </div>
      </div>

      {/* Adsense / Ad Placeholder */}
      <div className="w-full h-[100px] bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-sm mb-12">
        [ 구글 애드센스 광고 영역 ]
      </div>

      <div className="text-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">예상 지원금이 궁금하다면?</p>
        <Link href="/calculator" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
          🧮 3초 계산기로 이동하기 &rarr;
        </Link>
      </div>
    </div>
  );
}
