'use client';

import React, { useEffect, useRef, useState } from 'react';

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

  // 4. 데이터/카테고리 변경 시 마커 다시 그리기
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 마커 및 인포윈도우 제거
    markers.forEach(m => m.setMap(null));
    infowindows.forEach(iw => iw.close());
    setMarkers([]);
    setInfowindows([]);

    const activeCatObj = CATEGORIES.find(c => c.id === activeCategory);
    
    const filteredStores = stores.filter(store => {
      if (activeCategory === 'all') return true;
      if (!activeCatObj || !activeCatObj.keywords) return true;
      
      const searchStr = `${store.indsLclsNm} ${store.indsSclsNm}`.toLowerCase();
      return activeCatObj.keywords.some(kw => searchStr.includes(kw));
    });

    const newMarkers: any[] = [];
    const newInfowindows: any[] = [];

    filteredStores.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lon);
      const marker = new window.kakao.maps.Marker({
        position,
        map: map,
      });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:12px;font-size:14px;font-weight:bold;color:#1e293b;min-width:180px;border-radius:8px;">
          ${store.bizesNm}<br/>
          <span style="font-size:12px;color:#64748b;font-weight:normal;">${store.indsSclsNm}</span>
        </div>`,
        removable: true
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
  }, [stores, activeCategory, map]);

  return (
    <div className="flex-1 w-full h-full relative flex flex-col">
      {/* 1. 상단 컨트롤 바 (검색창 & 카테고리 필터) */}
      <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-white/90 to-white/0 pt-4 pb-12 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 pointer-events-auto">
          {/* 타이틀 바 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 mb-3 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">🔍 사용처 찾기</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => findMyLocation(map)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
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
        </div>
      </div>

      {/* 2. '이 지역 재검색' 플로팅 버튼 */}
      {showReSearchBtn && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20">
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
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-3">
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
