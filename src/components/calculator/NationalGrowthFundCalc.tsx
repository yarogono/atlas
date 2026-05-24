'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';

// TypeScript window type definition for global Chart.js from CDN
declare global {
  interface Window {
    Chart: any;
  }
}

// 8 Tax Brackets defined in the user's prompt
interface TaxBracket {
  label: string;
  rate: number;
  badge: string;
}

const TAX_BRACKETS: TaxBracket[] = [
  { label: '1,400만 원 이하 (세율 6.6%)', rate: 0.066, badge: '6.6%' },
  { label: '1,400만 원 초과 ~ 5,000만 원 이하 (세율 16.5%)', rate: 0.165, badge: '16.5%' },
  { label: '5,000만 원 초과 ~ 8,800만 원 이하 (세율 26.4%)', rate: 0.264, badge: '26.4%' },
  { label: '8,800만 원 초과 ~ 1억 5,000만 원 이하 (세율 38.5%)', rate: 0.385, badge: '38.5%' },
  { label: '1억 5,000만 원 초과 ~ 3억 원 이하 (세율 41.8%)', rate: 0.418, badge: '41.8%' },
  { label: '3억 원 초과 ~ 5억 원 이하 (세율 44.0%)', rate: 0.440, badge: '44.0%' },
  { label: '5억 원 초과 ~ 10억 원 이하 (세율 46.2%)', rate: 0.462, badge: '46.2%' },
  { label: '10억 원 초과 (최고세율 49.5%)', rate: 0.495, badge: '49.5%' },
];

