import React from 'react';
import Link from 'next/link';

interface AppItem {
  name: string;
  icon: string;
  color: string;
  url: string;
  subtitle?: string;
}

export function AppCta() {
  const apps: AppItem[] = [
    { name: '카카오뱅크', icon: '🏦', color: 'bg-[#FEE500] text-black border-[#FEE500]', url: '#' },
    { name: '토스뱅크', icon: '💙', color: 'bg-[#0050FF] text-white border-[#0050FF]', url: '#' },
    { name: '케이뱅크', icon: '🏦', color: 'bg-[#000041] text-white border-[#000041]', url: '#' },
    { name: '카카오페이', icon: '💛', color: 'bg-[#FEE500] text-black border-[#FEE500]', url: '#' },
    { name: '네이버페이', icon: '💚', color: 'bg-[#03C75A] text-white border-[#03C75A]', url: '#' },
    { name: '복지로', icon: '🏛', color: 'bg-[#0a3d7e] text-white border-[#0a3d7e]', url: '#', subtitle: '온라인 신청' },
  ];

  return (
    <div className="not-prose bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden mb-12 shadow-sm">
      <div className="bg-[#f2f5f9] px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-[#0a3d7e] text-white p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" />
            </svg>
          </div>
          <h2 className="text-base md:text-lg font-bold text-[#0a3d7e]">간편결제 앱 신청 바로가기</h2>
        </div>
        <span className="text-[11px] md:text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500">인터넷뱅킹 · 간편결제 앱 전용 (오프라인 창구 없음)</span>
      </div>

      <div className="p-5 md:p-8 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {apps.map((app, idx) => (
          <div key={idx} className={`border rounded-xl flex items-center justify-between p-4 ${app.color} transition-transform hover:-translate-y-0.5`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{app.icon}</div>
              <div className="flex flex-col">
                <span className="font-bold text-sm md:text-base leading-tight">{app.name}</span>
                <span className="text-[10px] md:text-xs opacity-80 mt-0.5">{app.subtitle || '앱에서 신청'}</span>
              </div>
            </div>
            <Link href={app.url} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
