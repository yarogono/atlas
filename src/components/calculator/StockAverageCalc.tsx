'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface RowData {
  id: string;
  price: string;
  quantity: string;
}

interface SavedCalculation {
  id: string;
  name: string;
  timestamp: number;
  currency: string;
  rows: RowData[];
}

export default function StockAverageCalc() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<'basic' | 'reverse'>('basic');
  const [currency, setCurrency] = useState<string>('₩');
  
  // 테이블 입력 행 (이미지와 동일하게 초기 4개 빈 행으로 설정, 예시 값 제거)
  const [rows, setRows] = useState<RowData[]>([
    { id: '1', price: '', quantity: '' },
    { id: '2', price: '', quantity: '' },
    { id: '3', price: '', quantity: '' },
    { id: '4', price: '', quantity: '' },
  ]);

  // 목표가 역산 State (예시 값 제외)
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [marketPrice, setMarketPrice] = useState<string>('');

  // 로컬스토리지 저장 목록
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string>('');

  // 모달 제어 State
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  
  // 백업/가져오기 텍스트 영역 State
  const [backupText, setBackupText] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // --- Hydration & LocalStorage initialization ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stock-calc-saved-lists');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSavedCalcs(parsed);
        } catch (e) {
          console.error('Failed to parse saved lists from localStorage', e);
        }
      }
      const storedCurrency = localStorage.getItem('stock-calc-currency');
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
    }
  }, []);

  // --- Helper: Real-time Comma Formatting ---
  const formatNumber = (val: string) => {
    // 소수점 및 숫자 외 문자열 전부 제거
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    
    // 소수점이 여러 개 찍힌 경우 방지
    if (parts.length > 2) return clean; 
    
    let integerPart = parts[0];
    
    // 앞서 등장하는 무의미한 0들 제거 (단, "0" 단독 혹은 "0." 시작은 허용)
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

  // --- Row control actions ---
  const handleInputChange = (id: string, field: 'price' | 'quantity', value: string) => {
    const formatted = formatNumber(value);
    setRows(prevRows => 
      prevRows.map(row => (row.id === id ? { ...row, [field]: formatted } : row))
    );
  };

  const addRow = () => {
    const nextId = (rows.length > 0 
      ? Math.max(...rows.map(r => parseInt(r.id) || 0)) + 1 
      : 1
    ).toString();
    setRows([...rows, { id: nextId, price: '', quantity: '' }]);
  };

  const removeRow = (id: string) => {
    // 사용성에 최적화: 행이 1개 남으면 삭제 대신 초기값으로
    if (rows.length === 1) {
      setRows([{ id: '1', price: '', quantity: '' }]);
      return;
    }
    setRows(rows.filter(row => row.id !== id));
  };

  const resetAll = () => {
    if (activeTab === 'basic') {
      setRows([
        { id: '1', price: '', quantity: '' },
        { id: '2', price: '', quantity: '' },
        { id: '3', price: '', quantity: '' },
        { id: '4', price: '', quantity: '' },
      ]);
      setSelectedSavedId('');
    } else {
      setCurrentPrice('');
      setCurrentQuantity('');
      setTargetPrice('');
      setMarketPrice('');
    }
  };

  // --- Math calculations ---
  const calculatedData = useMemo(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let validCount = 0;

    const rowDetails = rows.map(row => {
      const p = parseRawNumber(row.price);
      const q = parseRawNumber(row.quantity);
      const subtotal = p * q;
      if (p > 0 && q > 0) {
        totalQuantity += q;
        totalAmount += subtotal;
        validCount++;
      }
      return {
        ...row,
        subtotal
      };
    });

    const averagePrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

    return {
      rowDetails,
      totalQuantity,
      totalAmount,
      averagePrice,
      validCount
    };
  }, [rows]);

  // 역산 계산
  const reverseData = useMemo(() => {
    const curP = parseRawNumber(currentPrice);
    const curQ = parseRawNumber(currentQuantity);
    const curTotal = curP * curQ;

    const targetP = parseRawNumber(targetPrice);
    const marketP = parseRawNumber(marketPrice);

    if (curP <= 0 || curQ <= 0 || targetP <= 0 || marketP <= 0) {
      return { status: 'idle', message: '보유 주식 정보와 목표 정보를 입력해 주세요.' };
    }

    if (targetP >= curP) {
      return { status: 'invalid', message: '목표 평단가는 현재 평단가보다 낮아야 성립됩니다.' };
    }

    if (targetP <= marketP) {
      return { 
        status: 'impossible', 
        message: `목표 평단가(${currency}${targetP.toLocaleString()})는 추가 매수할 단가(${currency}${marketP.toLocaleString()})보다 높아야 합니다. 추가 매수 단가보다 낮은 평단가는 수학적으로 달성할 수 없습니다.` 
      };
    }

    const denominator = targetP - marketP;
    const numerator = curTotal - (targetP * curQ);
    const requiredQuantity = numerator / denominator;

    if (requiredQuantity <= 0) {
      return {
        status: 'impossible',
        message: '현재 입력한 조건에서는 목표 평단가에 도달할 수 없습니다. 입력 값을 다시 확인해 주세요.'
      };
    }

    const requiredAmount = requiredQuantity * marketP;
    const finalQuantity = curQ + requiredQuantity;
    const finalTotalAmount = curTotal + requiredAmount;

    // 추가 매수 단가 대비 상승해야 할 비율
    const requiredRisePercent = marketP > 0 ? ((targetP - marketP) / marketP) * 100 : 0;

    return {
      status: 'success',
      requiredQuantity,
      requiredAmount,
      finalQuantity,
      finalTotalAmount,
      requiredRisePercent
    };
  }, [currentPrice, currentQuantity, targetPrice, marketPrice, currency]);

  // --- Save / Load / Backup Actions ---
  const saveCurrentCalculation = () => {
    if (!saveName.trim()) return;

    const newSave: SavedCalculation = {
      id: Date.now().toString(),
      name: saveName.trim(),
      timestamp: Date.now(),
      currency,
      rows: rows.map(r => ({ ...r }))
    };

    const updated = [...savedCalcs.filter(c => c.name !== saveName.trim()), newSave];
    setSavedCalcs(updated);
    localStorage.setItem('stock-calc-saved-lists', JSON.stringify(updated));
    setSelectedSavedId(newSave.id);
    setIsSaveModalOpen(false);
    setSaveName('');
  };

  const loadSavedCalculation = (id: string) => {
    if (!id) return;
    const found = savedCalcs.find(c => c.id === id);
    if (found) {
      setRows(found.rows);
      setCurrency(found.currency);
      setSelectedSavedId(id);
    }
  };

  const deleteSavedCalculation = (id: string) => {
    const updated = savedCalcs.filter(c => c.id !== id);
    setSavedCalcs(updated);
    localStorage.setItem('stock-calc-saved-lists', JSON.stringify(updated));
    if (selectedSavedId === id) {
      setSelectedSavedId('');
    }
  };

  // 화폐 변경 핸들러
  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    localStorage.setItem('stock-calc-currency', newCurr);
    setIsCurrencyModalOpen(false);
  };

  // 내보내기 텍스트 세팅
  const handleOpenMenuModal = () => {
    setIsMenuModalOpen(true);
    setBackupText(JSON.stringify(savedCalcs, null, 2));
    setImportText('');
    setImportError('');
    setImportSuccess(false);
  };

  // 가져오기 실행
  const handleImport = () => {
    try {
      if (!importText.trim()) {
        setImportError('가져올 데이터를 입력해 주세요.');
        return;
      }
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        setImportError('올바른 백업 데이터 형식이 아닙니다. (배열 형태여야 합니다)');
        return;
      }
      
      // 유효성 체크
      const isValid = parsed.every(item => 
        item && 
        typeof item.name === 'string' && 
        Array.isArray(item.rows)
      );

      if (!isValid) {
        setImportError('데이터 구조가 올바르지 않습니다. 필수 필드(name, rows)가 누락되었습니다.');
        return;
      }

      const updated = [...savedCalcs];
      parsed.forEach(importedItem => {
        // 중복 이름 대체 혹은 고유 ID 부여 추가
        const newId = importedItem.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const existsIdx = updated.findIndex(c => c.name === importedItem.name);
        const itemToSave: SavedCalculation = {
          id: newId,
          name: importedItem.name,
          timestamp: importedItem.timestamp || Date.now(),
          currency: importedItem.currency || '₩',
          rows: importedItem.rows
        };

        if (existsIdx > -1) {
          updated[existsIdx] = itemToSave;
        } else {
          updated.push(itemToSave);
        }
      });

      setSavedCalcs(updated);
      localStorage.setItem('stock-calc-saved-lists', JSON.stringify(updated));
      setBackupText(JSON.stringify(updated, null, 2));
      setImportSuccess(true);
      setImportText('');
      setImportError('');
    } catch (e) {
      setImportError('JSON 데이터 파싱에 실패했습니다. 올바른 텍스트인지 다시 한 번 확인해 주세요.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('백업 데이터가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="not-prose w-full select-none transition-all duration-300">
      
      {/* 계산기 헤더 및 메인 뷰포트 컨테이너 */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
        
        {/* 상단 헤더 & 화폐 설정 버튼 */}
        <div className="px-6 py-6 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              📉 평단가 계산기
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              주식 및 가상화폐 추가 매수 평단가 관리 & 목표 역산 시뮬레이터
            </p>
          </div>
          <button
            onClick={() => setIsCurrencyModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span>⚙️ 화폐 설정</span>
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
              {currency || '기호없음'}
            </span>
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-4 text-center font-black text-sm transition-all flex justify-center items-center gap-2 border-b-2 ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span>🔄 실시간 물타기 계산</span>
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`flex-1 py-4 text-center font-black text-sm transition-all flex justify-center items-center gap-2 border-b-2 ${
              activeTab === 'reverse'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span>🎯 목표 평단가 역산</span>
          </button>
        </div>

        {/* 메인 작업 영역 */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900">
          {activeTab === 'basic' ? (
            
            // ---------------- [1. 실시간 물타기 계산 탭] ----------------
            <div className="space-y-6">
              
              {/* 입력 테이블 구조 */}
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-thin">
                <table className="w-full min-w-[550px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black">
                      <th className="py-3 text-left w-12 pl-2">순번</th>
                      <th className="py-3 text-center w-1/3">가격 ({currency || 'n'})</th>
                      <th className="py-3 text-center w-8"></th>
                      <th className="py-3 text-center w-1/4">수량 (n)</th>
                      <th className="py-3 text-center w-8"></th>
                      <th className="py-3 text-right pr-6">합계 ({currency || 'n'})</th>
                      <th className="py-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {rows.map((row, index) => {
                      const p = parseRawNumber(row.price);
                      const q = parseRawNumber(row.quantity);
                      const subtotal = p * q;
                      
                      return (
                        <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          {/* 순번 */}
                          <td className="py-3 text-left font-black text-xs text-slate-400 dark:text-slate-500 pl-2">
                            {index + 1}.
                          </td>
                          {/* 가격 */}
                          <td className="py-2">
                            <input
                              type="text"
                              value={row.price}
                              onChange={(e) => handleInputChange(row.id, 'price', e.target.value)}
                              placeholder="가격"
                              className="w-full py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                            />
                          </td>
                          {/* x 기호 */}
                          <td className="py-2 text-center text-slate-300 dark:text-slate-700 font-bold text-sm">
                            x
                          </td>
                          {/* 수량 */}
                          <td className="py-2">
                            <input
                              type="text"
                              value={row.quantity}
                              onChange={(e) => handleInputChange(row.id, 'quantity', e.target.value)}
                              placeholder="수량"
                              className="w-full py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                            />
                          </td>
                          {/* = 기호 */}
                          <td className="py-2 text-center text-slate-300 dark:text-slate-700 font-bold text-sm">
                            =
                          </td>
                          {/* 합계 */}
                          <td className="py-2 text-right pr-6 font-bold text-slate-700 dark:text-slate-300 text-sm">
                            {subtotal > 0 ? subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                          </td>
                          {/* 삭제 버튼 */}
                          <td className="py-2 text-center">
                            <button
                              onClick={() => removeRow(row.id)}
                              className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="삭제"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* 실시간 요약 라인 (녹색 테마) */}
                    <tr className="bg-emerald-50/20 dark:bg-emerald-950/10 font-bold text-emerald-600 dark:text-emerald-400">
                      <td className="py-4 pl-2">합계</td>
                      <td className="py-4 text-right">
                        {calculatedData.averagePrice > 0 
                          ? calculatedData.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                          : '-'}
                      </td>
                      <td className="py-4 text-center text-emerald-400/60">x</td>
                      <td className="py-4 text-right">
                        {calculatedData.totalQuantity > 0 
                          ? calculatedData.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 6 }) 
                          : '-'}
                      </td>
                      <td className="py-4 text-center text-emerald-400/60">=</td>
                      <td className="py-4 text-right pr-6">
                        {calculatedData.totalAmount > 0 
                          ? calculatedData.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                          : '-'}
                      </td>
                      <td className="py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 제어 버튼 영역 (➕ 왼쪽 배치, 💾 🔄 ☰ 우측 배치) */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* 추가 버튼 */}
                <div>
                  <button
                    onClick={addRow}
                    className="w-full sm:w-auto p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-transform active:scale-95 flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105"
                    title="항목 추가"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>

                {/* 우측 관리용 액션 및 불러오기 드롭다운 */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* 저장, 초기화, 메뉴 버튼 그룹 */}
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => setIsSaveModalOpen(true)}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl transition-all shadow-sm active:scale-95"
                      title="저장"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={resetAll}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl transition-all shadow-sm active:scale-95"
                      title="초기화"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                    <button
                      onClick={handleOpenMenuModal}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl transition-all shadow-sm active:scale-95"
                      title="메뉴 및 백업"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                    </button>
                  </div>

                  {/* 불러오기용 드롭다운 */}
                  <div className="relative">
                    <select
                      value={selectedSavedId}
                      onChange={(e) => loadSavedCalculation(e.target.value)}
                      className="w-full sm:w-48 py-2 px-3 pr-8 font-semibold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-none rounded-xl outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-slate-300/35 transition-all"
                    >
                      <option value="">📁 저장된 자산 불러오기</option>
                      {savedCalcs.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* 하단 최종 대시보드 리포트 */}
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  
                  {/* 평균 가격 */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-transform duration-200 hover:scale-[1.02] shadow-sm">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      평균 가격
                    </span>
                    {calculatedData.averagePrice > 0 ? (
                      <span className="text-2xl md:text-3xl font-black text-emerald-500 tracking-tight">
                        {currency} {calculatedData.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-base text-slate-300 dark:text-slate-700 italic font-bold">
                        -
                      </span>
                    )}
                  </div>

                  {/* 총 수량 */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-transform duration-200 hover:scale-[1.02] shadow-sm">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      총 수량
                    </span>
                    {calculatedData.totalQuantity > 0 ? (
                      <span className="text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-200 tracking-tight">
                        {calculatedData.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </span>
                    ) : (
                      <span className="text-base text-slate-300 dark:text-slate-700 italic font-bold">
                        -
                      </span>
                    )}
                  </div>

                  {/* 총 금액 */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-transform duration-200 hover:scale-[1.02] shadow-sm">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      총 금액
                    </span>
                    {calculatedData.totalAmount > 0 ? (
                      <span className="text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-200 tracking-tight">
                        {currency} {calculatedData.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-base text-slate-300 dark:text-slate-700 italic font-bold">
                        -
                      </span>
                    )}
                  </div>

                </div>
              </div>

            </div>
          ) : (
            
            // ---------------- [2. 목표 평단가 역산 탭] ----------------
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 왼쪽 입력 영역 */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 기존 보유 주식 정보 */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                    기존 보유 주식 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase">
                        보유 평단가 ({currency})
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentPrice}
                          onChange={(e) => setCurrentPrice(formatNumber(e.target.value))}
                          placeholder="예: 75,000"
                          className="w-full py-2.5 pl-3 pr-10 font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currency}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1.5">
                        보유 수량 (주)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentQuantity}
                          onChange={(e) => setCurrentQuantity(formatNumber(e.target.value))}
                          placeholder="예: 100"
                          className="w-full py-2.5 pl-3 pr-10 font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">주</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 목표 및 매수 정보 입력 */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                    희망 목표 및 추가 매수 단가
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase">
                        목표 평단가 ({currency})
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(formatNumber(e.target.value))}
                          placeholder="예: 65,000"
                          className="w-full py-2.5 pl-3 pr-10 font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currency}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase">
                        추가 매수할 단가 ({currency})
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={marketPrice}
                          onChange={(e) => setMarketPrice(formatNumber(e.target.value))}
                          placeholder="예: 50,000"
                          className="w-full py-2.5 pl-3 pr-10 font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 초기화 버튼 */}
                <div className="flex">
                  <button
                    onClick={resetAll}
                    className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>입력 초기화</span>
                  </button>
                </div>
              </div>

              {/* 오른쪽 결과 대시보드 */}
              <div className="lg:col-span-5 flex">
                <div className="w-full bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-6 flex-grow">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">역산 대시보드</span>
                      <span className="bg-white/10 text-white/80 text-[9px] font-black px-2 py-0.5 rounded">AUTO</span>
                    </div>

                    {reverseData.status === 'success' ? (
                      <div className="space-y-6">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1 font-bold">희망 평단가 도달 필요 매수액</span>
                          <span className="text-3xl font-black text-yellow-300 tracking-tight">
                            {currency} {Math.round(reverseData.requiredAmount || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">추가 매수 수량</span>
                            <span className="text-sm font-bold text-blue-400">
                              {(reverseData.requiredQuantity || 0).toFixed(2)}주
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">도달을 위한 상승폭</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {(reverseData.requiredRisePercent || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs border-t border-white/5 pt-4">
                          <div className="flex justify-between text-slate-400">
                            <span>최종 예상 총 수량:</span>
                            <span className="font-bold text-slate-200">{(reverseData.finalQuantity || 0).toFixed(2)}주</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>최종 예상 총 자금:</span>
                            <span className="font-bold text-slate-200">{currency} {Math.round(reverseData.finalTotalAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/30 text-[11px] text-blue-200 leading-normal flex items-start gap-1.5">
                          <span>💡</span>
                          <p className="m-0">
                            현재 평단가에서 <strong>{parseRawNumber(targetPrice).toLocaleString()}원</strong>으로 낮추려면, <strong>{parseRawNumber(marketPrice).toLocaleString()}원</strong> 단가에서 기존 보유 대비 <strong>{((reverseData.requiredQuantity || 0) / (parseRawNumber(currentQuantity) || 1) * 100).toFixed(1)}%</strong>의 수량을 더 사야 합니다.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-center">
                        <div>
                          <span className="text-xl block mb-2">🎯</span>
                          <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mx-auto font-medium">
                            {reverseData.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-6 text-[10px] text-slate-500 leading-normal">
                    <span>⚠️ 실제 정산 시 수수료 및 거래 세금 등으로 소폭 오차가 생길 수 있습니다.</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* 사용법 / 작동법 / 위험성 가이드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-slate-800 dark:text-slate-200">
        
        {/* 사용법 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📖</span>
            <h2 className="text-base font-extrabold m-0 tracking-tight">사용법</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            평단가 계산기는 주식이나 가상화폐를 추가로 매입할 때 평균 취득 단가를 구하기 위한 도구입니다.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
            <li>주식 혹은 가상화폐의 <strong>가격</strong>과 <strong>수량</strong>을 입력하면 자동으로 평균 단가가 실시간 계산됩니다.</li>
            <li>왼쪽 하단의 <strong className="text-emerald-500">➕</strong> 버튼을 누르면 평균을 구하고자 하는 추가 항목 행을 무한히 생성할 수 있습니다.</li>
            <li>각 행 끝에 있는 <strong>삭제(x)</strong> 버튼을 누르면 해당 행의 데이터를 깔끔하게 제거할 수 있습니다.</li>
            <li>우측 하단의 <strong>💾 (저장)</strong> 버튼을 누르면 현재 입력된 종목 세션을 브라우저에 이름별로 저장합니다.</li>
            <li><strong>☰ (메뉴)</strong> 내보내기를 누르면 저장된 정보를 텍스트 백업으로 생성하거나 다시 이전 및 이전 기기에서 가져올 수 있습니다. (브라우저 캐시 삭제 시 정보가 지워질 수 있으므로 백업이 유용합니다)</li>
          </ul>
        </div>

        {/* 작동법 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚙️</span>
            <h2 className="text-base font-extrabold m-0 tracking-tight">작동법</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            계산기는 투자 자산의 평균 가격을 구하기 위해 먼저 총 구매 가격을 계산한 뒤, 이를 총 구매 수량으로 나눕니다.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 font-mono text-[11px] text-slate-600 dark:text-slate-350 space-y-2 mb-4">
            <div>• 총 구매 가격 = Σ(주식 가격 * 주식 수)</div>
            <div>• 총 수량 = Σ(주식 수)</div>
            <div className="font-bold text-blue-600 dark:text-blue-400">• 평균 가격 = 총 구매 가격 / 총 수량</div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>예시:</strong> 현재 100의 가격에 100주의 주식을 보유하고 있고, 새로 200의 가격에 200주의 주식을 매수하는 경우,<br />
            총 구매 가격 = <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-[10px]">100 × 100 + 200 × 200 = 50,000</code><br />
            총 구매 개수 = <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-[10px]">100 + 200 = 300</code><br />
            평균 가격 = <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-[10px]">50,000 / 300 ≈ 167</code>원입니다.
          </p>
        </div>

        {/* 위험성 */}
        <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-3xl p-6 shadow-md transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-500">
            <span className="text-lg">⚠️</span>
            <h2 className="text-base font-extrabold m-0 tracking-tight">위험성</h2>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-4 font-semibold">
            단순히 주가가 하락했다는 이유만으로 성급하게 물타기를 진행하는 것은 신중해야 합니다.
          </p>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            일반적으로 기초 체력이 우량한 기업은 장기적으로 주가가 상승하지만, 기초 펀더멘털이 부실한 기업은 지속적으로 주가가 하락하여 결국 상장폐지나 장기 정체에 빠질 수 있습니다. 주가가 떨어졌다고 비중을 함부로 과도하게 늘리는 행위는 나쁜 자산에 더 많은 투자금을 추가로 매몰시키는 결과를 낳을 수 있습니다.<br/><br/>
            추가 매수 전에 현재 주가가 <strong>실제로 일시적 저평가 상태</strong>인지, 기업의 비전과 재무 건전성을 치밀하게 조사해 신중히 투자 결정을 내려야 합니다.
          </p>
        </div>

      </div>

      {/* -------------------- [모달 시스템] -------------------- */}

      {/* 1. 화폐 설정 모달 */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">⚙️ 화폐 설정</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">계산에 사용할 화폐 단위 기호를 선택해 주세요.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: '원화 (₩)', value: '₩' },
                { label: '달러 ($)', value: '$' },
                { label: '엔화 (¥)', value: '¥' },
                { label: '유로 (€)', value: '€' },
                { label: '기호 없음', value: '' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleCurrencyChange(opt.value)}
                  className={`py-3 px-4 text-xs font-bold rounded-xl border text-center transition-all ${
                    currency === opt.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 자산 저장하기 모달 */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-2">💾 자산 계산 세션 저장</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">현재 구성된 평단가 입력 행을 브라우저에 저장합니다.</p>
            <div className="mb-6">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="예: 삼성전자, 비트코인 등"
                className="w-full py-2.5 px-3 font-bold text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsSaveModalOpen(false); setSaveName(''); }}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                취소
              </button>
              <button
                onClick={saveCurrentCalculation}
                disabled={!saveName.trim()}
                className="px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md active:scale-95"
              >
                저장 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 메뉴 및 백업/내보내기/가져오기 모달 */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-2xl shadow-2xl relative max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>☰ 계산 데이터 관리 및 백업</span>
              </h3>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* 저장된 목록 관리 */}
              <div>
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  📁 저장된 세션 목록 ({savedCalcs.length})
                </h4>
                {savedCalcs.length > 0 ? (
                  <div className="max-h-[150px] overflow-y-auto border border-slate-150 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/60 p-1 bg-slate-50/50 dark:bg-slate-950/20">
                    {savedCalcs.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 px-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                        <div>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { loadSavedCalculation(item.id); setIsMenuModalOpen(false); }}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-200 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-750 dark:text-slate-350 rounded-lg transition-all"
                          >
                            불러오기
                          </button>
                          <button
                            onClick={() => deleteSavedCalculation(item.id)}
                            className="px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-slate-150 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    저장된 계산 세션이 없습니다. 메인 테이블 아래의 💾 아이콘으로 계산 정보를 저장해 보세요!
                  </div>
                )}
              </div>

              {/* 데이터 내보내기 (텍스트 백업) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    📤 데이터 백업 (내보내기)
                  </h4>
                  <button
                    onClick={() => copyToClipboard(backupText)}
                    disabled={savedCalcs.length === 0}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 disabled:opacity-50 flex items-center gap-1"
                  >
                    📋 백업 복사하기
                  </button>
                </div>
                <textarea
                  readOnly
                  value={savedCalcs.length > 0 ? backupText : '저장된 계산 세션이 생성되면 이곳에 자동으로 안전 백업 JSON 텍스트가 표시됩니다.'}
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-950/50 text-[10px] font-mono border border-slate-150 dark:border-slate-800 rounded-2xl outline-none select-all text-slate-500 dark:text-slate-400 leading-normal"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  • 위 상자 안의 텍스트 전체를 보관(메모장 등에 붙여넣기)해 두시면 추후 기기 이전이나 브라우저 변경 시 안전하게 복구할 수 있습니다.
                </p>
              </div>

              {/* 데이터 가져오기 */}
              <div>
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  📥 데이터 이전 (가져오기)
                </h4>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="여기에 백업해 둔 JSON 텍스트를 통째로 붙여넣어 주세요..."
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-950/50 text-[10px] font-mono border border-slate-150 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-700 dark:text-slate-300 leading-normal"
                />
                {importError && (
                  <p className="text-[10px] font-semibold text-red-500 mt-1 leading-normal">
                    ⚠️ {importError}
                  </p>
                )}
                {importSuccess && (
                  <p className="text-[10px] font-semibold text-emerald-500 mt-1 leading-normal">
                    🎉 성공적으로 데이터를 이전 및 병합해왔습니다!
                  </p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md active:scale-95"
                  >
                    데이터 복원하기
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-150 dark:border-slate-800 mt-6 pt-4">
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
