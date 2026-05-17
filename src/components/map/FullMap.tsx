'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'food', label: '음식점', keywords: ['음식', '식당', '한식', '중식', '일식', '양식'] },
  { id: 'cafe', label: '카페', keywords: ['커피', '카페', '다방', '제과', '베이커리'] },
  { id: 'mart', label: '마트·편의점', keywords: ['편의점', '슈퍼', '마트', '소매'] },
  { id: 'beauty', label: '미용·뷰티', keywords: ['미용', '이발', '네일', '피부'] },
  { id: 'hospital', label: '의료·약국', keywords: ['병원', '의원', '약국', '한의원', '치과'] },
];

export function FullMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infowindows, setInfowindows] = useState<any[]>([]);
  const [showReSearchBtn, setShowReSearchBtn] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(false);
  
  // 1. 카카오맵 초기화
  useEffect(() => {
    const initMap = () => {
      if (window.kakao && window.kakao.maps && mapRef.current && !map) {
        window.kakao.maps.load(() => {
          const options = {
            center: new window.kakao.maps.LatLng(37.566826, 126.978656), // 서울시청
            level: 4,
          };
          const newMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(newMap);

          // 드래그/줌 종료 시 '이 지역 재검색' 버튼 표시
          window.kakao.maps.event.addListener(newMap, 'dragend', () => setShowReSearchBtn(true));
          window.kakao.maps.event.addListener(newMap, 'zoom_changed', () => setShowReSearchBtn(true));

          // 초기 로드 시 내 위치 찾기
          findMyLocation(newMap);
        });
      } else if (!map) {
        setTimeout(initMap, 500);
      }
    };
    initMap();
  }, []);

  // 2. 내 위치 찾기
  const findMyLocation = (targetMap = map) => {
    if (!targetMap) return;
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locPosition = new window.kakao.maps.LatLng(lat, lng);
          targetMap.setCenter(locPosition);
          fetchStores(targetMap, lat, lng);
        },
        () => {
          alert('위치 정보를 가져올 수 없습니다. 기본 위치(서울)에서 검색합니다.');
          fetchStores(targetMap, 37.566826, 126.978656);
        }
      );
    } else {
      fetchStores(targetMap, 37.566826, 126.978656);
    }
  };

  // 3. API 호출
  const fetchStores = async (targetMap: any, lat: number, lng: number) => {
    setLoading(true);
    setShowReSearchBtn(false);
    try {
      const res = await fetch(`/api/stores?cx=${lng}&cy=${lat}&radius=1000`);
      const data = await res.json();
      if (data?.body?.items) {
        setStores(data.body.items);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error(err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // '이 지역 재검색' 핸들러
  const handleReSearch = () => {
    if (!map) return;
    const center = map.getCenter();
    fetchStores(map, center.getLat(), center.getLng());
  };

  // 3.5. 데이터 필터링 (카테고리 및 검색어)
  const filteredStores = useMemo(() => {
    const activeCatObj = CATEGORIES.find(c => c.id === activeCategory);
    return stores.filter(store => {
      // 카테고리 필터링
      let matchesCategory = true;
      if (activeCategory !== 'all' && activeCatObj && activeCatObj.keywords) {
        const searchStr = `${store.indsLclsNm} ${store.indsSclsNm}`.toLowerCase();
        matchesCategory = activeCatObj.keywords.some(kw => searchStr.includes(kw));
      }

      // 검색어 필터링
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const storeName = (store.bizesNm || '').toLowerCase();
        const categoryName = (store.indsSclsNm || '').toLowerCase();
        const address = (store.rdnmAdr || store.lnoAdr || '').toLowerCase();
        matchesSearch = storeName.includes(query) || categoryName.includes(query) || address.includes(query);
      }

      return matchesCategory && matchesSearch;
    });
  }, [stores, activeCategory, searchQuery]);

  // 검색창 입력 시 자동으로 목록 열기
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setShowList(true);
    }
  }, [searchQuery]);

  // 리스트 아이템 클릭 시 지도 이동 및 마커 인포윈도우 표시
  const handleStoreClick = (store: any, idx: number) => {
    if (!map || !window.kakao) return;
    const position = new window.kakao.maps.LatLng(store.lat, store.lon);
    map.panTo(position);

    // 열려있는 다른 인포윈도우 닫기
    infowindows.forEach(iw => iw.close());
    
    // 선택한 마커의 인포윈도우 열기
    if (infowindows[idx] && markers[idx]) {
      infowindows[idx].open(map, markers[idx]);
    }

    // 선택된 가맹점이 지도 중앙 상단에 가려지지 않게 하고 온전히 보이도록 목록을 닫습니다.
    setShowList(false);
  };

  // 4. 데이터/카테고리/검색어 변경 시 마커 다시 그리기
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 마커 및 인포윈도우 제거
    markers.forEach(m => m.setMap(null));
    infowindows.forEach(iw => iw.close());
    setMarkers([]);
    setInfowindows([]);

    const newMarkers: any[] = [];
    const newInfowindows: any[] = [];

    filteredStores.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lon);
      const marker = new window.kakao.maps.Marker({
        position,
        map: map,
      });

      // 주소 및 전화번호 정보 가공 (존재 시에만 렌더링)
      const telNum = store.telNo || store.telno || '';
      const phoneHtml = telNum && telNum.trim() !== '' ? `
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px;color:#475569;font-size:12px;">
          <span style="color:#2563eb;font-weight:bold;font-size:13px;">📞</span>
          <span style="font-weight:500;">${telNum}</span>
        </div>
      ` : '';

      const address = store.rdnmAdr || store.lnoAdr || '';
      const addressHtml = address && address.trim() !== '' ? `
        <div style="display:flex;align-items:start;gap:6px;margin-top:6px;color:#475569;font-size:12px;line-height:1.4;">
          <span style="color:#2563eb;font-weight:bold;font-size:13px;">📍</span>
          <span style="font-weight:500;">${address}</span>
        </div>
      ` : '';

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:14px;min-width:240px;max-width:280px;border-radius:12px;background-color:#ffffff;color:#1e293b;font-family:system-ui, -apple-system, sans-serif;box-sizing:border-box;">
            <div style="border-bottom:1px solid #f1f5f9;padding-bottom:8px;margin-bottom:6px;">
              <h4 style="margin:0;font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;letter-spacing:-0.025em;">
                ${store.bizesNm}
              </h4>
              <span style="display:inline-block;margin-top:4px;font-size:10px;color:#2563eb;background-color:#eff6ff;border:1px solid #bfdbfe;padding:2px 6px;border-radius:6px;font-weight:700;">
                ${store.indsSclsNm}
              </span>
            </div>
            ${addressHtml}
            ${phoneHtml}
          </div>
        `,
        removable: true,
        zIndex: 999
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 열려있는 다른 인포윈도우 닫기
        newInfowindows.forEach(iw => iw.close());
        infowindow.open(map, marker);
      });

      newMarkers.push(marker);
      newInfowindows.push(infowindow);
    });

    setMarkers(newMarkers);
    setInfowindows(newInfowindows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStores, map]);

  return (
    <div className="flex-1 w-full h-full relative flex flex-col">
      {/* 1. 상단 컨트롤 바 (검색창 & 카테고리 필터 & 목록) */}
      <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-white/90 to-white/0 pt-4 pb-12 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 pointer-events-auto flex flex-col gap-2">
          {/* 검색 및 제어 카드 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-3 md:p-4 mb-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xl font-bold text-slate-800 shrink-0 hidden md:inline">🔍</span>
              {/* 검색어 입력란 */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="가맹점명, 업종, 주소로 내 주변 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl text-sm font-medium transition-all outline-none"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label="검색어 지우기"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              {/* 목록 토글 버튼 */}
              <button
                onClick={() => setShowList(!showList)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  showList 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                    : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                목록 {showList ? '접기' : '보기'}
              </button>

              {/* 내 위치 버튼 */}
              <button 
                onClick={() => findMyLocation(map)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                내 위치
              </button>
            </div>
          </div>

          {/* 카테고리 필터 (가로 스크롤) */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border ${
                  activeCategory === cat.id 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 검색 결과 목록 패널 */}
          {showList && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[250px] md:max-h-[350px] overflow-y-auto pointer-events-auto flex flex-col transition-all">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  검색 결과 ({filteredStores.length}개)
                </span>
                {searchQuery && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    &quot;{searchQuery}&quot; 검색됨
                  </span>
                )}
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-blue-600"></div>
                  <span className="text-slate-500 font-medium">가맹점을 불러오는 중입니다...</span>
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
                  </svg>
                  주변에 일치하는 사용처가 없습니다.
                  <br />
                  지도를 이동하거나 다른 검색어를 입력해 보세요.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredStores.map((store, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStoreClick(store, idx)}
                      className="w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex flex-col gap-1 outline-none focus:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                          {store.bizesNm}
                        </span>
                        <span className="shrink-0 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium border border-blue-100">
                          {store.indsSclsNm}
                        </span>
                      </div>
                      
                      {(store.rdnmAdr || store.lnoAdr) && (
                        <span className="text-xs text-slate-500 leading-normal">
                          📍 {store.rdnmAdr || store.lnoAdr}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. '이 지역 재검색' 플로팅 버튼 */}
      {showReSearchBtn && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleReSearch}
            className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200 font-bold py-2.5 px-5 rounded-full shadow-lg flex items-center gap-2 transition-all animate-bounce-short"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            이 지역 재검색
          </button>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-blue-600"></div>
          <span className="text-slate-700 font-medium text-sm">상점을 불러오는 중...</span>
        </div>
      )}

      {/* 3. 지도 캔버스 */}
      <div ref={mapRef} className="w-full h-full bg-slate-200 z-0" />

      {/* 4. 하단 플로팅 정보바 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-[#1e293b] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
          <span className="text-sm">현재 조건에 맞는 가맹점:</span>
          <span className="font-bold text-yellow-300 text-lg">{markers.length}개</span>
        </div>
      </div>
    </div>
  );
}
