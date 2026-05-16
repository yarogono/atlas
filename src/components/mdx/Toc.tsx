import React from 'react';

interface TocProps {
  items: string; // stringified JSON array
}

export function Toc({ items }: TocProps) {
  let parsedItems = [];
  try {
    parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
  } catch (e) {
    console.error('Failed to parse TOC items', e);
  }

  if (!parsedItems || parsedItems.length === 0) return null;

  return (
    <div className="not-prose my-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
        <span>📑</span> 이 글의 목차
      </h3>
      <ul className="space-y-3">
        {parsedItems.map((item: any, index: number) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 font-bold mr-3 mt-0.5">{index + 1}.</span>
            <a 
              href={item.url}
              className="text-slate-600 hover:text-blue-700 font-medium hover:underline underline-offset-4 transition-colors leading-snug break-keep"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
