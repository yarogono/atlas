import Link from 'next/link';

export function MapCta() {
  return (
    <div className="not-prose my-10 bg-gradient-to-r from-blue-600 to-[#0a3d7e] rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden text-center transform transition-all hover:scale-[1.02] hover:shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10 blur-xl"></div>
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-5 shadow-inner border border-white/10">
          <span className="text-3xl">🗺️</span>
        </div>
        
        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
          내 주변 지원금 사용처 찾기
        </h3>
        
        <p className="text-blue-100 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          어디서 써야 할지 막막하신가요? <br className="md:hidden" />
          공공데이터포털 실시간 연동 지도로 <br className="hidden md:block" />
          지금 내 주변에 있는 가맹점을 1초 만에 확인하세요!
        </p>
        
        <Link 
          href="/map"
          className="inline-flex items-center justify-center bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-bold text-lg py-4 px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] gap-3"
        >
          <span>실시간 사용처 조회 지도 열기</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <p className="mt-4 text-xs text-blue-200/70">
          * 스마트폰 위치 기반 서비스 (전국 가능)
        </p>
      </div>
    </div>
  );
}
