"use client";

import { useState } from 'react';

export default function EligibilityClient() {
  const [subType, setSubType] = useState<string | null>('직장가입자');
  const [members, setMembers] = useState<string | null>('1인');
  const [premium, setPremium] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    if (!subType || !members || !premium) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    setShowResult(true);
  };

  const handleChange = (type: 'subType' | 'members' | 'premium', value: string) => {
    setShowResult(false);
    if (type === 'subType') setSubType(value);
    if (type === 'members') setMembers(value);
    if (type === 'premium') setPremium(value);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 w-full">
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
        {/* Header */}
        <div className="bg-[#0f4088] p-6 text-white">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-2">
            <span role="img" aria-label="search">🔍</span>
            내 고유가 피해지원금 1분 확인
          </h1>
          <p className="text-sm md:text-base text-blue-100">
            건강보험료를 입력하면 받을 수 있는 금액을 즉시 확인합니다.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          {/* 가입 유형 */}
          <div>
            <label className="block text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-3">
              가입 유형
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {['직장가입자', '지역가입자', '혼합가입자'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleChange('subType', type)}
                  className={`flex-1 py-3 text-[15px] font-medium rounded-lg border transition-colors ${
                    subType === type
                      ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 가구원 수 */}
          <div>
            <label className="block text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-3">
              가구원 수
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {['1인', '2인', '3인', '4인 이상'].map((count) => (
                <button
                  key={count}
                  onClick={() => handleChange('members', count)}
                  className={`flex-1 py-3 text-[15px] font-medium rounded-lg border transition-colors ${
                    members === count
                      ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* 건강보험료 입력 */}
          <div>
            <label className="block text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-3">
              납부 중인 건강보험료 (원)
            </label>
            <div className="relative">
              <input
                type="text"
                value={premium}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  if (rawValue) {
                    handleChange('premium', Number(rawValue).toLocaleString());
                  } else {
                    handleChange('premium', '');
                  }
                }}
                placeholder="예: 120000 원"
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg py-4 px-4 text-right placeholder-gray-400 font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg transition-colors"
              />
            </div>
          </div>

          {/* 계산 버튼 */}
          <button
            onClick={handleCalculate}
            className={`w-full font-bold py-4 rounded-xl transition-colors text-lg text-white ${
              subType && members && premium
                ? 'bg-[#0f4088] hover:bg-[#0c336b] shadow-md' // Updated to match the dark blue from the second image
                : 'bg-[#89a0bb] cursor-not-allowed'
            }`}
          >
            지원금 계산하기
          </button>

          {/* 결과 영역 */}
          {showResult && (
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#f0f5ff] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#0f4088] dark:text-blue-400 flex items-center mb-2">
                  <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  축하합니다! 지원 대상입니다.
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-[15px] mb-6 md:ml-8">
                  입력하신 건보료가 커트라인(138,000원) 이하입니다.
                </p>

                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-6 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    예상 지원금 ({members} 가구 기준)
                  </p>
                  <p className="text-3xl md:text-4xl font-extrabold text-[#0f4088] dark:text-blue-400">
                    250,000<span className="text-2xl md:text-3xl">원</span>
                  </p>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="mt-4 bg-[#f8fafc] dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex gap-3 items-start">
                <span className="text-lg leading-none" role="img" aria-label="warning">⚠️</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                  <strong className="font-semibold text-gray-700 dark:text-gray-300">주의사항:</strong> 재산세 과세표준 12억 초과 또는 금융소득 2천만 원 초과 시 소득 기준을 충족하더라도 최종 탈락할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
