'use client';

import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  client?: string;
  slot: string;
  format?: string;
  responsive?: boolean;
}

export function AdSense({
  client = 'ca-pub-5633731930294890',
  slot,
  format = 'auto',
  responsive = true,
}: AdSenseProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // 로컬 개발 환경(Strict Mode)에서는 두 번 실행되어 발생하는 push 에러를 방지합니다.
    if (process.env.NODE_ENV === 'development') return;

    try {
      if (insRef.current && insRef.current.getAttribute('data-pushed') !== 'true') {
        insRef.current.setAttribute('data-pushed', 'true');
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [slot]);

  // 개발 환경(localhost)에서는 광고가 나오지 않으므로, 영역만 시각적으로 표시해줍니다.
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="not-prose w-full my-8 relative overflow-hidden flex justify-center items-center bg-slate-50 border border-slate-200 border-dashed rounded-lg min-h-[250px]">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '250px' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      {isDev && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-slate-200 text-slate-500 px-4 py-2 rounded-md text-sm font-bold shadow-sm">
            광고 삽입 영역 (Google AdSense)
          </span>
        </div>
      )}
    </div>
  );
}
