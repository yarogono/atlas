'use client';

import React, { useState, useMemo, useEffect } from 'react';

interface HistoryItem {
  cycle: number;
  label: string;
  interest: number;
  cumulativeDeposit: string;
  assetBeforeTax: number;
  assetAfterTax: number;
  netProfit: number;
}

export default function CompoundInterestCalc() {
  // --- States ---
  const [initialPrincipal, setInitialPrincipal] = useState<string>('10,000,000');
  const [additionalDeposit, setAdditionalDeposit] = useState<string>('0');
  const [period, setPeriod] = useState<string>('20');
  const [periodUnit, setPeriodUnit] = useState<'일' | '월' | '년'>('일');
  const [rate, setRate] = useState<string>('1.0');
  const [taxRateType, setTaxRateType] = useState<'none' | 'normal' | 'preferential'>('none');
  
  // 차트 호버 상태
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // --- Helper: Format & Parse Numbers ---
  const formatNumber = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return clean; 
    
    let integerPart = parts[0];
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = integerPart.replace(/^0+/, '0');
    }
    
    const formattedInteger = integerPart ? parseInt(integerPart, 10).toLocaleString('ko-KR') : '';
    if (parts.length === 2) {
      return `${formattedInteger}.${parts[1]}`;
    }
    return formattedInteger;
  };

  const parseRawNumber = (val: string): number => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const handleNumericChange = (value: string, setter: (v: string) => void) => {
    setter(formatNumber(value));
  };

  // 세금 파싱
  const getTaxRate = () => {
    if (taxRateType === 'normal') return 0.154; // 15.4%
    if (taxRateType === 'preferential') return 0.095; // 9.5%
    return 0.0; // 비과세
  };

  // --- 복리 계산 로직 ---
  const calculationResults = useMemo(() => {
    const initP = parseRawNumber(initialPrincipal);
    const addD = parseRawNumber(additionalDeposit);
    const pVal = Math.min(Math.max(parseInt(period, 10) || 0, 1), 365); // 최대 365회차 제한
    const rVal = parseFloat(rate) || 0;
    const taxRate = getTaxRate();

    const history: HistoryItem[] = [];
    
    // 시작 시점 (0회차)
    history.push({
      cycle: 0,
      label: '시작',
      interest: 0,
      cumulativeDeposit: initP.toLocaleString(),
      assetBeforeTax: initP,
      assetAfterTax: initP,
      netProfit: 0
    });

    let currentAsset = initP;
    let totalDeposit = initP;

    for (let i = 1; i <= pVal; i++) {
      // 1. 기존 자산에 대한 이자 발생
      const interestThisCycle = currentAsset * (rVal / 100);
      
      // 2. 이자 발생 후 자산
      const assetAfterInterest = currentAsset + interestThisCycle;
      
      // 3. 매 회차 추가 납입액 더하기
      const newAsset = assetAfterInterest + addD;
      totalDeposit += addD;
      currentAsset = newAsset;

      // 4. 세금 및 순수익 계산
      const totalInterestSoFar = currentAsset - totalDeposit;
      const taxSoFar = Math.max(totalInterestSoFar * taxRate, 0);
      const netProfitSoFar = totalInterestSoFar - taxSoFar;
      const assetAfterTaxSoFar = totalDeposit + netProfitSoFar;

      history.push({
        cycle: i,
        label: `${i}${periodUnit}`,
        interest: interestThisCycle,
        cumulativeDeposit: totalDeposit.toLocaleString(),
        assetBeforeTax: currentAsset,
        assetAfterTax: assetAfterTaxSoFar,
        netProfit: netProfitSoFar
      });
    }

    const finalItem = history[history.length - 1];
    const finalAsset = finalItem ? finalItem.assetAfterTax : initP;
    const finalPrincipal = totalDeposit;
    const finalNetProfit = finalItem ? finalItem.netProfit : 0;
    const finalYield = finalPrincipal > 0 ? (finalNetProfit / finalPrincipal) * 100 : 0;

    return {
      history,
      finalAsset,
      finalPrincipal,
      finalNetProfit,
      finalYield,
      pVal
    };
  }, [initialPrincipal, additionalDeposit, period, periodUnit, rate, taxRateType]);

  // 마우스 아웃 시 차트 호버 초기화
  useEffect(() => {
    setHoveredIndex(null);
  }, [calculationResults]);

  // --- SVG 차트 그리기 데이터 연산 ---
  const chartSvgData = useMemo(() => {
    const { history, pVal } = calculationResults;
    
    // 차트 규격
    const svgWidth = 550;
    const svgHeight = 240;
    const paddingLeft = 70;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;

    const chartW = svgWidth - paddingLeft - paddingRight;
    const chartH = svgHeight - paddingTop - paddingBottom;

    // 최대값 찾기 (복리 자산 중 최댓값)
    const maxVal = Math.max(...history.map(h => h.assetBeforeTax)) || 1;
    // 최소값 찾기 (원금 혹은 복리 자산 중 최솟값)
    const minVal = Math.min(...history.map(h => parseRawNumber(h.cumulativeDeposit))) || 0;
    
    const yDiff = maxVal - minVal > 0 ? maxVal - minVal : 1;

    const getCoords = (idx: number, val: number) => {
      const x = paddingLeft + (idx / pVal) * chartW;
      const y = svgHeight - paddingBottom - ((val - minVal) / yDiff) * chartH;
      return { x, y };
    };

    let assetPath = '';
    let assetAreaPath = '';
    let principalPath = '';

    history.forEach((item, idx) => {
      const coordsAsset = getCoords(idx, item.assetAfterTax);
      const coordsPrincipal = getCoords(idx, parseRawNumber(item.cumulativeDeposit));

      if (idx === 0) {
        assetPath = `M ${coordsAsset.x} ${coordsAsset.y}`;
        assetAreaPath = `M ${coordsAsset.x} ${svgHeight - paddingBottom} L ${coordsAsset.x} ${coordsAsset.y}`;
        principalPath = `M ${coordsPrincipal.x} ${coordsPrincipal.y}`;
      } else {
        assetPath += ` L ${coordsAsset.x} ${coordsAsset.y}`;
        assetAreaPath += ` L ${coordsAsset.x} ${coordsAsset.y}`;
        principalPath += ` L ${coordsPrincipal.x} ${coordsPrincipal.y}`;
      }

      if (idx === history.length - 1) {
        assetAreaPath += ` L ${coordsAsset.x} ${svgHeight - paddingBottom} Z`;
      }
    });

    const yTicks = Array.from({ length: 4 }).map((_, i) => {
      const val = minVal + (yDiff * i) / 3;
      const y = svgHeight - paddingBottom - (i / 3) * chartH;
      return { val, y };
    });

    const xTicksCount = Math.min(pVal + 1, 6);
    const xTicks = Array.from({ length: xTicksCount }).map((_, i) => {
      const idx = Math.round((pVal * i) / (xTicksCount - 1));
      const item = history[idx];
      const x = paddingLeft + (idx / pVal) * chartW;
      return { label: item ? item.label : '', x, idx };
    });

    return {
      svgWidth,
      svgHeight,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartW,
      chartH,
      assetPath,
      assetAreaPath,
      principalPath,
      yTicks,
      xTicks,
      getCoords
    };
  }, [calculationResults]);

  const currentHoverItem = hoveredIndex !== null ? calculationResults.history[hoveredIndex] : null;
  const hoverCoords = currentHoverItem !== null ? chartSvgData.getCoords(hoveredIndex!, currentHoverItem.assetAfterTax) : null;

  return (
    <div className="not-prose w-full select-none transition-all duration-300">
      
      {/* 계산기 박스 컨테이너 */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
        
        {/* 헤더 */}
        <div className="px-6 py-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
            🧮 간편 복리계산기
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            주식, 코인, 적립식 투자의 회차별 복리 시뮬레이터 및 세후 이자 시각화 차트
          </p>
        </div>

        {/* 메인 폼 & 리포트 영역 */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900">
          
          {/* [좌측] 투자 설정 폼 (5열 차지) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-250 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-4 bg-blue-500 rounded-full"></span>
              투자 설정
            </h2>

            {/* 초기 투자 원금 */}
            <div className="space-y-2">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                초기 투자 원금 (원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={initialPrincipal}
                  onChange={(e) => handleNumericChange(e.target.value, setInitialPrincipal)}
                  placeholder="원금 입력"
                  className="w-full py-3.5 pl-4 pr-10 font-bold text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">원</span>
              </div>
            </div>

            {/* 매 회차 추가 납입액 */}
            <div className="space-y-2">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                매 회차 추가 납입 (적립식 복리 적용)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={additionalDeposit}
                  onChange={(e) => handleNumericChange(e.target.value, setAdditionalDeposit)}
                  placeholder="납입금 입력"
                  className="w-full py-3.5 pl-4 pr-10 font-bold text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">원</span>
              </div>
            </div>

            {/* 계산 기간 & 기간 단위 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                  계산 기간
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="예: 20"
                  className="w-full py-3.5 px-4 font-bold text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                  기간 단위
                </label>
                <select
                  value={periodUnit}
                  onChange={(e) => setPeriodUnit(e.target.value as '일' | '월' | '년')}
                  className="w-full py-3.5 px-3 font-bold text-base text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm"
                >
                  <option value="일">일 (Daily)</option>
                  <option value="월">월 (Monthly)</option>
                  <option value="년">년 (Yearly)</option>
                </select>
              </div>
            </div>

            {/* 목표 수익률 */}
            <div className="space-y-2">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                목표 수익률 (1회차 당)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="수익률 입력"
                  className="w-full py-3.5 pl-4 pr-10 font-bold text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
              </div>
            </div>

            {/* 세금 적용 */}
            <div className="space-y-2">
              <label className="block text-base font-extrabold text-slate-700 dark:text-slate-300">
                세금 적용 필터
              </label>
              <select
                value={taxRateType}
                onChange={(e) => setTaxRateType(e.target.value as 'none' | 'normal' | 'preferential')}
                className="w-full py-3.5 px-3 font-bold text-base text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm"
              >
                <option value="none">비과세 (0%)</option>
                <option value="normal">일반 과세 (15.4%)</option>
                <option value="preferential">세금 우대 (9.5%)</option>
              </select>
            </div>
          </div>

          {/* [우측] 리포트 대시보드 및 SVG 차트 (7열 차지) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* 3대 핵심 리포트 대시보드 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 최종 자산 */}
              <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 p-5 rounded-2xl shadow-sm text-center">
                <span className="text-sm font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest block mb-1">최종 자산 (세후)</span>
                <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {Math.round(calculationResults.finalAsset).toLocaleString()}원
                </span>
              </div>

              {/* 총 투자 원금 */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-1">총 투자 원금</span>
                <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {calculationResults.finalPrincipal.toLocaleString()}원
                </span>
              </div>

              {/* 누적 순수익 */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 p-5 rounded-2xl shadow-sm text-center">
                <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest block mb-1">누적 순수익 (세후)</span>
                <span className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                  {Math.round(calculationResults.finalNetProfit).toLocaleString()}원
                </span>
                <span className="text-xs md:text-sm font-bold text-emerald-500/85 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full inline-block mt-1">
                  수익률 {calculationResults.finalYield.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* 차트 캔버스 프레임 */}
            <div className="border border-slate-150 dark:border-slate-800 rounded-3xl p-4 bg-slate-50/30 dark:bg-slate-950/10 relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-slate-400 uppercase tracking-wider">복리 시각화 그래프</span>
                <div className="flex gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-1 bg-emerald-500 rounded-full"></span>
                    <span>총자산 (복리 효과)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-0.5 border-t border-dashed border-blue-500"></span>
                    <span>누적 투자원금</span>
                  </div>
                </div>
              </div>

              {/* SVG 차트 본체 */}
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartSvgData.svgWidth} ${chartSvgData.svgHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* 수평 격자 눈금선 */}
                  {chartSvgData.yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={chartSvgData.paddingLeft}
                        y1={tick.y}
                        x2={chartSvgData.svgWidth - chartSvgData.paddingRight}
                        y2={tick.y}
                        stroke="#e2e8f0"
                        className="dark:stroke-slate-800"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={chartSvgData.paddingLeft - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#94a3b8"
                      >
                        {Math.round(tick.val).toLocaleString()}
                      </text>
                    </g>
                  ))}

                  {/* 누적 투자 원금 점선 (파란색) */}
                  <path
                    d={chartSvgData.principalPath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* 복리 자산 셰이딩 영역 (녹색 영역) */}
                  <path
                    d={chartSvgData.assetAreaPath}
                    fill="url(#areaGradient)"
                  />

                  {/* 복리 자산 메인 그래프선 (녹색 실선) */}
                  <path
                    d={chartSvgData.assetPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* X축 기저선 */}
                  <line
                    x1={chartSvgData.paddingLeft}
                    y1={chartSvgData.svgHeight - chartSvgData.paddingBottom}
                    x2={chartSvgData.svgWidth - chartSvgData.paddingRight}
                    y2={chartSvgData.svgHeight - chartSvgData.paddingBottom}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                    strokeWidth="1"
                  />

                  {/* X축 눈금 라벨 */}
                  {chartSvgData.xTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={tick.x}
                        y1={chartSvgData.svgHeight - chartSvgData.paddingBottom}
                        x2={tick.x}
                        y2={chartSvgData.svgHeight - chartSvgData.paddingBottom + 4}
                        stroke="#cbd5e1"
                        className="dark:stroke-slate-700"
                        strokeWidth="1"
                      />
                      <text
                        x={tick.x}
                        y={chartSvgData.svgHeight - chartSvgData.paddingBottom + 16}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#94a3b8"
                      >
                        {tick.idx === 0 ? '시작' : tick.label}
                      </text>
                    </g>
                  ))}

                  {/* 인터랙티브 마우스 호버 구역 분할 슬라이스 */}
                  {calculationResults.history.map((_, idx) => {
                    const cellW = chartSvgData.chartW / calculationResults.pVal;
                    const xStart = chartSvgData.paddingLeft + (idx - 0.5) * cellW;
                    return (
                      <rect
                        key={idx}
                        x={xStart}
                        y={chartSvgData.paddingTop}
                        width={cellW}
                        height={chartSvgData.chartH}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                      />
                    );
                  })}

                  {/* 호버 노드 표시선 & 서클 이펙트 */}
                  {hoverCoords && currentHoverItem && (
                    <g>
                      <line
                        x1={hoverCoords.x}
                        y1={chartSvgData.paddingTop}
                        x2={hoverCoords.x}
                        y2={chartSvgData.svgHeight - chartSvgData.paddingBottom}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={hoverCoords.x}
                        cy={chartSvgData.getCoords(hoveredIndex!, parseRawNumber(currentHoverItem.cumulativeDeposit)).y}
                        r="4"
                        fill="#3b82f6"
                      />
                      <circle
                        cx={hoverCoords.x}
                        cy={hoverCoords.y}
                        r="6.5"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="shadow-sm"
                      />
                    </g>
                  )}
                </svg>

                {/* 절대 좌표 호버 툴팁 Popover */}
                {hoverCoords && currentHoverItem && (
                  <div
                    className="absolute bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-800 shadow-2xl text-xs font-sans leading-normal pointer-events-none transition-all duration-75"
                    style={{
                      left: `${(hoverCoords.x / chartSvgData.svgWidth) * 100}%`,
                      top: `${Math.max((hoverCoords.y / chartSvgData.svgHeight) * 100 - 35, 0)}%`,
                      transform: 'translate(-50%, -100%)',
                      zIndex: 30,
                    }}
                  >
                    <div className="font-bold text-center border-b border-white/10 pb-1 mb-1.5 text-emerald-400">
                      {hoveredIndex === 0 ? '시작 시점' : `${hoveredIndex}회차 (${periodUnit})`}
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>복리 자산:</span>
                      <span className="font-bold">{Math.round(currentHoverItem.assetAfterTax).toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>누적 원금:</span>
                      <span className="font-bold">{currentHoverItem.cumulativeDeposit}원</span>
                    </div>
                    <div className="flex justify-between gap-4 text-emerald-300 font-bold border-t border-white/5 pt-1.5 mt-1.5">
                      <span>순수익금:</span>
                      <span>{Math.round(currentHoverItem.netProfit).toLocaleString()}원</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 회차별 상세 시뮬레이션 내역 리포트 테이블 */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 mb-12">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>📋 회차별 상세 리포트 내역</span>
          <span className="text-xs md:text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-100 dark:border-slate-800 font-bold">
            총 {calculationResults.pVal}개 회차
          </span>
        </h2>

        <div className="max-h-[350px] overflow-y-auto overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-2xl scrollbar-thin">
          <table className="w-full min-w-[700px] border-collapse text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-550 dark:text-slate-400 font-black border-b border-slate-150 dark:border-slate-800 text-sm">
                <th className="py-4 px-4 text-left w-24">회차</th>
                <th className="py-4 px-4 text-right">회차별 이자</th>
                <th className="py-4 px-4 text-right">누적 원금</th>
                <th className="py-4 px-4 text-right">최종 자산 (세전)</th>
                <th className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400">최종 자산 (세후)</th>
                <th className="py-4 px-4 text-right text-indigo-500">누적 순수익</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350 text-sm md:text-base">
              {calculationResults.history.map((item) => (
                <tr
                  key={item.cycle}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                    item.cycle === 0 ? 'bg-slate-50/30 dark:bg-slate-950/10 font-bold text-slate-500' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-black">{item.cycle === 0 ? '시작' : `${item.cycle}회`}</td>
                  <td className="py-3.5 px-4 text-right">
                    {item.cycle === 0 ? '-' : `${Math.round(item.interest).toLocaleString()}원`}
                  </td>
                  <td className="py-3.5 px-4 text-right">{item.cumulativeDeposit}원</td>
                  <td className="py-3.5 px-4 text-right">{Math.round(item.assetBeforeTax).toLocaleString()}원</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(item.assetAfterTax).toLocaleString()}원
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-indigo-500">
                    {item.cycle === 0 ? '-' : `${Math.round(item.netProfit).toLocaleString()}원`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 복리 정보 가이드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-slate-800 dark:text-slate-200">
        
        {/* 복리란 무엇인가? */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="text-2xl">📈</span>
            <h2 className="text-lg font-black m-0 tracking-tight text-slate-800 dark:text-slate-200">복리의 개념</h2>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            복리(Compound Interest)란 원금에 대해서만 이자가 계산되는 단리(Simple Interest)와 달리, <strong className="font-extrabold text-blue-600 dark:text-blue-400">'이자에 또 이자가 붙는'</strong> 획기적인 이자 계산 방식입니다.
          </p>
          <p className="text-base text-slate-600 dark:text-slate-350 leading-relaxed">
            시간이 지날수록 발생한 이자가 다시 원금으로 합산되어 새로운 이자를 창출하기 때문에, 투자 기간이 늘어날수록 자산 증가 속도가 비약적인 기하급수적 곡선을 그리기 시작합니다. 세계적인 물리학자 알베르트 아인슈타인은 이를 두고 <strong className="font-extrabold text-blue-650 dark:text-blue-405">"복리는 인류 최대의 수학적 발견이자 세계 제8대 불가사의"</strong>라고 칭송한 바 있습니다.
          </p>
        </div>

        {/* 복리의 연산 법칙 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-lg font-black m-0 tracking-tight text-slate-800 dark:text-slate-200">마법의 복리 72 법칙</h2>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            투자의 세계에서 내가 투입한 자산이 정확히 <strong className="font-extrabold text-blue-600 dark:text-blue-400">두 배(100% 수익률)</strong>가 되기까지 걸리는 기간을 구하는 간단하고 획기적인 법칙이 바로 <strong className="font-extrabold text-blue-605 dark:text-blue-400">'72 법칙'</strong>입니다.
          </p>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 font-mono text-base text-slate-650 dark:text-slate-350 text-center mb-4 font-black">
            두 배 도달 기간 = 72 / 연간 수익률 (%)
          </div>
          <p className="text-base text-slate-650 dark:text-slate-350 leading-relaxed">
            예를 들어 매년 꾸준히 <strong className="font-extrabold text-blue-655 dark:text-blue-400">8%</strong>의 연복리 수익을 실현하는 금융 상품이 있다면, 자산이 두 배가 되기까지는 <code className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-sm">72 / 8 = 9</code>년의 세월이 소요됩니다. 
            만약 복리 이율을 높여 연 수익률 <strong className="font-extrabold text-blue-655 dark:text-blue-400">12%</strong>를 보장받는다면, 원금이 두 배가 되는 시간은 단 <strong className="font-extrabold text-blue-655 dark:text-blue-400">6년</strong>으로 단축됩니다.
          </p>
        </div>

        {/* 적립식 복리 및 세금 유의사항 */}
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-250/40 dark:border-emerald-900/20 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2.5 mb-3.5 text-emerald-600 dark:text-emerald-400">
            <span className="text-2xl">💡</span>
            <h2 className="text-lg font-black m-0 tracking-tight text-slate-800 dark:text-slate-200">적립식 복리 전략</h2>
          </div>
          <p className="text-base text-slate-650 dark:text-slate-400 leading-relaxed mb-4">
            목돈을 한 번에 넣어두는 거치식 복리도 훌륭하지만, 일상 속에서 <strong className="font-extrabold">매 주기마다 추가 납입을 곁들이는 적립식 복리 투자</strong>는 가장 보편적이고 안전한 자산 증식 설계입니다.
          </p>
          <p className="text-base text-slate-650 dark:text-slate-350 leading-relaxed">
            주기적인 분할 매수(추가 납입) 효과를 통해 자산 가격 변동의 리스크를 평균화하는 <strong className="font-extrabold">달러 비용 평균법(Dollar Cost Averaging)</strong>을 극대화할 수 있으며, 이자에 이자가 불어나는 속도에 적립 원금의 가중치가 더해져 훨씬 강력한 마법이 실현됩니다.<br/><br/>
            또한 세금 적용 옵션(15.4%의 일반 과세 등)에 유의하시어 실제 세후 최종 자산을 치밀하게 계산하고 포트폴리오를 구성해 나가시기를 적극 권장합니다.
          </p>
        </div>

      </div>

    </div>
  );
}
