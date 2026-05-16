import React from 'react';

interface StepItem {
  step: number;
  title: string;
  desc: string;
}

interface StepGuideProps {
  items: string; // JSON string
}

export function StepGuide({ items }: StepGuideProps) {
  let parsedItems: StepItem[] = [];
  try {
    parsedItems = JSON.parse(items);
  } catch (e) {
    console.error('Failed to parse StepGuide items', e);
  }

  return (
    <div className="not-prose my-12 bg-white border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 text-center">온라인 신청 방법 (4단계)</h2>
      
      <div className="relative border-l-2 border-blue-200 ml-4 md:ml-6 space-y-8 pb-4">
        {parsedItems.map((item, idx) => (
          <div key={idx} className="relative pl-8 md:pl-10">
            {/* Circle Indicator */}
            <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md ring-4 ring-white">
              {item.step}
            </div>
            
            {/* Content */}
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed break-keep">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
