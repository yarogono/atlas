'use client';

import React, { useState, useMemo } from 'react';

export default function NationalGrowthFundCalc() {
  // --- States ---
  const [investmentAmount, setInvestmentAmount] = useState<string>('3,500'); // 기본 예시 수치 3,500만 원
  const [annualSalary, setAnnualSalary] = useState<string>('7,500'); // 기본 예시 수치 7,500만 원

  // --- Helpers: Formatter & Parsers ---
  const formatNumber = (val: string) => {
    const clean = val.replace(/[^0-9]/g, ''); // 정수만 허용
    return clean ? parseInt(clean, 10).toLocaleString('ko-KR') : '';
  };

  const parseRawNumber = (val: string): number => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const handleNumericChange = (value: string, setter: (v: string) => void) => {
    setter(formatNumber(value));
  };

  // 연봉 기준 소득세율 매핑 (지방소득세 10% 포함 최신 세율 구간)
  const getTaxRateInfo = (salary: number) => {
    if (salary <= 0) return { rate: 0, text: '기본 과세구간 미지정' };
    if (salary <= 1400) return { rate: 0.066, text: '6.6% (1,400만 원 이하)' };
    if (salary <= 5000) return { rate: 0.165, text: '16.5% (1,400만 초과 ~ 5,000만 이하)' };
    if (salary <= 8800) return { rate: 0.264, text: '26.4% (5,000만 초과 ~ 8,800만 이하)' };
    if (salary <= 15000) return { rate: 0.385, text: '38.5% (8,800만 초과 ~ 1억 5,000만 이하)' };
    if (salary <= 30000) return { rate: 0.418, text: '41.8% (1억 5,000만 초과 ~ 3억 이하)' };
    if (salary <= 50000) return { rate: 0.440, text: '44.0% (3억 초과 ~ 5억 이하)' };
    if (salary <= 100000) return { rate: 0.462, text: '46.2% (5억 초과 ~ 10억 이하)' };
    return { rate: 0.495, text: '49.5% (10억 원 초과)' };
  };

  // 단축 입력 버튼 핸들러
  const handleQuickSalary = (val: string) => {
    setAnnualSalary(val);
  };

  // --- 세제 혜택 연산 엔진 ---
  const fundCalculations = useMemo(() => {
    const rawInvest = parseRawNumber(investmentAmount);
    const rawSalary = parseRawNumber(annualSalary);

    // 1. 연간 투자 한도 최대 1억 원 제한 경고 여부
    const isOverLimit = rawInvest > 10000;
    const actualInvest = Math.min(rawInvest, 10000); // 실투자액 (1억 캡)

    // 2. 세제 혜택 최대 납입 한도는 7천만 원
    const taxDeductibleInvest = Math.min(actualInvest, 7000);

    // 3. 소득공제 금액 계산 (누진 공제 산식)
    // - 3천만 원 이하 납입분: 40% 공제
    // - 3천만 원 초과 ~ 5천만 원 이하 납입분: 20% 공제
    // - 5천만 원 초과 ~ 7천만 원 이하 납입분: 10% 공제
    let deduction = 0;
    if (taxDeductibleInvest <= 3000) {
      deduction = taxDeductibleInvest * 0.40;
    } else if (taxDeductibleInvest <= 5000) {
      deduction = (3000 * 0.40) + ((taxDeductibleInvest - 3000) * 0.20);
    } else {
      deduction = (3000 * 0.40) + (2000 * 0.20) + ((taxDeductibleInvest - 5000) * 0.10);
    }

    // 4. 세율 정보 및 예상 환급금 산출
    const taxInfo = getTaxRateInfo(rawSalary);
    const refund = deduction * taxInfo.rate;

    // 5. 확정 절세 수익률 계산: (환급금 / 실제 입력한 투자금액) * 100
    const realYield = rawInvest > 0 ? (refund / rawInvest) * 100 : 0;

    return {
      actualInvest,
      taxDeductibleInvest,
      deduction,
      taxRate: taxInfo.rate * 100,
      taxBracketText: taxInfo.text,
      refund,
      realYield,
      isOverLimit
    };
  }, [investmentAmount, annualSalary]);

  const hasInputs = parseRawNumber(investmentAmount) > 0 && parseRawNumber(annualSalary) > 0;

  return (
    <div className="not-prose w-full select-none transition-all duration-300">

      {/* 국민성장펀드 메인 카드 프레임 */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">

        {/* 헤더 */}
        <div className="px-6 py-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl md:text-3xl font-black text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-2">
            국민성장펀드 절세 & 수익률 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            소득공제 최대 1,800만 원 혜택 시뮬레이션 및 연말정산 예상 환급금 & 가입 즉시 확정 절세 수익률 역산기
          </p>
        </div>

        {/* 메인 폼 */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900">

          {/* [1단계] 사용자 입력 영역 (5열 차지) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-250 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-4 bg-blue-500 rounded-full"></span>
              1단계: 투자 및 소득 입력
            </h2>

            {/* 투자 예정 금액 */}
            <div className="space-y-2.5">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                투자(예정) 금액 (만원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={investmentAmount}
                  onChange={(e) => handleNumericChange(e.target.value, setInvestmentAmount)}
                  placeholder="예: 3,500"
                  className="w-full py-4 pl-5 pr-16 font-black text-lg text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-base font-bold">만원</span>
              </div>

              {/* 한도 초과 경고 메시지 */}
              {fundCalculations.isOverLimit && (
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-455 font-bold flex items-center gap-1.5 leading-normal bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <span>⚠️ 국민성장펀드의 연간 투자 한도는 최대 1억 원(10,000만 원)입니다. 세제 혜택 한도인 7,000만 원을 초과한 납입분은 소득공제 대상에서 제외됩니다.</span>
                </div>
              )}
            </div>

            {/* 연간 총급여 */}
            <div className="space-y-2.5">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                나의 연간 총급여 또는 종합소득 (만원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={annualSalary}
                  onChange={(e) => handleNumericChange(e.target.value, setAnnualSalary)}
                  placeholder="예: 7,500"
                  className="w-full py-4 pl-5 pr-16 font-black text-lg text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-base font-bold">만원</span>
              </div>

              {/* 과세표준 구간 신속 매핑 단축 단추 */}
              <div className="space-y-2 pt-2">
                <span className="block text-sm font-bold text-slate-500 dark:text-slate-405">자주 찾는 연봉 구간 단축 버튼</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '연봉 3,500만', val: '3500' },
                    { label: '연봉 4,800만', val: '4800' },
                    { label: '연봉 7,500만 (예시)', val: '7500' },
                    { label: '연봉 9,500만', val: '9500' },
                    { label: '연봉 1억 6천만', val: '16000' },
                    { label: '연봉 3억 5천만', val: '35000' }
                  ].map(btn => (
                    <button
                      key={btn.val}
                      onClick={() => handleQuickSalary(btn.val)}
                      className={`py-3 px-3 text-center text-sm font-bold rounded-xl border transition-all active:scale-95 ${annualSalary === btn.val
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-slate-100/80 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* [2단계] 연산 결과 대시보드 (7열 차지) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <h2 className="text-lg font-black text-slate-855 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-4 bg-blue-500 rounded-full"></span>
              2단계: 예상 절세 혜택 레포트
            </h2>

            {hasInputs ? (
              <div className="space-y-6">

                {/* 3대 지표 카드 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 총 소득공제액 */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-center">
                    <span className="text-sm font-bold text-slate-550 dark:text-slate-455 uppercase tracking-widest block mb-1">총 소득공제 액수</span>
                    <span className="text-2xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight block">
                      {fundCalculations.deduction.toFixed(1).replace(/\.0$/, '')}만 원
                    </span>
                    <span className="text-xs md:text-sm text-slate-400 dark:text-slate-505 block mt-1.5 font-semibold">
                      (적용액: {fundCalculations.taxDeductibleInvest.toLocaleString()}만 원)
                    </span>
                  </div>

                  {/* 세금 환급금 */}
                  <div className="bg-yellow-50/40 dark:bg-yellow-950/10 border border-yellow-100/50 dark:border-yellow-900/30 p-5 rounded-2xl shadow-sm text-center relative overflow-hidden">
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-455 uppercase tracking-widest block mb-1">💰 예상 환급금</span>
                    <span className="text-2xl md:text-3xl font-black text-yellow-600 dark:text-yellow-455 tracking-tight block">
                      {fundCalculations.refund.toFixed(1).replace(/\.0$/, '')}만 원
                    </span>
                    <span className="text-xs md:text-sm text-yellow-600/70 dark:text-yellow-500/70 block mt-1.5 font-semibold">
                      (세율 {fundCalculations.taxRate.toFixed(1)}% 적용)
                    </span>
                  </div>

                  {/* 절세 수익률 */}
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 p-5 rounded-2xl shadow-sm text-center">
                    <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest block mb-1">📈 확정 절세 수익률</span>
                    <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                      {fundCalculations.realYield.toFixed(2)}%
                    </span>
                    <span className="text-xs md:text-sm text-emerald-550/80 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full inline-block mt-1.5 font-bold">
                      가입 즉시 확정
                    </span>
                  </div>
                </div>

                {/* 하방 안전마진 쉴드 배너 */}
                <div className="bg-blue-50/40 dark:bg-blue-950/15 border border-blue-200/40 dark:border-blue-900/30 p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="p-3.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-3xl">
                    🛡️
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-blue-700 dark:text-blue-400 m-0">
                      정부 지원 하방 안전마진 -20% 손실 방어
                    </h3>
                    <p className="text-base text-slate-650 dark:text-slate-350 leading-relaxed m-0 font-medium">
                      재정 및 운용사 자금 후순위 출자로 인해 펀드 손실 발생 시 <strong className="text-blue-600 dark:text-blue-450 font-extrabold">최대 -20%</strong>까지 우선적으로 손실을 흡수해 줍니다.
                    </p>
                  </div>
                </div>

                {/* 중간 정산 가이드텍스트 */}
                <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1">
                  <div>* 적용된 과세표준 세율구간: <strong className="text-slate-600 dark:text-slate-300 font-extrabold">{fundCalculations.taxBracketText}</strong></div>
                  <div>* 본 연산은 대한민국 종합소득세 및 지방소득세 10%가 합산 반영된 예상치이며, 연말정산 시 가입자의 기타 세액공제 한도 중복 여부에 따라 실제 정산 환급금은 일부 오차가 존재할 수 있습니다.</div>
                </div>

              </div>
            ) : (
              <div className="h-56 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-center p-6">
                <div>
                  <p className="text-base text-slate-400 max-w-[280px] leading-relaxed mx-auto font-bold">
                    나의 투자 예정 금액과 연간 총급여(소득)를 입력하면 실시간 소득공제 혜택 리포트가 열립니다.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 국민성장펀드 기초지식 및 극대화 팁 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-slate-800 dark:text-slate-200">

        {/* 국민성장펀드란? */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="text-2xl">📈</span>
            <h2 className="text-lg font-black m-0 tracking-tight text-slate-800 dark:text-slate-200">국민성장펀드란?</h2>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            정부가 주도하고 재정이 매칭 출자하여 대한민국 국가 성장 활력 분야에 집중 투자하는 정책 금융 세제 혜택 펀드 상품입니다.
          </p>
          <p className="text-base text-slate-600 dark:text-slate-350 leading-relaxed">
            국민 누구나 연간 최대 1억 원까지 자유롭게 가입할 수 있으며, 정부 정책 지원 하방 손실 흡수 기전(-20%)을 적용받아 높은 원금 보호 안전성과 기하급수적인 연말정산 소득공제 혜택을 동시에 누릴 수 있는 독보적인 재테크 수단입니다.
          </p>
        </div>

        {/* 절세 혜택 극대화 전략 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="text-2xl">💡</span>
            <h2 className="text-lg font-black m-0 tracking-tight text-slate-800 dark:text-slate-200">절세 한도 극대화 팁</h2>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            본 펀드는 <strong className="font-extrabold text-blue-600 dark:text-blue-400">연간 최대 7,000만 원 납입분</strong>까지 소득공제 혜택을 정밀 차등 누진율로 한꺼번에 적용받습니다.
          </p>
          <ul className="text-base text-slate-600 dark:text-slate-350 space-y-3.5 pl-5 list-disc leading-relaxed">
            <li><strong className="font-extrabold text-blue-655 dark:text-blue-400">3,000만 원 이하</strong> 납입분은 <strong className="font-extrabold text-blue-655 dark:text-blue-400">40%</strong>의 높은 소득공제를 받으므로, 여유자금이 있는 직장인은 최소 3,000만 원 투자가 강력히 권장됩니다.</li>
            <li><strong className="font-extrabold text-blue-655 dark:text-blue-400">7,000만 원 한도 풀(Full) 납입 시</strong> 최대 한도인 <strong className="font-extrabold text-blue-655 dark:text-blue-400">1,800만 원</strong>의 큰 과세표준 차감 소득공제 혜택이 적용됩니다.</li>
            <li>고액 연봉자일수록 과세 세율(예: 연봉 1.5억 초과 시 지방세 포함 41.8%의 소득세율)이 매우 높기 때문에 소득공제에 따른 연말 환급 금액이 훨씬 더 드라마틱하게 불어납니다!</li>
          </ul>
        </div>

        {/* 안전마진 -20% 기전 */}
        <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/40 dark:border-blue-900/30 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2.5 mb-3.5 text-blue-600 dark:text-blue-400">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-lg font-black m-0 tracking-tight text-slate-800 dark:text-slate-200">후순위 손실 흡수장치</h2>
          </div>
          <p className="text-base text-blue-850 dark:text-blue-305 leading-relaxed mb-4 font-bold">
            민간 선순위 투자자와 정부 및 금융 운용사 후순위 투자자 간의 지분 안분 구조로 하방 리스크를 강력하게 통제합니다.
          </p>
          <p className="text-base text-slate-600 dark:text-slate-350 leading-relaxed">
            투자 집행 및 자산 운용 중 예측하지 못한 손실이 발생하더라도, 정부 재정 및 운용사 등의 자금으로 매칭된 후순위 지분 출자분이 <strong className="font-extrabold text-slate-800 dark:text-slate-200">전체 투자금의 -20%까지의 최초 손실액을 완전히 감당 및 흡수</strong>해 줍니다.<br /><br />
            이로 인해 최악의 경우 시장 하락이 동반되더라도 일반 국민들의 투자금은 -20% 폭락 전까지 완벽히 보호되는 안전장치가 구현되어 있습니다.
          </p>
        </div>

      </div>

    </div>
  );
}
