import React from 'react';

interface SubsidyHeroProps {
  badgeText: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  infoCards: string;
  scheduleText: string;
}

export function SubsidyHero({ badgeText, title, subtitle, lastUpdated, infoCards, scheduleText }: SubsidyHeroProps) {
  let parsedInfoCards = [];
  try {
    parsedInfoCards = typeof infoCards === 'string' ? JSON.parse(infoCards) : infoCards;
  } catch (e) {
    console.error('Failed to parse infoCards', e);
  }

  return (
    <div className="not-prose w-full bg-[#0a3d7e] text-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-8 md:mb-12">
      <div className="p-5 py-8 md:p-12 text-center">
        {/* Badge */}
        <div className="inline-block bg-[#1655a6] border border-[#2b71cc] text-blue-100 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full mb-4 md:mb-6">
          <span className="mr-1.5 md:mr-2">🔵</span>{badgeText}
        </div>
        
        {/* Title */}
        <h1 className="text-2xl md:text-5xl font-extrabold mb-3 md:mb-4 leading-snug md:leading-tight break-keep">
          {title}
        </h1>
        <p className="text-blue-200 text-sm md:text-xl mb-6 md:mb-8 break-keep">
          {subtitle}
        </p>
        
        {/* Update Time */}
        <div className="text-yellow-400 text-xs md:text-sm font-medium mb-6 md:mb-10 flex items-center justify-center gap-1.5 md:gap-2">
          <span>✨</span> 최종 업데이트: {lastUpdated}
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-5 md:mb-6">
          {parsedInfoCards.map((card: any, index: number) => (
            <div key={index} className="bg-[#104a96] border border-[#1d5fb5] rounded-xl p-3 md:p-4 text-center">
              <div className="text-blue-200 text-[11px] md:text-sm mb-1">{card.label}</div>
              <div className="text-white font-bold text-sm md:text-lg break-keep">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Schedule Banner */}
        <div className="bg-[#104a96] border border-[#1d5fb5] rounded-xl p-3 md:p-4 text-[11px] md:text-sm text-blue-100 flex items-center justify-center gap-1.5 md:gap-2 text-left md:text-center leading-relaxed md:leading-normal">
          <span>🗓️</span> {scheduleText}
        </div>
      </div>
    </div>
  );
}
