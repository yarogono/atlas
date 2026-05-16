import React from 'react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: string;
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  let parsedItems = [];
  try {
    parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
  } catch (e) {
    console.error('Failed to parse FAQ items', e);
  }

  return (
    <div className="not-prose my-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span>💡</span> 자주 묻는 질문 (FAQ)
      </h2>
      <div className="space-y-4">
        {parsedItems.map((item: any, index: number) => (
          <details 
            key={index} 
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="text-blue-600 font-black">Q.</span>
                {item.q}
              </span>
              <span className="transition duration-300 group-open:-rotate-180 text-slate-400">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="p-5 pt-0 text-slate-600 border-t border-slate-100 bg-slate-50/50 mt-2 leading-relaxed">
              <span className="text-blue-600 font-black mr-2">A.</span>
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
