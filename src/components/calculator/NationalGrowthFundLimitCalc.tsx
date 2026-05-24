'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';

interface LimitBracket {
  label: string;
  rate: number;
  badge: string;
}

const INCOME_LIMIT_BRACKETS: LimitBracket[] = [
  { label: '1,400만 원 이하 (실효세율 6.6%)', rate: 0.066, badge: '6.6%' },
  { label: '1,400만 원 초과 ~ 5,000만 원 이하 (실효세율 16.5%)', rate: 0.165, badge: '16.5%' },
  { label: '5,000만 원 초과 ~ 8,800만 원 이하 (실효세율 26.4%)', rate: 0.264, badge: '26.4%' },
  { label: '8,800만 원 초과 ~ 1억 5,000만 원 이하 (실효세율 38.5%)', rate: 0.385, badge: '38.5%' },
  { label: '1억 5,000만 원 초과 (실효세율 44.0% 평균 적용)', rate: 0.440, badge: '44.0%' },
];

export default function NationalGrowthFundLimitCalc() {
  // --- States ---
  const [selectedBracketIndex, setSelectedBracketIndex] = useState<number>(1); // Default to 16.5% bracket
  const [investmentInput, setInvestmentInput] = useState<string>('3,000'); // Default to 3,000만 원
  const [sliderVal, setSliderVal] = useState<number>(3000);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync inputs (Text Input <-> Slider)
  const parseRawNumber = (val: string): number => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const handleTextChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    
    // Cap at 2억 (20,000만 원)
    const cappedNum = Math.min(num, 20000);
    setInvestmentInput(cappedNum ? cappedNum.toLocaleString('ko-KR') : '');
    setSliderVal(cappedNum);
  };

  const handleSliderChange = (val: number) => {
    setSliderVal(val);
    setInvestmentInput(val.toLocaleString('ko-KR'));
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseRawNumber(investmentInput);
    const updated = Math.min(current + amount, 20000);
    setInvestmentInput(updated.toLocaleString('ko-KR'));
    setSliderVal(updated);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Real-time Calculations ---
  const computations = useMemo(() => {
    const investment = parseRawNumber(investmentInput);
    const bracket = INCOME_LIMIT_BRACKETS[selectedBracketIndex];

    // A. 누진 소득공제액 계산:
    // - 투자금액이 3,000만 원 이하: 투자금액 * 0.4
    // - 투자금액이 3,000만 초과 ~ 5,000만 이하: 1,200만 + (투자금액 - 3,000만) * 0.2
    // - 투자금액이 5,000만 초과 ~ 7,000만 이하: 1,600만 + (투자금액 - 5,000만) * 0.1
    // - 투자금액이 7,000만 초과: 최대 한도인 1,800만 원 고정
    let deduction = 0;
    if (investment <= 3000) {
      deduction = investment * 0.4;
    } else if (investment <= 5000) {
      deduction = 1200 + (investment - 3000) * 0.2;
    } else if (investment <= 7000) {
      deduction = 1600 + (investment - 5000) * 0.1;
    } else {
      deduction = 1800; // Capped at 1,800만 원
    }

    // B. 예상 세금 환급액 계산:
    // - 환급액 = [누진 소득공제액] * [선택한 구간의 실효세율(%)]
    const refund = deduction * bracket.rate; // 만 원 단위
    const refundKRW = Math.round(refund * 10000); // 원 단위

    // C. 투자금 대비 확정 절세 수익률 계산:
    // - 절세 수익률 = (예상 세금 환급액 / 투자 예정 금액) * 100
    const taxSavingsYield = investment > 0 ? (refund / investment) * 100 : 0;

    return {
      investment,
      deduction,
      refund,
      refundKRW,
      taxSavingsYield,
      bracket,
    };
  }, [investmentInput, selectedBracketIndex]);

  return (
    <div className="not-prose w-full font-sans transition-all duration-300">
      
      {/* --- SEO Rich Header Banner --- */}
      <header className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs md:text-sm font-extrabold text-indigo-300 uppercase tracking-widest">
              국민참여형 정책금융 절세 분석기
            </span>
          </div>
          <h1 id="limit-calc-main-title" className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            국민성장펀드 <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300 bg-clip-text text-transparent">소득공제 한도 계산기</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-3xl leading-relaxed font-semibold">
            2026년 신규 출시된 <strong className="text-indigo-300">국민성장펀드</strong>의 납입금액별 4단계 누진 소득공제 혜택과 종합소득세율 구간을 결합하여, 나의 실질 환급 세액 및 절세 선수익률을 즉시 모의 계산합니다.
          </p>
        </div>
      </header>

      {/* --- Dashboard Container --- */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* ================= 좌측: 1. 입력 설정 영역 (5열) ================= */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md p-6 md:p-8 space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
              1. 국민성장펀드 투자 조건 입력
            </h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
              투자 예정 금액과 소득 과세표준 구간을 설정해 주세요.
            </p>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* 1. 나의 소득 구간 선택 (과세표준 기준) */}
          <div className="space-y-3 relative" ref={dropdownRef}>
            <label id="limit-bracket-label" className="block text-base font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
              <span>나의 종합소득 과세표준 구간</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">(지방세 포함 실효세율)</span>
            </label>
            
            <button
              id="limit-bracket-select"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full py-4.5 px-5 text-left bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all active:scale-[0.99] group shadow-sm"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-labelledby="limit-bracket-label"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">선택된 소득세율 구간</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-150">
                  {INCOME_LIMIT_BRACKETS[selectedBracketIndex].label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-sm">
                  {INCOME_LIMIT_BRACKETS[selectedBracketIndex].badge}
                </span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-350 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isDropdownOpen && (
              <ul
                role="listbox"
                className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto outline-none py-2 border-collapse scrollbar-thin divide-y divide-slate-100 dark:divide-slate-700/50"
              >
                {INCOME_LIMIT_BRACKETS.map((bracket, index) => (
                  <li
                    key={index}
                    role="option"
                    aria-selected={selectedBracketIndex === index}
                    onClick={() => {
                      setSelectedBracketIndex(index);
                      setIsDropdownOpen(false);
                    }}
                    className={`py-3.5 px-5 flex items-center justify-between cursor-pointer transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/40 select-none ${
                      selectedBracketIndex === index ? 'bg-indigo-50/50 dark:bg-indigo-950/25' : ''
                    }`}
                  >
                    <span className={`text-sm md:text-base font-bold ${
                      selectedBracketIndex === index 
                        ? 'text-indigo-600 dark:text-indigo-400 font-black' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {bracket.label}
                    </span>
                    {selectedBracketIndex === index && (
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 2. 투자 예정 금액 입력 및 슬라이더 병행 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-250">
                국민성장펀드 투자 예정 금액
              </label>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">(최대 2억 원 한도)</span>
            </div>

            {/* Linked Numeric Input */}
            <div className="relative">
              <input
                id="limit-investment-input"
                type="text"
                value={investmentInput}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="예: 3,000"
                className="w-full py-4.5 pl-6 pr-16 font-black text-xl text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-base font-black">
                만원
              </span>
            </div>

            {/* Linked Range Slider */}
            <div className="space-y-2 pt-1">
              <input
                id="limit-investment-slider"
                type="range"
                min="100"
                max="20000"
                step="100"
                value={sliderVal}
                onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none bg-slate-200 dark:bg-slate-700 accent-indigo-650"
              />
              <div className="flex justify-between text-xs font-black text-slate-400 dark:text-slate-500 px-1">
                <span>최소 100만</span>
                <span>5,000만</span>
                <span>1억</span>
                <span>1억 5천만</span>
                <span>최대 2억 (한도)</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { label: '+500만', val: 500 },
                { label: '+1천만', val: 1000 },
                { label: '+3천만', val: 3000 },
                { label: '+5천만', val: 5000 },
              ].map((chip) => (
                <button
                  key={chip.val}
                  onClick={() => handleQuickAdd(chip.val)}
                  className="py-2.5 px-1 text-center text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  {chip.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setInvestmentInput('3,000');
                  setSliderVal(3000);
                }}
                className="py-2.5 px-1 text-center text-xs font-black rounded-xl border border-transparent bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all"
              >
                초기화
              </button>
            </div>

            {/* Capping Advice Messages */}
            {computations.investment > 7000 && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-2 shadow-inner">
                <span className="text-sm">💡</span>
                <span>
                  투자 예정 금액이 7,000만 원을 초과하면 최대 소득공제 한도액인 **1,800만 원**에 도달합니다. 세법상 이에 따른 추가 세액공제 한도액은 고정되므로, 초과 납입분은 여유자금 계획에 따라 신중히 결정해 주시기 바랍니다.
                </span>
              </div>
            )}
          </div>

        </section>

        {/* ================= 우측: 2. 소득공제 및 절세 분석 카드 출력 UI (7열) ================= */}
        <section className="lg:col-span-7 flex flex-col gap-6 justify-between">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
                2. 국민성장펀드 소득공제 연산 결과
              </h2>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                입력된 투자금액과 소득세율 기준으로 산출된 실시간 절세 혜택 보고서입니다.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {computations.investment > 0 ? (
              <div className="space-y-6 flex-1 flex flex-col justify-around">
                
                {/* --- 출력 UI Card 1: 인정 소득공제액 --- */}
                <div className="group relative p-5 bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-850 dark:to-indigo-950/10 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-500/20">
                  <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-750 text-slate-655 dark:text-slate-350">
                    최대 1,800만 원 한도
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-405 dark:text-slate-500 uppercase tracking-widest block">
                      인정 소득공제액 상세
                    </span>
                    <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-305 leading-relaxed pr-24">
                      투자하신 금액 <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{computations.investment.toLocaleString()}만 원</strong> 중, 소득공제가 인정되는 금액은 총 <strong className="text-indigo-650 dark:text-indigo-400 font-black text-lg md:text-xl">{computations.deduction.toLocaleString()}만 원</strong>입니다.
                    </p>
                  </div>
                </div>

                {/* --- 출력 UI Card 2: 예상 세금 환급액 --- */}
                <div className="group relative p-6 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border-2 border-dashed border-amber-500/30 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/50">
                  <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    세율 {computations.bracket.badge} 적용
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-black text-amber-505 dark:text-amber-500 uppercase tracking-widest block">
                      💰 예상 세금 환급액 (X)
                    </span>
                    <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      연말정산(또는 종합소득세 신고) 시 예상되는 세금 환급액은 약{' '}
                      <strong className="text-2xl md:text-3xl font-black text-amber-650 dark:text-amber-450 tracking-tight block mt-1.5 drop-shadow-sm">
                        {computations.refundKRW.toLocaleString()}원
                      </strong>
                    </p>
                  </div>
                </div>

                {/* --- 출력 UI Card 3: 확정 선수익 효과 --- */}
                <div className="group relative p-5 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border border-emerald-500/20 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/40">
                  <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 animate-pulse">
                    가입 즉시 확정 효과
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest block">
                      📈 투자금 대비 절세 수익률 (Y)
                    </span>
                    <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      이 환급액은 투자 원금 대비 약{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        +{computations.taxSavingsYield.toFixed(2)}%
                      </strong>
                      의 <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">'확정 선수익'</strong>을 확보하는 효과와 같습니다.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-center p-6 bg-slate-50/20">
                <div className="space-y-2">
                  <span className="text-4xl block">🗳️</span>
                  <p className="text-base text-slate-400 max-w-sm leading-relaxed mx-auto font-black">
                    국민성장펀드 투자금액과 소득 과세표준 구간을 설정해 주시면 실시간 4단계 누진 절세 레포트가 생성됩니다.
                  </p>
                </div>
              </div>
            )}

            {/* Mini Ledger */}
            {computations.investment > 0 && (
              <div className="text-[11px] text-slate-450 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-4 font-semibold space-y-0.5">
                <div>* 소득공제 누진 구간별 혜택 비율: 3천만 이하 40%, 3천~5천만 20%, 5천~7천만 10%, 7천만 초과 고정</div>
                <div>* 실효 환급액은 근로소득자/종합소득세 신고자 본인의 기납부세액 및 타 소득공제 항목 중복 여부에 따라 정산 시 실제 수령액과 일부 차이가 있을 수 있습니다.</div>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* ================= 4. 유의사항 안내 박스 (회색 배경) ================= */}
      <footer className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-150">
          <span className="text-xl">⚠️</span>
          <h3 className="text-base font-black m-0">국민성장펀드 가입 가이드 및 핵심 유의사항</h3>
        </div>
        
        <ul className="text-xs md:text-sm text-slate-500 dark:text-slate-400 space-y-3 pl-5 list-disc leading-relaxed font-semibold">
          <li>
            <strong className="text-slate-700 dark:text-slate-300">3년 의무 유지 조건:</strong> 본 세제 혜택은 3년 이상 장기 투자 시에만 유지되며, 3년 이내에 중도 해지하거나 타인에게 양도 시 감면 받았던 소득세 세액이 전액 추징될 수 있으므로 여유 투자기간을 신중히 고려해야 합니다.
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-300">5년 만기 폐쇄형 구조:</strong> 본 펀드는 5년 만기 환매금지형(폐쇄형) 상품으로, 만기가 도달하기 전까지 중간에 원금의 중도 출금 또는 부분 환매가 불가능합니다. 따라서 반드시 당장 쓰지 않는 장기 여유 자금을 기반으로 투자 금액을 역산하여 운용하셔야 합니다.
          </li>
        </ul>
      </footer>

    </div>
  );
}
