'use client';

import React, { useState, useMemo } from 'react';

type PropertyType = 'house' | 'coupon' | 'right' | 'land' | 'other';
type OwnershipType = '1home' | '2home' | 'more';

export default function TransferTaxCalc() {
  // --- States ---
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [ownership, setOwnership] = useState<OwnershipType>('1home');

  // 체크박스 옵션
  const [basicDeduction, setBasicDeduction] = useState<boolean>(true);
  const [jointOwnership, setJointOwnership] = useState<boolean>(false);
  const [isSpeculative, setIsSpeculative] = useState<boolean>(false);
  const [livedTwoYears, setLivedTwoYears] = useState<boolean>(false);

  // 금액 인풋 (만원 단위 문자열)
  const [acquisitionPrice, setAcquisitionPrice] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');

  // 날짜 인풋 (YYYYMMDD 포맷)
  const [acquisitionDate, setAcquisitionDate] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>('');

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

  const formatDatePicker = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 8);
    return clean;
  };

  // 날짜 기반 실 보유년수 연산
  const parseDateString = (dateStr: string): Date | null => {
    if (dateStr.length !== 8) return null;
    const y = parseInt(dateStr.slice(0, 4), 10);
    const m = parseInt(dateStr.slice(4, 6), 10) - 1;
    const d = parseInt(dateStr.slice(6, 8), 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
  };

  const calculateHoldingPeriod = (date1Str: string, date2Str: string) => {
    const d1 = parseDateString(date1Str);
    const d2 = parseDateString(date2Str);
    if (!d1 || !d2) return 0;

    const diffTime = d2.getTime() - d1.getTime();
    if (diffTime <= 0) return 0;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays / 365.25;
  };

  // --- 2026 부동산 양도소득세 과세표준 브라켓 계산 함수 ---
  const calculateBaseTax = (taxableBase: number): { tax: number; rate: number; progressive: number } => {
    if (taxableBase <= 0) return { tax: 0, rate: 0, progressive: 0 };

    if (taxableBase <= 1400) {
      return { tax: taxableBase * 0.06, rate: 6, progressive: 0 };
    } else if (taxableBase <= 5000) {
      return { tax: taxableBase * 0.15 - 126, rate: 15, progressive: 126 };
    } else if (taxableBase <= 8800) {
      return { tax: taxableBase * 0.24 - 576, rate: 24, progressive: 576 };
    } else if (taxableBase <= 15000) {
      return { tax: taxableBase * 0.35 - 1544, rate: 35, progressive: 1544 };
    } else if (taxableBase <= 30000) {
      return { tax: taxableBase * 0.38 - 1994, rate: 38, progressive: 1994 };
    } else if (taxableBase <= 50000) {
      return { tax: taxableBase * 0.40 - 2594, rate: 40, progressive: 2594 };
    } else if (taxableBase <= 100000) {
      return { tax: taxableBase * 0.42 - 3594, rate: 42, progressive: 3594 };
    } else {
      return { tax: taxableBase * 0.45 - 6594, rate: 45, progressive: 6594 };
    }
  };

  // --- 메인 양도소득세 연산 엔진 ---
  const taxCalculation = useMemo(() => {
    const acqP = parseRawNumber(acquisitionPrice);
    const sellP = parseRawNumber(sellingPrice);
    const exp = parseRawNumber(expenses);

    // 1. 전체 양도차익 계산
    const totalCapitalGain = sellP - acqP - exp;

    if (totalCapitalGain <= 0) {
      return {
        status: 'loss',
        totalCapitalGain: Math.max(totalCapitalGain, 0),
        taxableCapitalGain: 0,
        holdingYears: 0,
        deductionRate: 0,
        deductionAmount: 0,
        taxableBase: 0,
        taxRate: 0,
        progressive: 0,
        calculatedTax: 0,
        localTax: 0,
        totalTaxToPay: 0,
        jointSavings: 0,
        isExempt: false,
        message: '양도차익이 발생하지 않아 양도소득세가 면제됩니다.'
      };
    }

    const holdingYears = calculateHoldingPeriod(acquisitionDate, transferDate);

    // 2. 1세대 1주택 비과세 여부 판별
    let isExempt = false;
    let taxableCapitalGain = totalCapitalGain;

    if (propertyType === 'house' && ownership === '1home' && holdingYears >= 2) {
      const specExempt = !isSpeculative || livedTwoYears;
      if (specExempt) {
        if (sellP <= 120000) {
          isExempt = true;
          taxableCapitalGain = 0;
        } else {
          taxableCapitalGain = totalCapitalGain * ((sellP - 120000) / sellP);
        }
      }
    }

    // 3. 장기보유특별공제(장특공제) 계산
    let deductionRate = 0;
    
    if (holdingYears >= 3) {
      if (propertyType === 'house' && ownership === '1home' && livedTwoYears) {
        const holdRate = Math.min(Math.floor(holdingYears), 10) * 4;
        const liveRate = Math.min(Math.floor(holdingYears), 10) * 4;
        deductionRate = holdRate + liveRate;
      } else {
        deductionRate = Math.min(Math.floor(holdingYears), 15) * 2;
      }
    }

    const deductionAmount = taxableCapitalGain * (deductionRate / 100);
    const incomeAfterHoldingDeduction = taxableCapitalGain - deductionAmount;

    // 4. 과세표준 및 세금 산출
    let calculatedTax = 0;
    let singleTaxRate = 0;
    let singleProgressive = 0;
    let taxableBase = 0;

    const singleBase = Math.max(incomeAfterHoldingDeduction - (basicDeduction ? 250 : 0), 0);
    const singleResult = calculateBaseTax(singleBase);

    if (jointOwnership) {
      const splitIncome = incomeAfterHoldingDeduction / 2;
      const splitBase = Math.max(splitIncome - (basicDeduction ? 250 : 0), 0);
      const splitResult = calculateBaseTax(splitBase);

      calculatedTax = splitResult.tax * 2;
      singleTaxRate = splitResult.rate;
      singleProgressive = splitResult.progressive;
      taxableBase = splitBase * 2;
    } else {
      taxableBase = singleBase;
      calculatedTax = singleResult.tax;
      singleTaxRate = singleResult.rate;
      singleProgressive = singleResult.progressive;
    }

    const localTax = calculatedTax * 0.1;
    const totalTaxToPay = calculatedTax + localTax;

    const singleTotalTax = singleResult.tax * 1.1;
    const jointSavings = Math.max(singleTotalTax - totalTaxToPay, 0);

    return {
      status: isExempt ? 'exempt' : 'taxable',
      totalCapitalGain,
      taxableCapitalGain,
      holdingYears,
      deductionRate,
      deductionAmount,
      taxableBase,
      taxRate: singleTaxRate,
      progressive: singleProgressive,
      calculatedTax,
      localTax,
      totalTaxToPay,
      jointSavings,
      isExempt
    };
  }, [
    propertyType,
    ownership,
    basicDeduction,
    jointOwnership,
    isSpeculative,
    livedTwoYears,
    acquisitionPrice,
    sellingPrice,
    expenses,
    acquisitionDate,
    transferDate
  ]);

  const hasCalculated = parseRawNumber(sellingPrice) > 0 && parseRawNumber(acquisitionPrice) > 0;

  return (
    <div className="not-prose w-full select-none transition-all duration-300">
      
      {/* 양도소득세 메인 카드 컨테이너 */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
        
        {/* 헤더 */}
        <div className="px-6 py-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
            🏠 부동산 양도소득세 계산기
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            부동산 양도 시 발생하는 양도차익, 비과세 적용 요건 및 장기보유특별공제 자동 차감 시뮬레이터
          </p>
        </div>

        {/* 메인 폼 바디 */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* 1. 부동산 종류 선택 탭 */}
          <div>
            <span className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              부동산 종류 선택
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: 'house', label: '주택 🏠' },
                { type: 'coupon', label: '분양권 🎫' },
                { type: 'right', label: '입주권 🔑' },
                { type: 'land', label: '비사업토지 🏞️' },
                { type: 'other', label: '기타 📂' }
              ].map(opt => (
                <button
                  key={opt.type}
                  onClick={() => setPropertyType(opt.type as PropertyType)}
                  className={`py-3.5 px-3 text-center font-bold text-sm rounded-xl border transition-all active:scale-95 ${
                    propertyType === opt.type
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-855 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 주택 보유 수 선택 (주택일 경우 활성화) */}
          {propertyType === 'house' && (
            <div>
              <span className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                세대 기준 주택 보유 수
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: '1home', label: '1세대 1주택자' },
                  { value: '2home', label: '다주택자 (2주택)' },
                  { value: 'more', label: '다주택자 (3주택 이상)' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setOwnership(opt.value as OwnershipType)}
                    className={`py-3.5 px-3 text-center font-black text-sm rounded-xl border transition-all active:scale-95 ${
                      ownership === opt.value
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-855 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. 체크박스 옵션 리스트 */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4">
            <span className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
              세액 공제 및 가산 세법 필터
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {/* 기본공제 */}
              <label className="flex items-center gap-3 cursor-pointer text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={basicDeduction}
                  onChange={(e) => setBasicDeduction(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850"
                />
                <span>양도소득기본공제 (연 250만 원)</span>
              </label>

              {/* 공동명의 */}
              <label className="flex items-center gap-3 cursor-pointer text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={jointOwnership}
                  onChange={(e) => setJointOwnership(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-855"
                />
                <span className="text-blue-600 dark:text-blue-400">부부 공동명의 (50% 지분 분할)</span>
              </label>

              {/* 조정대상지역 */}
              {propertyType === 'house' && (
                <label className="flex items-center gap-3 cursor-pointer text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isSpeculative}
                    onChange={(e) => setIsSpeculative(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-855"
                  />
                  <span>조정대상지역 (규제 지정 지역)</span>
                </label>
              )}

              {/* 2년 이상 거주 */}
              {propertyType === 'house' && (
                <label className="flex items-center gap-3 cursor-pointer text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={livedTwoYears}
                    onChange={(e) => setLivedTwoYears(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-855"
                  />
                  <span>세대원 전원 2년 실거주 충족</span>
                </label>
              )}
            </div>
          </div>

          {/* 4. 금액 및 일자 입력창 영역 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* 취득가액 */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-300">
                취득가액 (매입 가격)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={acquisitionPrice}
                  onChange={(e) => handleNumericChange(e.target.value, setAcquisitionPrice)}
                  placeholder="예: 60,000"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">만원</span>
              </div>
            </div>

            {/* 양도가액 */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-300">
                양도가액 (매도 가격)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sellingPrice}
                  onChange={(e) => handleNumericChange(e.target.value, setSellingPrice)}
                  placeholder="예: 110,000"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">만원</span>
              </div>
            </div>

            {/* 필요경비 */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-300">
                필요경비 (중개수수료, 리모델링 등)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={expenses}
                  onChange={(e) => handleNumericChange(e.target.value, setExpenses)}
                  placeholder="예: 3,000"
                  className="w-full py-3.5 pl-5 pr-14 font-black text-base text-slate-850 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">만원</span>
              </div>
            </div>

            {/* 취득일자 */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-300">
                취득일자 (매입 계약완료 날짜)
              </label>
              <input
                type="text"
                maxLength={8}
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(formatDatePicker(e.target.value))}
                placeholder="예: 20200101 (8자리)"
                className="w-full py-3.5 px-5 font-black text-base text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
            </div>

            {/* 양도일자 */}
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-300">
                양도일자 (잔금 완납 또는 등기 날짜)
              </label>
              <input
                type="text"
                maxLength={8}
                value={transferDate}
                onChange={(e) => setTransferDate(formatDatePicker(e.target.value))}
                placeholder="예: 20260101 (8자리)"
                className="w-full py-3.5 px-5 font-black text-base text-slate-805 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* 5. 세액 연산 결과 대시보드 */}
          {hasCalculated && (
            <div className="border-t border-slate-200 dark:border-slate-850 pt-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* [왼쪽] 세부 중간계산 내역 영수증 */}
                <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-slate-505 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2.5 flex justify-between items-center">
                    <span>📋 양도소득세 정산 세부 명세서</span>
                    <span className="text-xs font-bold text-slate-405">단위: 만원</span>
                  </h3>

                  <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>1. 총 양도차익:</span>
                    <span className="font-extrabold text-slate-850 dark:text-slate-100">{Math.round(taxCalculation.totalCapitalGain).toLocaleString()} 만원</span>
                  </div>

                  {taxCalculation.isExempt && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                      <span>• 1세대 1주택 비과세 혜택 적용:</span>
                      <span className="font-extrabold">12억 이하 주택 전액 비과세</span>
                    </div>
                  )}

                  {!taxCalculation.isExempt && taxCalculation.totalCapitalGain > taxCalculation.taxableCapitalGain && (
                    <div className="flex justify-between text-sm text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <span>• 12억 초과 고가주택 안분 과세표준 적용:</span>
                      <span className="font-extrabold">{Math.round(taxCalculation.taxableCapitalGain).toLocaleString()} 만원</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-855 pb-2.5">
                    <span>2. 장기보유특별공제 ({taxCalculation.deductionRate}%):</span>
                    <span className="font-extrabold text-red-500">-{Math.round(taxCalculation.deductionAmount).toLocaleString()} 만원</span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-855 pb-2.5">
                    <span>3. 양도소득 기본공제 {jointOwnership && ' (공동인당 개별적용)'}:</span>
                    <span className="font-extrabold text-red-500">
                      -{jointOwnership ? '500' : '250'} 만원
                    </span>
                  </div>

                  <div className="flex justify-between text-base text-slate-850 dark:text-slate-200 border-b border-slate-150 dark:border-slate-800 pb-2.5 font-black">
                    <span>4. 최종 과세표준 {jointOwnership && ' (1인 지분 분할 기준)'}:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {Math.round(taxCalculation.taxableBase / (jointOwnership ? 2 : 1)).toLocaleString()} 만원
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>5. 산정 적용 세율 (종합소득세 매핑):</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {taxCalculation.taxRate}% (-{taxCalculation.progressive.toLocaleString()} 만원 누진공제)
                    </span>
                  </div>
                </div>

                {/* [오른쪽] 최종 납부액 전광판 카드 */}
                <div className="lg:col-span-5 bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-6 flex-grow">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-xs font-black text-blue-400 uppercase tracking-widest">최종 납부 세액 합계</span>
                      <span className="bg-white/10 text-white/80 text-[10px] font-black px-2.5 py-0.5 rounded">지방세 포함</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-slate-400 block mb-1.5 font-bold">최종 총 납부할 세액</span>
                        <span className="text-3xl md:text-4xl font-black text-yellow-350 tracking-tight block">
                          {Math.round(taxCalculation.totalTaxToPay).toLocaleString()} 만원
                        </span>
                        <span className="text-xs text-slate-450 block mt-1.5 leading-normal font-semibold">
                          (지방소득세 10%가 합산 반영된 최종 결정 세액)
                        </span>
                      </div>

                      <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                        <div className="flex justify-between text-slate-400">
                          <span>양도소득세액:</span>
                          <span className="font-bold text-slate-200">{Math.round(taxCalculation.calculatedTax).toLocaleString()} 만원</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>지방소득세액 (10%):</span>
                          <span className="font-bold text-slate-200">{Math.round(taxCalculation.localTax).toLocaleString()} 만원</span>
                        </div>
                      </div>

                      {/* 공동명의 절세액 체감 배너 */}
                      {jointOwnership && taxCalculation.jointSavings > 0 && (
                        <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/30 text-sm text-emerald-100 leading-normal flex items-start gap-2">
                          <span className="text-base">💡</span>
                          <p className="m-0 font-medium">
                            단독 명의로 신청했을 때보다 부부 공동명의 50% 분할 정산을 통해 약 <strong className="font-extrabold text-emerald-305">{Math.round(taxCalculation.jointSavings).toLocaleString()} 만원</strong>의 양도세를 대폭 절감하셨습니다!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* 2026 양도소득세 과세기준표 참고사항 카드 */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md mb-8">
        <h3 className="text-base font-black text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>📚 참고사항: 2026년 기준 대한민국 양도소득세 과세표준세율표</span>
        </h3>
        
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-150 dark:border-slate-800 scrollbar-thin">
          <table className="w-full min-w-[500px] border-collapse text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-405 font-black border-b border-slate-150 dark:border-slate-800">
                <th className="py-3.5 px-4">과세표준 구간 (인당 분할소득 기준)</th>
                <th className="py-3.5 px-4 text-center">기본 세율 (%)</th>
                <th className="py-3.5 px-4 text-right pr-6">누진공제액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350 font-semibold">
              {[
                { range: '1,400만 원 이하', rate: '6%', progressive: '없음' },
                { range: '1,400만 원 초과 ~ 5,000만 원 이하', rate: '15%', progressive: '126만 원' },
                { range: '5,000만 원 초과 ~ 8,800만 원 이하', rate: '24%', progressive: '576만 원' },
                { range: '8,800만 원 초과 ~ 1억 5,000만 원 이하', rate: '35%', progressive: '1,544만 원' },
                { range: '1억 5,000만 원 초과 ~ 3억 원 이하', rate: '38%', progressive: '1,994만 원' },
                { range: '3억 원 초과 ~ 5억 원 이하', rate: '40%', progressive: '2,594만 원' },
                { range: '5억 원 초과 ~ 10억 원 이하', rate: '42%', progressive: '3,594만 원' },
                { range: '10억 원 초과', rate: '45%', progressive: '6,594만 원' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-bold">{row.range}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-450">{row.rate}</td>
                  <td className="py-3 px-4 text-right pr-6 font-bold">{row.progressive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed font-semibold">
          * 2026년도 소득세법의 세율 기준표를 따르며, 산출된 양도소득세에 추가로 10%의 지방소득세가 합산 부과됩니다. 거래 연도 및 실제 양도 대상 종류에 따라 적용세율이 상이할 수 있으므로, 최종 거래 시에는 전문 세무사와의 추가 상담을 권장해 드립니다.
        </p>
      </div>

    </div>
  );
}
