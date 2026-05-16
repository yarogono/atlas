import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사이트 소개',
  description: '복지지원금24시의 운영 목적과 제공하는 서비스에 대해 안내해 드립니다.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
          복잡한 정부지원금, <br className="hidden md:block" />
          <span className="text-blue-600">누구나 쉽고 빠르게.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          복지지원금24시는 매년 쏟아지는 수천 개의 정부 복지 정책과 지원금 정보를
          가장 이해하기 쉬운 형태로 정리하여 전달하는 정보 큐레이션 서비스입니다.
        </p>
      </div>

      {/* Mission */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">우리의 미션</h2>
        </div>
        <p className="text-slate-600 leading-loose text-lg mb-6">
          "몰라서 못 받는 지원금이 없도록 하자."
        </p>
        <p className="text-slate-600 leading-relaxed">
          정부 예산은 매년 편성되지만, 신청 방법이 복잡하거나 홍보 부족으로 인해 
          정작 필요한 분들이 혜택을 받지 못하는 경우가 많습니다. 
          저희는 공공기관의 공식 보도자료와 정책 문서를 심층 분석하여, 
          일반인의 눈높이에 맞춘 가독성 높은 가이드를 제공함으로써 정보의 비대칭을 해소하고자 합니다.
        </p>
      </section>

      {/* Core Values */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 정확한 정보</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            기획재정부, 보건복지부 등 정부 각 부처의 공식 보도자료와 브리핑만을 기반으로 콘텐츠를 제작하여 가짜 뉴스를 차단합니다.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-4">⏱️ 빠른 소식</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            선착순으로 마감되는 지자체 지원금이나 한시적 지원금 소식을 그 누구보다 빠르게 캐치하여 신속하게 안내합니다.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <section className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8">
        <h3 className="text-red-800 font-bold mb-3 flex items-center gap-2">
          <span>⚠️</span> 면책 조항 및 주의사항 (Disclaimer)
        </h3>
        <ul className="text-red-700 text-sm space-y-2 list-disc list-inside opacity-90 leading-relaxed">
          <li>본 사이트는 정부 및 공공기관이 운영하는 공식 사이트가 아니며, 개인/법인이 운영하는 정보 제공 블로그입니다.</li>
          <li>사이트 내 모든 콘텐츠는 작성일 기준의 정책을 바탕으로 작성되었으며, 이후 정부 지침 변경에 따라 내용이 달라질 수 있습니다.</li>
          <li>본 사이트는 방문자의 지원금 신청 결과나 정책 활용으로 인해 발생하는 어떠한 직/간접적 손해에 대해서도 법적 책임을 지지 않습니다.</li>
          <li>최종적이고 정확한 정보는 반드시 해당 정책을 주관하는 정부 부처나 주민센터, 공식 누리집(gov.kr 등)을 통해 확인하시기 바랍니다.</li>
        </ul>
      </section>
    </div>
  );
}
