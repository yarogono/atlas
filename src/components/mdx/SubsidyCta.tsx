import React from 'react';
import Link from 'next/link';

interface CardCompany {
  name: string;
  shortName: string;
  phone: string;
  url: string;
  color: string;
  offline: boolean;
}

export function SubsidyCta() {
  const cardCompanies: CardCompany[] = [
    { name: 'KB국민카드', shortName: 'KB', phone: '1588-1688', url: 'https://m.kbcard.com/BON/DVIEW/MBHV1103', color: 'bg-[#FFD700] text-black', offline: false },
    { name: '신한카드', shortName: '신한', phone: '1522-7777', url: 'https://www.shinhancard.com/pconts/html/myPage/governmentSupport/MOBFM591N/MOBFM591R02.html', color: 'bg-[#0B3A82] text-white', offline: false },
    { name: '삼성카드', shortName: '삼성', phone: '1588-8700', url: 'https://www.samsungcard.com', color: 'bg-[#005AAB] text-white', offline: true },
    { name: '현대카드', shortName: '현대', phone: '1577-6000', url: 'https://www.hyundaicard.com/cpb/gs/CPBGS2503_01.hc', color: 'bg-[#1A1A1A] text-white', offline: true },
    { name: '롯데카드', shortName: '롯데', phone: '1588-8300', url: 'https://www.lottecard.co.kr/app/LPEMRFA_V999.lc', color: 'bg-[#DA291C] text-white', offline: true },
    { name: '하나카드', shortName: '하나', phone: '1800-1111', url: 'https://m.hanacard.co.kr/MKGAAV9300M.web', color: 'bg-[#00928F] text-white', offline: false },
    { name: '우리카드', shortName: '우리', phone: '1588-9955', url: 'https://pc.wooricard.com', color: 'bg-[#0070C0] text-white', offline: false },
    { name: 'BC카드', shortName: 'BC', phone: '1588-4000', url: 'https://go.bccard.com/app/apply?mbNo=045&tab=', color: 'bg-[#E30039] text-white', offline: false },
    { name: 'NH농협카드', shortName: 'NH', phone: '1644-4000', url: 'https://nhpay.nonghyup.com/vu/VU400020F', color: 'bg-[#009A44] text-white', offline: false },
  ];

  return (
    <div className="not-prose bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden mb-8 md:mb-12 shadow-sm">
      {/* Header */}
      <div className="bg-[#f2f5f9] px-5 py-4 flex items-center gap-3 border-b border-slate-200">
        <div className="bg-[#0a3d7e] text-white p-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-base md:text-lg font-bold text-[#0a3d7e]">카드사별 고유가 피해지원금 2차 신청 바로가기</h2>
      </div>

      <div className="p-5 md:p-8">
        {/* Subheader */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <div className="w-1.5 h-4 bg-[#0a3d7e]"></div>
          <h3 className="text-[#0a3d7e] font-bold text-sm md:text-base">9개 카드사 — 신청 페이지 바로가기</h3>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cardCompanies.map((company, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full hover:border-[#0a3d7e] transition-colors">
              <div className="p-4 flex-grow flex items-start gap-3">
                {/* Logo */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${company.color}`}>
                  {company.shortName}
                </div>
                {/* Info */}
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm md:text-base">{company.name}</span>
                  <div className="flex items-center text-slate-500 text-xs mt-1 mb-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {company.phone}
                  </div>
                  {company.offline && (
                    <span className="inline-block bg-[#fce8e6] text-[#c5221f] text-[10px] px-1.5 py-0.5 rounded font-medium w-fit">
                      오프라인 창구 없음
                    </span>
                  )}
                </div>
              </div>
              {/* Button */}
              <Link 
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0a3d7e] hover:bg-[#1655a6] text-white flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors mt-auto"
              >
                <span>2차 신청하기</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer Notes */}
        <div className="text-xs text-slate-500 space-y-1.5">
          <p>※ 하나BC카드는 카드 앞·뒤에 BC로고가 있는 경우 <strong>BC카드</strong>에서, BC로고가 없는 경우 <strong>하나카드</strong>에서 신청하세요.</p>
          <p>※ NH농협BC카드는 카드에 BC로고가 있는 경우 <strong>BC카드</strong>에서 신청하세요.</p>
          <p>※ 삼성·현대·롯데카드는 오프라인(은행 영업점) 신청 창구가 없으니 반드시 온라인/앱으로 신청하세요.</p>
        </div>
      </div>
    </div>
  );
}
