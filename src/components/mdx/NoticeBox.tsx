import React from 'react';

interface NoticeBoxProps {
  type: 'warning' | 'alert';
  title: string;
  items: string; // JSON string array
}

export function NoticeBox({ type, title, items }: NoticeBoxProps) {
  let parsedItems: string[] = [];
  try {
    parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
  } catch (e) {
    console.error('Failed to parse NoticeBox items', e);
  }

  const isAlert = type === 'alert';
  
  const bgClass = isAlert ? 'bg-red-50' : 'bg-[#fff8e6]';
  const borderClass = isAlert ? 'border-red-200' : 'border-orange-200';
  const textClass = isAlert ? 'text-red-900' : 'text-orange-900';
  const icon = isAlert ? '🚨' : '⚠';

  return (
    <div className={`not-prose my-8 ${bgClass} border ${borderClass} rounded-2xl p-6 md:p-8`}>
      <h3 className={`text-lg md:text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
        <span className="text-xl md:text-2xl">{icon}</span> {title}
      </h3>
      <ul className="space-y-3">
        {parsedItems.map((item, idx) => {
          // simple markdown bold parsing for **text**
          const parts = item.split(/\*\*(.*?)\*\*/g);
          return (
            <li key={idx} className="flex items-start">
              <span className={`mr-2 mt-0.5 font-bold ${isAlert ? 'text-red-500' : 'text-orange-500'}`}>•</span>
              <span className={`text-sm md:text-base leading-relaxed ${isAlert ? 'text-red-800' : 'text-orange-800'} break-keep`}>
                {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
