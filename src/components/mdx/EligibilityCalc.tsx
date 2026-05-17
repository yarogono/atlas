'use client';

import React, { useState } from 'react';

export const EligibilityCalc = () => {
  const [type, setType] = useState('직장');
  const [members, setMembers] = useState(1);
  const [premium, setPremium] = useState('');
  const [result, setResult] = useState<{ status: 'PASS' | 'FAIL' | 'ERROR'; limit: number; amount: number } | null>(null);

  const calculate = () => {
    const limits = {
      직장: { 1: 138000, 2: 229000, 3: 280000, 4: 320000 },
      지역: { 1: 68000, 2: 164000, 3: 210000, 4: 250000 },
      혼합: { 1: 0, 2: 240000, 3: 310000, 4: 390000 },
    };

    if (type === '혼합' && members === 1) {
      setResult({ status: 'ERROR', limit: 0, amount: 0 });
      return;
    }

    const m = members >= 4 ? 4 : members;
    const limit = limits[type as keyof typeof limits][m as keyof (typeof limits)['직장']];
    const numPremium = Number(premium.replace(/[^0-9]/g, ''));

    if (numPremium <= limit) {
      setResult({ status: 'PASS', limit, amount: members * 250000 });
    } else {
      setResult({ status: 'FAIL', limit, amount: 0 });
    }
  };

  const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPremium(val ? Number(val).toLocaleString() : '');
  };

  return (
    <div className="not-prose my-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#0a3d7e] px-6 py-4">
        <h3 className="text-lg font-bold text-white m-0">🔍 내 고유가 피해지원금 1분 확인</h3>
        <p className="text-sm text-blue-100 mt-1 m-0">건강보험료를 입력하면 받을 수 있는 금액을 즉시 확인합니다.</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">가입 유형</label>
            <div className="grid grid-cols-3 gap-2">
              {['직장', '지역', '혼합'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    if (t === '혼합' && members === 1) setMembers(2);
                  }}
                  className={`py-2 px-4 rounded-lg border text-sm font-bold transition-colors ${
                    type === t
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}가입자
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">가구원 수</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((m) => (
                <button
                  key={m}
                  onClick={() => setMembers(m)}
                  disabled={type === '혼합' && m === 1}
                  className={`py-2 px-4 rounded-lg border text-sm font-bold transition-colors ${
                    members === m
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {m}인{m === 4 ? ' 이상' : ''}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">납부 중인 건강보험료 (원)</label>
            <div className="relative">
              <input
                type="text"
                value={premium}
                onChange={handlePremiumChange}
                placeholder="예: 120000"
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-right font-bold text-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">원</span>
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={!premium}
            className="w-full bg-[#0a3d7e] hover:bg-[#1655a6] text-white font-bold text-lg py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            지원금 계산하기
          </button>
        </div>

        {result && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            {result.status === 'ERROR' ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl font-medium text-center">
                혼합 가입자는 1인 가구 기준이 없습니다. 2인 이상으로 선택해주세요.
              </div>
            ) : result.status === 'PASS' ? (
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 font-black text-xl mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  축하합니다! 지원 대상입니다.
                </div>
                <div className="text-slate-700 mb-4 font-medium">
                  입력하신 건보료가 커트라인({result.limit.toLocaleString()}원) 이하입니다.
                </div>
                <div className="bg-white p-4 rounded-lg text-center border border-blue-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1 font-bold">예상 지원금 ({members}인 가구 기준)</div>
                  <div className="text-3xl font-black text-[#0a3d7e]">{result.amount.toLocaleString()}원</div>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-slate-700 font-black text-xl mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  아쉽게도 지원 대상이 아닙니다.
                </div>
                <div className="text-slate-600 font-medium">
                  입력하신 건보료가 커트라인({result.limit.toLocaleString()}원)을 초과했습니다.
                </div>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg border border-slate-200 flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <p className="text-xs text-slate-600 leading-tight m-0">
                <strong>주의사항:</strong> 재산세 과세표준 12억 초과 또는 금융소득 2천만 원 초과 시 소득 기준을 충족하더라도 최종 탈락할 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
