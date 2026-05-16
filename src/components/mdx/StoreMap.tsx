'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export function StoreMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. 카카오맵 초기화
  useEffect(() => {
    // 스크립트가 비동기로 로드되므로 kakao 객체가 생길 때까지 대기
    const initMap = () => {
      if (window.kakao && window.kakao.maps && mapRef.current) {
        window.kakao.maps.load(() => {
          const options = {
            center: new window.kakao.maps.LatLng(37.566826, 126.978656), // 기본 중심 좌표 (서울시청)
            level: 4,
          };
          const newMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(newMap);
        });
      } else {
        setTimeout(initMap, 500); // 0.5초 후 재시도
      }
    };
    initMap();
  }, []);

  // 2. 내 위치 추적 및 공공데이터 호출
  const findMyStores = () => {
    if (!map) return;
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // 내 위치로 지도 중심 이동
          const locPosition = new window.kakao.maps.LatLng(lat, lng);
          map.setCenter(locPosition);
          
          // 내 위치 마커 표시
          new window.kakao.maps.Marker({
            position: locPosition,
            map: map,
            image: new window.kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
              new window.kakao.maps.Size(32, 36)
            )
          });

          // Proxy API (서버) 호출
          try {
            const res = await fetch(`/api/stores?cx=${lng}&cy=${lat}&radius=1000`);
            const data = await res.json();
            
            if (data?.body?.items) {
              drawMarkers(data.body.items, map);
            } else {
              setError('반경 1km 이내에 가맹점(소상공인) 데이터가 없습니다.');
            }
          } catch (err) {
            setError('가맹점 정보를 불러오는데 실패했습니다.');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError('위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
          setLoading(false);
        }
      );
    } else {
      setError('이 브라우저에서는 위치 기반 검색을 지원하지 않습니다.');
      setLoading(false);
    }
  };

  // 3. 응답받은 상점들을 지도 위에 마커로 그리기
  const drawMarkers = (items: any[], targetMap: any) => {
    items.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lon);
      const marker = new window.kakao.maps.Marker({
        position,
        map: targetMap,
      });

      // 마커 클릭 시 상점 이름과 업종 말풍선 표시
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:13px;font-weight:bold;color:#1e293b;min-width:150px;border-radius:8px;">
          ${store.bizesNm}<br/>
          <span style="font-size:11px;color:#64748b;font-weight:normal;">${store.indsSclsNm} | ${store.rdnmAdr || store.ldnmAdr}</span>
        </div>`,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(targetMap, marker);
      });
    });
  };

  return (
    <div className="not-prose my-12 bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">📍 내 주변 지원금 사용처 실시간 조회</h3>
          <p className="text-sm md:text-base text-slate-500 break-keep">
            아래 버튼을 누르시면, 공공데이터포털(data.go.kr)과 연동되어 현재 위치 반경 1km 이내의 소상공인 가맹점을 지도에 즉시 표시합니다.
          </p>
        </div>
        <button 
          onClick={findMyStores}
          disabled={loading}
          className="shrink-0 bg-[#0a3d7e] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg text-sm md:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-white"></div>
              조회 중...
            </>
          ) : (
            '내 주변 가맹점 불러오기'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* 카카오맵 캔버스 */}
      <div className="w-full h-[350px] md:h-[500px] bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner border border-slate-200">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#0a3d7e] mb-4"></div>
            <p className="text-[#0a3d7e] font-bold text-sm bg-white/80 px-4 py-1.5 rounded-full shadow-sm">
              정부 서버에서 데이터를 가져오고 있습니다...
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 text-xs text-slate-400 text-right flex justify-end items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        공공데이터포털 실시간 연동 중 (제공: 소상공인시장진흥공단)
      </div>
    </div>
  );
}
