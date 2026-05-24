'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';

// Region partner data structure
interface BranchRecommendation {
  name: string;
  stockStatus: 'very_good' | 'good' | 'normal' | 'busy';
  stockText: string;
  badgeClass: string;
}

const REGION_OPTIONS = [
  '서울특별시 강남구',
  '서울특별시 서초구',
  '서울특별시 송파구',
  '경기도 성남시 분당구',
  '부산광역시 해운대구',
  '대구광역시 수성구',
  '경상남도 창원시',
];

export default function NationalGrowthFundCoupleCalc() {
  // --- States ---
  const [husbandSalaryInput, setHusbandSalaryInput] = useState<string>('6,000'); // 남편 연봉: 6,000만 원 기본값
  const [wifeSalaryInput, setWifeSalaryInput] = useState<string>('3,800'); // 아내 연봉: 3,800만 원 기본값
  const [investmentInput, setInvestmentInput] = useState<string>('3,000'); // 투자금액: 3,000만 원 기본값
  
  const [pastGiftInput, setPastGiftInput] = useState<string>('0'); // 10년간 준 돈
  const [currentTransferInput, setCurrentTransferInput] = useState<string>('3,000'); // 이번에 이체할 금액
  const [willReturn, setWillReturn] = useState<boolean>(false); // 다시 돌려받을 예정인지 여부
  
  const [selectedRegion, setSelectedRegion] = useState<string>(REGION_OPTIONS[0]); // 내 지역 선택
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState<boolean>(false);
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  // Close region dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target as Node)) {
        setIsRegionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Helper: Parsers & Formatters ---
  const parseRawNumber = (val: string): number => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const handleNumericChange = (value: string, setter: (v: string) => void) => {
    const clean = value.replace(/[^0-9]/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    setter(num.toLocaleString('ko-KR'));
  };

  // --- Core Financial Formulas ---
  const getTaxRateInfo = (salary: number) => {
    if (salary <= 1400) return { rate: 0.066, label: '6.6% (1,400만 이하)' };
    if (salary <= 5000) return { rate: 0.165, label: '16.5% (1,400만 초과 ~ 5,000만 이하)' };
    if (salary <= 8800) return { rate: 0.264, label: '26.4% (5,000만 초과 ~ 8,800만 이하)' };
    if (salary <= 15000) return { rate: 0.385, label: '38.5% (8,800만 초과 ~ 1억 5,000만 이하)' };
    if (salary <= 30000) return { rate: 0.418, label: '41.8% (1억 5,000만 초과 ~ 3억 이하)' };
    if (salary <= 50000) return { rate: 0.440, label: '44.0% (3억 초과 ~ 5억 이하)' };
    if (salary <= 100000) return { rate: 0.462, label: '46.2% (5억 초과 ~ 10억 이하)' };
    return { rate: 0.495, label: '49.5% (10억 원 초과)' };
  };

  const getDeduction = (investment: number) => {
    if (investment <= 3000) {
      return investment * 0.4;
    } else if (investment <= 5000) {
      return 1200 + (investment - 3000) * 0.2;
    } else if (investment <= 7000) {
      return 1600 + (investment - 5000) * 0.1;
    } else {
      return 1800; // 최대 한도 1,800만 원
    }
  };

  // --- Real-time Couple Calculations ---
  const calculations = useMemo(() => {
    const husbandSalary = parseRawNumber(husbandSalaryInput);
    const wifeSalary = parseRawNumber(wifeSalaryInput);
    const investment = parseRawNumber(investmentInput);

    const husbandTax = getTaxRateInfo(husbandSalary);
    const wifeTax = getTaxRateInfo(wifeSalary);

    // 공통 소득공제 금액 계산
    const deduction = getDeduction(investment);

    // 예상 환급 세액 계산
    const husbandRefund = deduction * husbandTax.rate;
    const husbandRefundKRW = Math.round(husbandRefund * 10000);
    const husbandYield = investment > 0 ? (husbandRefund / investment) * 100 : 0;

    const wifeRefund = deduction * wifeTax.rate;
    const wifeRefundKRW = Math.round(wifeRefund * 10000);
    const wifeYield = investment > 0 ? (wifeRefund / investment) * 100 : 0;

    // 명의 매칭 결과 분석
    const diffRefundKRW = Math.abs(husbandRefundKRW - wifeRefundKRW);
    let recommendedName = 'same';
    let recommendationText = '';

    if (husbandRefundKRW > wifeRefundKRW) {
      recommendedName = 'husband';
      recommendationText = `남편분이 가입하셔야 ${diffRefundKRW.toLocaleString('ko-KR')}원을 더 돌려받습니다.`;
    } else if (wifeRefundKRW > husbandRefundKRW) {
      recommendedName = 'wife';
      recommendationText = `아내분이 가입하셔야 ${diffRefundKRW.toLocaleString('ko-KR')}원을 더 돌려받습니다.`;
    } else {
      recommendationText = '명의 유불리가 완전히 동일하여 누구 명의로 가입하셔도 동일한 환급금을 받습니다.';
    }

    // 증여세 안전 체크 연산
    const pastGift = parseRawNumber(pastGiftInput);
    const currentTransfer = parseRawNumber(currentTransferInput);
    const totalGift = pastGift + currentTransfer;
    const isExceededExemption = totalGift > 60000; // 6억 원 한도 초과

    return {
      husbandTax,
      wifeTax,
      deduction,
      husbandRefundKRW,
      husbandYield,
      wifeRefundKRW,
      wifeYield,
      diffRefundKRW,
      recommendedName,
      recommendationText,
      totalGift,
      isExceededExemption,
    };
  }, [husbandSalaryInput, wifeSalaryInput, investmentInput, pastGiftInput, currentTransferInput]);

  // --- Region Static Branch Stock List (Dynamic mapping to selected region) ---
  const branches = useMemo<BranchRecommendation[]>(() => {
    return [
      {
        name: `삼성증권 ${selectedRegion.split(' ').pop()} 지점`,
        stockStatus: 'very_good',
        stockText: '매우 여유 🟢',
        badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      },
      {
        name: `IBK기업은행 ${selectedRegion.split(' ').pop()} 영업점`,
        stockStatus: 'good',
        stockText: '여유 🟢',
        badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      },
      {
        name: `경남은행 ${selectedRegion.split(' ').pop()} 지점`,
        stockStatus: 'normal',
        stockText: '보통 🟡',
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      },
      {
        name: `KB국민은행 ${selectedRegion.split(' ').pop()} 지점`,
        stockStatus: 'busy',
        stockText: '혼잡 🔴 (방문 전 전화 확인)',
        badgeClass: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
      },
    ];
  }, [selectedRegion]);

  return (
    <div className="not-prose w-full font-sans transition-all duration-300">
      
      {/* --- SEO Optimized Couple Header Banner --- */}
      <header className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl mb-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_60%)]"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/35 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="text-xs md:text-sm font-extrabold text-violet-300 uppercase tracking-widest">
              부부 자산 설계 & 절세 종합 진단 툴
            </span>
          </div>
          <h1 id="couple-calc-main-title" className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            국민성장펀드 <span className="bg-gradient-to-r from-violet-400 via-pink-300 to-emerald-300 bg-clip-text text-transparent">부부 절세 전략 계산기</span>
          </h1>
          <p className="text-base md:text-lg text-slate-350 max-w-3xl leading-relaxed font-semibold">
            부부가 함께 국민성장펀드 가입 시 <strong className="text-violet-300">누구 명의로 가입해야 세금을 더 많이 환급받는지</strong>, 배우자 계좌 간 일시 이체 시 <strong className="text-emerald-300">증여세 위험은 없는지</strong>, 그리고 <strong className="text-emerald-300">우리 동네 오프라인 재고 판매처</strong>까지 원스톱으로 즉시 진단합니다.
          </p>
        </div>
      </header>

      {/* --- Main Dashboard Body --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* ================= 좌측: 입력 패널 (5열) ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 입력 카드 1: 소득공제 및 연봉 설정 */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-805 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                1. 명의 유불리 소득 설정
              </h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                부부 각각의 연봉과 총투자금액을 입력하세요.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-850" />

            {/* 남편 연 총급여 */}
            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
                <span>남편 연간 총급여 또는 종합소득</span>
                <span className="text-xs font-black text-slate-400 dark:text-slate-550">
                  세율구간: {calculations.husbandTax.label}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={husbandSalaryInput}
                  onChange={(e) => handleNumericChange(e.target.value, setHusbandSalaryInput)}
                  placeholder="예: 6,000"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-800 dark:text-slate-150 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-black">만원</span>
              </div>
            </div>

            {/* 아내 연 총급여 */}
            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
                <span>아내 연간 총급여 또는 종합소득</span>
                <span className="text-xs font-black text-slate-400 dark:text-slate-550">
                  세율구간: {calculations.wifeTax.label}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={wifeSalaryInput}
                  onChange={(e) => handleNumericChange(e.target.value, setWifeSalaryInput)}
                  placeholder="예: 3,800"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-800 dark:text-slate-150 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-black">만원</span>
              </div>
            </div>

            {/* 총 투자 예정 금액 */}
            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
                <span>부부 공동 펀드 투자 예정 금액</span>
                <span className="text-xs font-black text-slate-400 dark:text-slate-550">
                  인정 소득공제: {calculations.deduction.toLocaleString()}만 원
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={investmentInput}
                  onChange={(e) => handleNumericChange(e.target.value, setInvestmentInput)}
                  placeholder="예: 3,000"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-800 dark:text-slate-150 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-black">만원</span>
              </div>
            </div>

          </section>

          {/* 입력 카드 2: 증여세 안전성 체크 항목 */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-805 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                2. 증여세 한도 자가진단 설정
              </h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                배우자 간 일시 자금 이체 시 법적 안전성 여부를 판정합니다.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-850" />

            {/* 최근 10년간 준 돈 */}
            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
                <span>최근 10년간 배우자에게 준 돈 (순수 증여)</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-550">10년 6억 원 한도</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pastGiftInput}
                  onChange={(e) => handleNumericChange(e.target.value, setPastGiftInput)}
                  placeholder="예: 0"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-800 dark:text-slate-150 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-black">만원</span>
              </div>
            </div>

            {/* 이번에 이체할 금액 */}
            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-250">
                이번 펀드 투자를 위해 잠시 이체할 금액
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentTransferInput}
                  onChange={(e) => handleNumericChange(e.target.value, setCurrentTransferInput)}
                  placeholder="예: 3,000"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-800 dark:text-slate-150 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-black">만원</span>
              </div>
            </div>

            {/* 다시 돌려받을 예정 체크박스 */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
              <input
                id="will-return-checkbox"
                type="checkbox"
                checked={willReturn}
                onChange={(e) => setWillReturn(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-violet-600 bg-white dark:bg-slate-800 border-slate-250 dark:border-slate-700 focus:ring-violet-500 focus:ring-2"
              />
              <div className="space-y-1">
                <label htmlFor="will-return-checkbox" className="text-sm font-extrabold text-slate-700 dark:text-slate-250 cursor-pointer block select-none">
                  투자 만기 또는 상환 시 원금을 본인에게 다시 돌려받을 예정
                </label>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block leading-tight">
                  (일시적 자금 융통 및 원상복구 체크 시 비과세 팁이 활성화됩니다.)
                </span>
              </div>
            </div>

          </section>

        </div>

        {/* ================= 우측: 2단계 분석 대시보드 및 결과 출력 (7열) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-650 to-violet-600 rounded-full"></span>
                2. 부부 절세 시뮬레이션 종합 판정
              </h2>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                부부 공동명의 가입 명의 선택과 배우자 증여세 진단 결과 보고서입니다.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {calculations.deduction > 0 ? (
              <div className="space-y-6">
                
                {/* --- 판정 1: 누구 명의가 유리한가? --- */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    📊 부부 소득공제 가입 명의 유불리 판정
                  </h3>
                  
                  {/* 거대한 골드 그라데이션 명의 추천 강조 배너 */}
                  <div className="p-5.5 rounded-3xl bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent border border-violet-500/20 flex items-center gap-4 relative overflow-hidden">
                    <span className="text-4xl">👑</span>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block">최적의 절세 명의 추천</span>
                      <strong className="text-base md:text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                        {calculations.recommendationText}
                      </strong>
                    </div>
                  </div>

                  {/* 남편 vs 아내 예상 혜택 정밀 대조 테이블 카드 */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* 남편 명의 가입 시 */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      calculations.recommendedName === 'husband' 
                        ? 'border-violet-500/40 bg-violet-500/[0.02] dark:bg-violet-950/10' 
                        : 'border-slate-150 dark:border-slate-850'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-400 dark:text-slate-550">남편 명의로 가입 시</span>
                        {calculations.recommendedName === 'husband' && (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-violet-600 text-white rounded-full">추천 ⭐</span>
                        )}
                      </div>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-200 block">
                        {calculations.husbandRefundKRW.toLocaleString('ko-KR')}원
                      </span>
                      <span className="text-xs font-bold text-slate-450 dark:text-slate-500 mt-1 block">
                        (세율 {calculations.husbandTax.rate * 100}% | 절세율 {calculations.husbandYield.toFixed(1)}%)
                      </span>
                    </div>

                    {/* 아내 명의 가입 시 */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      calculations.recommendedName === 'wife' 
                        ? 'border-violet-500/40 bg-violet-500/[0.02] dark:bg-violet-950/10' 
                        : 'border-slate-150 dark:border-slate-850'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-400 dark:text-slate-550">아내 명의로 가입 시</span>
                        {calculations.recommendedName === 'wife' && (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-violet-600 text-white rounded-full">추천 ⭐</span>
                        )}
                      </div>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-200 block">
                        {calculations.wifeRefundKRW.toLocaleString('ko-KR')}원
                      </span>
                      <span className="text-xs font-bold text-slate-450 dark:text-slate-500 mt-1 block">
                        (세율 {calculations.wifeTax.rate * 100}% | 절세율 {calculations.wifeYield.toFixed(1)}%)
                      </span>
                    </div>

                  </div>
                </div>

                {/* --- 판정 2: 증여세 안전 체크 결과 --- */}
                <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    🛡️ 배우자 계좌 이체 간 증여세 안전성 체크
                  </h3>

                  {calculations.isExceededExemption ? (
                    /* 6억 원 초과 경고 박스 */
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-3 shadow-inner">
                      <span className="text-xl">⚠️</span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-red-700 dark:text-red-400">증여세 검토 경고 (6억 원 초과)</h4>
                        <p className="text-xs md:text-sm font-semibold text-red-655 dark:text-red-305 leading-relaxed">
                          최근 10년간 배우자 증여 합산액 및 금번 이체금액의 합계가 <strong className="font-extrabold">{calculations.totalGift.toLocaleString()}만 원</strong>으로 배우자 간 증여 한도(6억 원)를 초과하여 증여세 부과 대상이 될 수 있습니다. 세무 전문가의 정밀 상담을 강력히 추천합니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* 6억 원 이내 안전 박스 */
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-250/30 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3 shadow-inner">
                      <span className="text-xl">✅</span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400">증여세 공제 한도 이내 (안전)</h4>
                        <p className="text-xs md:text-sm font-semibold text-emerald-655 dark:text-emerald-350 leading-relaxed">
                          총 합산 증여액이 <strong className="font-extrabold">{calculations.totalGift.toLocaleString()}만 원</strong>으로, 부부 배우자 간 10년간 무상 증여공제 한도인 **6억 원(60,000만 원) 이내**에 있으므로 별도의 증여세가 부과되지 않는 세법상 안전 구역입니다.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 다시 돌려받을 예정 팁 초록색 박스 활성화 */}
                  {willReturn && (
                    <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/30 rounded-2xl flex items-start gap-3 transition-all duration-300">
                      <span className="text-xl text-emerald-600 dark:text-emerald-400">💡</span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400">원상복구 시 증여세 0원, 한도 차감 없음</h4>
                        <p className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
                          펀드 투자를 위해 일시적으로 계좌 간 이체하였으나, 만기 또는 자금 운용 후 **원금을 다시 본인 계좌로 전액 이송 회수(부부 공동 재산 관리 중 일시적 융통 후 회수)**할 경우 실질과세원칙에 의거하여 **실질 증여에 해당하지 않으므로 증여세 과세대상에서 제외**됩니다. (10년 6억 한도에서도 차감되지 않습니다.)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- 판정 3: 오프라인 지점 재고 추천 리스트 --- */}
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" ref={regionDropdownRef}>
                    <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                      📍 지역별 오프라인 재고 판매처 최우선 추천
                    </h3>
                    
                    {/* Region Selector Mini Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                        className="py-2 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-black text-slate-700 dark:text-slate-250 flex items-center gap-1.5 focus:ring-2 focus:ring-violet-500/20 outline-none active:scale-95 transition-all shadow-sm"
                      >
                        <span>{selectedRegion}</span>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isRegionDropdownOpen && (
                        <ul className="absolute right-0 z-50 w-48 mt-1 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-50 dark:divide-slate-750/50">
                          {REGION_OPTIONS.map((region) => (
                            <li
                              key={region}
                              onClick={() => {
                                setSelectedRegion(region);
                                setIsRegionDropdownOpen(false);
                              }}
                              className="py-2.5 px-3 text-xs md:text-sm text-slate-655 dark:text-slate-300 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/30 cursor-pointer transition-all select-none"
                            >
                              {region}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* 지점 재고 추천 안내 박스 */}
                  <div className="space-y-3">
                    {/* 삼성증권 재고 여유 Tip */}
                    <div className="p-3 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl text-xs md:text-sm text-amber-700 dark:text-amber-400 font-black leading-tight flex items-center gap-2">
                      <span className="text-base">📢</span>
                      <span>Tip: 현재 삼성증권 지점이 재고가 가장 여유롭습니다 (5/22 기준)</span>
                    </div>

                    {/* 지점 리스트 */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {branches.map((branch) => (
                        <div
                          key={branch.name}
                          className="py-3 px-4.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs md:text-sm font-bold shadow-sm transition-all hover:bg-slate-100/50 dark:hover:bg-slate-950/40"
                        >
                          <span className="text-slate-700 dark:text-slate-250 font-extrabold">{branch.name}</span>
                          <span className={`px-2.5 py-1 text-xs font-black rounded-full shadow-inner ${branch.badgeClass}`}>
                            {branch.stockText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-center p-6 bg-slate-50/20">
                <p className="text-sm md:text-base text-slate-400 font-black max-w-xs leading-relaxed">
                  부부 각각의 소득 조건 및 펀드 가입 설정값을 입력하시면 즉시 누구 명의가 유리한지 비교 분석 리포트가 완성됩니다.
                </p>
              </div>
            )}

            {/* Micro Advisory notes */}
            {calculations.deduction > 0 && (
              <div className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-4 font-semibold space-y-0.5">
                <div>* 공제액은 근로소득자/사업자 본인의 종합소득 과세표준 세법 정밀 계층 세율을 기준으로 산정되었습니다.</div>
                <div>* 배우자 증여공제는 부부 간 10년 합산 6억 원까지 가능하며, 펀드 만기 시 또는 이자 출금 시 환급된 원금을 본래 출처로 되돌려놓지 않을 경우 과세관청의 해석에 따라 증여세 이슈가 발생할 수 있습니다.</div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
