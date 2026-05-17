'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RegionMiniMapProps {
  lat: number;
  lng: number;
  officeName: string;
  officeAddress: string;
  officePhone: string;
}

export function RegionMiniMap({ lat, lng, officeName, officeAddress, officePhone }: RegionMiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const initMap = () => {
      if (window.kakao && window.kakao.maps && mapRef.current && !map) {
        window.kakao.maps.load(() => {
          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 4,
          };
          const newMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(newMap);

          // Add marker at administrative coordinates
          const markerPosition = new window.kakao.maps.LatLng(lat, lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            map: newMap,
          });

          // Customized InfoWindow
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:14px;min-width:240px;max-width:280px;border-radius:12px;background-color:#ffffff;color:#1e293b;font-family:system-ui, -apple-system, sans-serif;box-sizing:border-box;">
                <div style="border-bottom:1px solid #f1f5f9;padding-bottom:8px;margin-bottom:6px;">
                  <h4 style="margin:0;font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;letter-spacing:-0.025em;">
                    ${officeName}
                  </h4>
                  <span style="display:inline-block;margin-top:4px;font-size:10px;color:#2563eb;background-color:#eff6ff;border:1px solid #bfdbfe;padding:2px 6px;border-radius:6px;font-weight:700;">
                    지자체 관공서
                  </span>
                </div>
                <div style="display:flex;align-items:start;gap:6px;margin-top:6px;color:#475569;font-size:12px;line-height:1.4;">
                  <span style="color:#2563eb;font-weight:bold;font-size:13px;">📍</span>
                  <span style="font-weight:500;white-space:normal;word-break:break-all;">${officeAddress}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:6px;color:#475569;font-size:12px;">
                  <span style="color:#2563eb;font-weight:bold;font-size:13px;">📞</span>
                  <span style="font-weight:500;">${officePhone}</span>
                </div>
              </div>
            `,
            removable: true,
            zIndex: 999
          });

          infowindow.open(newMap, marker);

          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(newMap, marker);
          });
        });
      } else if (!map) {
        setTimeout(initMap, 500);
      }
    };
    initMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, officeName, officeAddress, officePhone]);

  return (
    <div className="w-full h-[320px] md:h-[400px] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-inner bg-slate-100 relative">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