export default function NationalGrowthFundCalc() {
  // --- States ---
  const [selectedBracketIndex, setSelectedBracketIndex] = useState<number>(1); // Default: 16.5% bracket
  const [investmentInput, setInvestmentInput] = useState<string>('1,000'); // Default: 1,000만 원 (10 million KRW)
  const [expectedYield, setExpectedYield] = useState<number>(-50); // Default: -50% (as requested)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

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

  // --- Helpers: Formatting & Parsing ---
  const formatNumber = (val: string) => {
    const clean = val.replace(/[^0-9]/g, ''); // positive integers only
    return clean ? parseInt(clean, 10).toLocaleString('ko-KR') : '';
  };

  const parseRawNumber = (val: string): number => {
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  const handleNumericChange = (value: string) => {
    setInvestmentInput(formatNumber(value));
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseRawNumber(investmentInput);
    setInvestmentInput((current + amount).toLocaleString('ko-KR'));
  };

  // --- Government 20% Junior Loss-Sharing piecewise logic ---
  const getActualReturn = (marketYield: number): number => {
    if (marketYield >= 0) {
      return marketYield; // Gains are preserved 100%
    } else if (marketYield >= -20) {
      return 0; // Losses between -20% and 0% are fully shielded
    } else {
      return marketYield + 20; // Losses beyond -20% are absorbed minus the 20% shield (e.g. -50% -> -30%)
    }
  };

  // --- Real-time Calculation Engine ---
  const calculations = useMemo(() => {
    const investment = parseRawNumber(investmentInput);
    const bracket = TAX_BRACKETS[selectedBracketIndex];

    // A. 소득공제 금액 계산식
    // - 투자금 3,000만 원 이하 분: 투자금 × 40%
    // - 투자금 3,000만 원 초과 ~ 5,000만 원 이하 분: (투자금 - 3000) × 20%
    // - 소득공제 한도는 최대 1,600만 원 (5,000만 원 투자 시 한도 도달)
    let deduction = 0;
    if (investment <= 3000) {
      deduction = investment * 0.40;
    } else if (investment <= 5000) {
      deduction = (3000 * 0.40) + ((investment - 3000) * 0.20);
    } else {
      deduction = 1600; // Capped at 1,600만 원 (reached at 5,000만 원)
    }

    // B. 확정 세금 환급액 및 확정 절세 수익률
    const refund = deduction * bracket.rate; // 환급액 (만 원 단위)
    const refundKRW = Math.round(refund * 10000); // 환급액 (원 단위)
    const confirmedYield = investment > 0 ? (refund / investment) * 100 : 0; // 확정 절세 수익률 Y (%)

    // C. 최고세율 대비 가성비 지수 계산
    // - 최고세율(49.5%) 기준 동일 투자금액의 최대 환급액
    const maxRefund = deduction * 0.495;
    const costEffectivenessScore = maxRefund > 0 ? Math.round((refund / maxRefund) * 100 * 10) / 10 : 0;

    // D. 나의 실제 원금 변동률
    const myActualReturn = getActualReturn(expectedYield);

    // E. 실제 현금 원금 및 평가금 변동
    const actualLossGainKRW = Math.round(investment * (myActualReturn / 100) * 10000);
    const finalAssetKRW = Math.round(investment * 10000 + actualLossGainKRW);

    return {
      investment,
      deduction,
      refund,
      refundKRW,
      confirmedYield,
      costEffectivenessScore,
      myActualReturn,
      actualLossGainKRW,
      finalAssetKRW,
      bracket,
    };
  }, [investmentInput, selectedBracketIndex, expectedYield]);

  // --- Chart.js Real-time Rendering (SSR safe with Cleanup) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = chartCanvasRef.current;
    if (!ctx) return;

    const currentActual = getActualReturn(expectedYield);

    // Format actual KRW helper for tooltip
    const formattedKRW = (pct: number) => {
      const amount = calculations.investment * (pct / 100);
      const absAmount = Math.abs(amount) * 10000;
      const sign = pct > 0 ? '+' : pct < 0 ? '-' : '';
      return `${sign}${Math.round(absAmount).toLocaleString('ko-KR')}원`;
    };

    const renderChart = () => {
      if (!window.Chart) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: '시장(펀드) 자체 수익률 (1:1 선)',
              data: [
                { x: -50, y: -50 },
                { x: 50, y: 50 }
              ],
              borderColor: '#cbd5e1', // slate-300
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
              tension: 0,
            },
            {
              label: '나의 실제 원금 변동률 (국민성장펀드 20% 방어선)',
              data: [
                { x: -50, y: -30 },
                { x: -20, y: 0 },
                { x: 0, y: 0 },
                { x: 50, y: 50 }
              ],
              borderColor: '#3b82f6', // blue-500
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderWidth: 4,
              pointRadius: 0,
              fill: true,
              tension: 0,
            },
            // Vertical cursor crosshair
            {
              label: 'vertical_guide',
              data: [
                { x: expectedYield, y: -50 },
                { x: expectedYield, y: currentActual }
              ],
              borderColor: '#f59e0b', // amber-500
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointRadius: 0,
              showLine: true,
              fill: false,
            },
            // Horizontal cursor crosshair
            {
              label: 'horizontal_guide',
              data: [
                { x: -50, y: currentActual },
                { x: expectedYield, y: currentActual }
              ],
              borderColor: '#f59e0b', // amber-500
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointRadius: 0,
              showLine: true,
              fill: false,
            },
            // Focus Position Dot
            {
              label: '현재 내 설정 지점',
              data: [
                { x: expectedYield, y: currentActual }
              ],
              borderColor: '#ef4444', // red-500
              backgroundColor: '#ffffff',
              borderWidth: 3,
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              min: -50,
              max: 50,
              ticks: {
                callback: (v: any) => `${v}%`,
                stepSize: 10,
                color: '#64748b',
                font: { family: 'Pretendard, system-ui', weight: 'bold' }
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.08)'
              }
            },
            y: {
              type: 'linear',
              min: -50,
              max: 50,
              ticks: {
                callback: (v: any) => `${v}%`,
                stepSize: 10,
                color: '#64748b',
                font: { family: 'Pretendard, system-ui', weight: 'bold' }
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.08)'
              }
            }
          },
          plugins: {
            legend: {
              display: false // We will draw an exquisite custom HTML legend instead
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#e2e8f0',
              padding: 12,
              cornerRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              callbacks: {
                title: (items: any) => {
                  const x = items[0].parsed.x;
                  return `시장(펀드) 예상 수익률: ${x}%`;
                },
                label: (context: any) => {
                  const pct = context.parsed.y;
                  const krw = formattedKRW(pct);
                  if (context.datasetIndex === 0) {
                    return `일반 펀드 수익률: ${pct}% (${krw})`;
                  } else if (context.datasetIndex === 1) {
                    return `국민성장펀드 실제 수익률: ${pct}% (${krw})`;
                  } else if (context.datasetIndex === 4) {
                    return `💡 현재 조작 위치 -> 국민성장펀드 변동률: ${pct}% (${krw})`;
                  }
                  return '';
                }
              }
            }
          }
        }
      });
    };

    renderChart();

    let checkInterval: NodeJS.Timeout;
    if (!window.Chart) {
      checkInterval = setInterval(() => {
        if (window.Chart) {
          renderChart();
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [expectedYield, calculations.investment]);

  return (
    <div className="not-prose w-full font-sans transition-all duration-300">
      
      {/* --- SEO Optimized Header Banner --- */}
      <header className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl mb-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/35 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs md:text-sm font-extrabold text-blue-300 uppercase tracking-widest">
              국민성장펀드 정책금융 세제혜택 시뮬레이터
            </span>
          </div>
          {/* Main H1 - Key SEO Target */}
          <h1 id="calculator-main-title" className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            국민성장펀드 <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">나의 실질 투자 가성비 계산기</span>
          </h1>
          <p className="text-base md:text-lg text-slate-350 max-w-3xl leading-relaxed font-medium">
            가입 즉시 돌려받는 <strong className="text-emerald-300">연말정산 소득공제 환급금(최대 1,600만 원 소득공제)</strong>과 가입과 동시에 얻는 <strong className="text-emerald-300">확정 절세 수익률</strong>, 그리고 시장 반토막에도 원금을 사수하는 <strong className="text-blue-300">정부의 20% 후순위 손실 우선분담 효과</strong>를 실시간 대조해 보세요.
          </p>
        </div>
      </header>

      {/* --- Main Interactive Dashboard --- */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* ================= 좌측: 1단계 입력 조건 설정 (5열) ================= */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg p-6 md:p-8 space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
              1. 국민성장펀드 투자 조건 설정
            </h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
              세제 혜택 역산과 손실방어 검증을 위한 핵심 값을 입력하세요.
            </p>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* 1. 과세표준 구간 선택 */}
          <div className="space-y-3 relative" ref={dropdownRef}>
            <label id="tax-bracket-label" className="block text-base font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
              <span>나의 종합소득 과세표준 구간</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">(종합소득세 + 지방소득세 10% 합산)</span>
            </label>
            
            {/* Custom Dropdown Trigger */}
            <button
              id="tax-bracket-select"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full py-4 px-5 text-left bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all active:scale-[0.99] group shadow-sm"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-labelledby="tax-bracket-label"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">선택된 세율 구간</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-150">
                  {TAX_BRACKETS[selectedBracketIndex].label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full shadow-sm">
                  {TAX_BRACKETS[selectedBracketIndex].badge}
                </span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu Options */}
            {isDropdownOpen && (
              <ul
                role="listbox"
                className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto outline-none py-2 border-collapse scrollbar-thin divide-y divide-slate-100 dark:divide-slate-700/50"
              >
                {TAX_BRACKETS.map((bracket, index) => (
                  <li
                    key={index}
                    role="option"
                    aria-selected={selectedBracketIndex === index}
                    onClick={() => {
                      setSelectedBracketIndex(index);
                      setIsDropdownOpen(false);
                    }}
                    className={`py-3.5 px-5 flex items-center justify-between cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-950/40 select-none ${
                      selectedBracketIndex === index ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <span className={`text-sm md:text-base font-bold ${
                      selectedBracketIndex === index 
                        ? 'text-blue-600 dark:text-blue-400 font-black' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {bracket.label}
                    </span>
                    {selectedBracketIndex === index && (
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 2. 투자 예정 금액 입력 */}
          <div className="space-y-3">
            <label className="block text-base font-extrabold text-slate-700 dark:text-slate-250 flex items-center justify-between">
              <span>국민성장펀드 투자 예정 금액</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">(1만 원 단위 입력)</span>
            </label>
            <div className="relative">
              <input
                id="investment-amount-input"
                type="text"
                value={investmentInput}
                onChange={(e) => handleNumericChange(e.target.value)}
                placeholder="예: 1,000"
                className="w-full py-4.5 pl-6 pr-16 font-black text-xl text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-base font-black">
                만원
              </span>
            </div>

            {/* Quick Action Chips */}
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
                  className="py-2.5 px-1 text-center text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {chip.label}
                </button>
              ))}
              <button
                onClick={() => setInvestmentInput('1,000')}
                className="py-2.5 px-1 text-center text-xs font-black rounded-xl border border-transparent bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/45 transition-all"
              >
                초기화
              </button>
            </div>

            {/* 5,000만 원 초과 팁 & 경고 메시지 */}
            {calculations.investment > 5000 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-2 shadow-inner">
                <span className="text-sm">💡</span>
                <span>
                  투자 예정 금액이 5,000만 원을 초과하면 최대 소득공제 한도(1,600만 원)에 도달하여 추가적인 세액 환급은 늘어나지 않지만, 정부의 20% 후순위 손실 우선분담 혜택은 전액에 대해 그대로 적용됩니다.
                </span>
              </div>
            )}
          </div>

          {/* 3. 예상 펀드 수익률/손실률 슬라이더 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-base font-extrabold text-slate-700 dark:text-slate-250">
                펀드 시장 예상 수익률/손실률
              </label>
              <span className={`px-3 py-1 text-sm font-black rounded-full shadow-sm text-white ${
                expectedYield < 0 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                  : expectedYield > 0 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                {expectedYield > 0 ? `+${expectedYield}%` : `${expectedYield}%`}
              </span>
            </div>

            <div className="space-y-2.5">
              <input
                id="expected-yield-slider"
                type="range"
                min="-50"
                max="50"
                step="1"
                value={expectedYield}
                onChange={(e) => setExpectedYield(parseInt(e.target.value, 10))}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer outline-none bg-gradient-to-r from-red-500 via-blue-500 to-emerald-500"
              />
              <div className="flex justify-between text-xs font-black text-slate-400 dark:text-slate-500 px-1">
                <span>시장 반토막 (-50%)</span>
                <span className="text-blue-500 dark:text-blue-400">손실 20% 방어선</span>
                <span>원금 (0%)</span>
                <span>수익 극대화 (+50%)</span>
              </div>
            </div>

            {/* Slider Guidance box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <span className="text-xl">🛡️</span>
              <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-normal">
                정부가 <strong className="text-blue-500 dark:text-blue-400 font-extrabold">20%의 손실을 우선 감쇄</strong>해 주기 때문에, 슬라이더를 왼쪽으로 밀어 시장이 <strong>-50% 폭락해도 내 실제 자산 가치 하락은 -30%로 감쇄</strong>되며, <strong>-20% ~ 0% 구간에서는 내 원금이 완벽하게 지켜집니다</strong>.
              </p>
            </div>
          </div>

        </section>

        {/* ================= 우측: 2단계 분석 리포트 대시보드 (7열) ================= */}
        <section className="lg:col-span-7 flex flex-col gap-6 justify-between">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
                2. 국민성장펀드 절세 및 손실방어 리포트
              </h2>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                입력된 설정값에 기초하여 혜택 효율과 시뮬레이션을 실시간 계산합니다.
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {calculations.investment > 0 ? (
              <div className="space-y-6">
                
                {/* 3대 정밀 지표 대시보드 카드 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* 총 소득공제액 */}
                  <div className="bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl shadow-sm text-center">
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                      총 소득공제 혜택액
                    </span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight block">
                      {calculations.deduction.toLocaleString()}만 원
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1.5 font-bold">
                      (5,000만 원 한도 적용)
                    </span>
                  </div>

                  {/* 세금 환급금 */}
                  <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 p-5 rounded-2xl shadow-sm text-center">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest block mb-1">
                      💰 예상 세금 환급액 X
                    </span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight block">
                      {calculations.refundKRW.toLocaleString()}원
                    </span>
                    <span className="text-xs text-amber-600/70 dark:text-amber-400/60 block mt-1.5 font-extrabold">
                      (환급액 {calculations.refund.toFixed(1)}만 원)
                    </span>
                  </div>

                  {/* 절세 수익률 */}
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 p-5 rounded-2xl shadow-sm text-center">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest block mb-1">
                      📈 확정 절세 수익률 Y
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                      {calculations.confirmedYield.toFixed(2)}%
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block mt-1.5 font-black animate-pulse">
                      가입 즉시 확정 확보
                    </span>
                  </div>

                </div>

                {/* 1. 확정 절세 수익률 설명 영역 */}
                <div className="p-5 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent dark:from-blue-950/20 dark:via-indigo-950/10 rounded-2xl border border-blue-100/30 dark:border-blue-900/30 space-y-2">
                  <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    가입 즉시 확정 이익 선언
                  </h3>
                  <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                    당신은 가입 즉시 <strong className="text-amber-500 dark:text-amber-400 font-extrabold">{calculations.refundKRW.toLocaleString()}원</strong>의 세금을 돌려받아, 이미 <strong className="text-emerald-500 dark:text-emerald-400 font-extrabold">{calculations.confirmedYield.toFixed(2)}%</strong>의 확정 수익을 얻고 시작합니다.
                  </p>
                </div>

                {/* 2. 최고세율 대비 가성비 지수 영역 */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      💎 최고세율 대비 가성비 혜택 지수
                    </h3>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      효율 점수: {calculations.costEffectivenessScore} / 100점
                    </span>
                  </div>
                  
                  {/* Premium Horizontal Indicator Meter */}
                  <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
                      style={{ width: `${calculations.costEffectivenessScore}%` }}
                    ></div>
                  </div>

                  <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    대한민국 최고 자산가(최고세율 49.5%)가 받는 혜택을 100점으로 두었을 때, 당신의 세제 혜택 효율 점수는 <strong className="text-indigo-600 dark:text-indigo-400 font-black">{calculations.costEffectivenessScore}점</strong>입니다.
                  </p>
                </div>

                {/* 3. 실시간 시뮬레이터 차트 및 세부 분석 */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-150 dark:border-slate-800 pt-4">
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                      국민성장펀드 실시간 손실방어 시뮬레이션
                    </h3>
                    
                    {/* Custom HTML Legend */}
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-350"></span>
                        <span className="text-slate-400">일반 펀드 (방어 무)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
                        <span className="text-blue-500">국민성장펀드 (방어 유)</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart Container Canvas */}
                  <div className="relative h-64 md:h-72 w-full rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 p-2">
                    <canvas ref={chartCanvasRef} id="visualizer-chart-canvas"></canvas>
                  </div>

                  {/* Real-time Result Summary Table */}
                  <div className="grid grid-cols-2 gap-4 text-xs md:text-sm font-bold p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="space-y-2 border-r border-slate-200 dark:border-slate-800 pr-2">
                      <span className="text-slate-400 block">시장 예상 하락/수익률</span>
                      <span className={`text-base font-black ${
                        expectedYield < 0 ? 'text-red-500' : expectedYield > 0 ? 'text-emerald-500' : 'text-slate-600'
                      }`}>
                        {expectedYield > 0 ? `+${expectedYield}%` : `${expectedYield}%`}
                      </span>
                      <span className="text-slate-400 block text-xs">
                        시장 자체 변동액: {expectedYield > 0 ? '+' : ''}
                        {Math.round(calculations.investment * (expectedYield / 100) * 10000).toLocaleString()}원
                      </span>
                    </div>
                    <div className="space-y-2 pl-2">
                      <span className="text-blue-500 block">나의 실제 원금 변동률 (방어반영)</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        {calculations.myActualReturn > 0 ? `+${calculations.myActualReturn}%` : `${calculations.myActualReturn}%`}
                      </span>
                      <span className="text-slate-400 block text-xs">
                        평가액 변동: {calculations.actualLossGainKRW > 0 ? '+' : ''}
                        {calculations.actualLossGainKRW.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center text-center p-6 bg-slate-50/20">
                <div className="space-y-2">
                  <span className="text-4xl block">💳</span>
                  <p className="text-base text-slate-400 max-w-sm leading-relaxed mx-auto font-black">
                    국민성장펀드 투자금액(1만 원 단위)과 소득 구간을 설정하시면, 실시간 정밀 연말정산 절세 계산 및 손실방어 리뮬레이터 차트가 펼쳐집니다.
                  </p>
                </div>
              </div>
            )}

            {/* Advisory Footnotes */}
            {calculations.investment > 0 && (
              <div className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-4 space-y-1 font-semibold">
                <div>* 적용 소득세율 구간: <strong className="text-slate-600 dark:text-slate-350">{calculations.bracket.label}</strong></div>
                <div>* 본 실시간 계산은 대한민국 종합소득세 및 지방소득세 10%의 합산 표준에 근거한 모의치입니다. 가입자 본인의 다른 연말정산 소득공제 및 세액공제 항목 중복 여부에 따라 실제 연말 정산 시 환급액은 소폭 증감이 있을 수 있습니다.</div>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* --- 국민성장펀드 안내 가이드 (SEO 최적화 컨텐츠) --- */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 mb-8 space-y-6 text-slate-700 dark:text-slate-300">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          💡 국민성장펀드 투자 상식 및 혜택 극대화 팁
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base leading-relaxed">
          <div className="space-y-3 bg-white dark:bg-slate-850 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/40">
            <h3 className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-base">
              <span>📉</span> 국민성장펀드의 후순위 손실 우선분담 구조란 무엇인가요?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              국민성장펀드는 일반 국민이 참여하는 선순위 투자금과 재정 및 정책 금융기관, 운용사 자금으로 매칭되는 <strong>20%의 후순위 투자 구조</strong>를 띱니다. 
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              이에 따라 펀드 운용 결과 손실이 발생할 경우, <strong>정부 및 운용사의 후순위 출자금이 전체 자산의 -20%까지의 모든 최초 손실액을 독점적으로 흡수 및 감당</strong>하여 일반 개인 투자자의 원금을 강력하게 방어해 줍니다.
            </p>
          </div>

          <div className="space-y-3 bg-white dark:bg-slate-850 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/40">
            <h3 className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 text-base">
              <span>💰</span> 국민성장펀드 소득공제 및 연말정산 환급 혜택 극대화
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              본 펀드는 <strong>5,000만 원 한도</strong> 내에서 최적의 누진 공제 소득 차감 효과를 지원합니다. 특히 연봉이나 사업 소득이 높아 <strong>세율이 높게 적용되는 고소득자일수록</strong> 소득공제 차감에 따라 되돌려받는 예상 세금 환급액이 비약적으로 급증합니다.
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              가입 즉시 발생하는 <strong>절세 수익률 Y</strong>는 시장 변동과 무관하게 납입 즉시 과세표준 차감 환급으로 확보되므로 매우 강력한 하방 메리트를 지닙니다.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 최하단: 주의사항 경고 위젯 (빨간색 테두리) ================= */}
      <footer className="border-2 border-red-500 bg-red-50/70 dark:bg-red-950/20 rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full text-3xl shrink-0">
            ⚠️
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-red-700 dark:text-red-400 m-0">
              국민성장펀드 투자자 보호 주의의무 안내
            </h3>
            <p className="text-sm md:text-base text-red-655 dark:text-red-305 leading-relaxed font-extrabold m-0">
              주의: 정부가 20%의 손실을 우선 분담하더라도, 펀드 손실이 20%를 초과하면 초과분만큼 내 원금도 손실을 입습니다. 본 상품은 원금 보장 상품이 아니며, 5년간 중도 환매가 불가능하므로 여유 자금으로 신중히 투자하셔야 합니다.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
