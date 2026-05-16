import React from 'react';

interface ScheduleItem {
  day: string;
  date: string;
  birthYear: string;
  note: string;
  isToday?: boolean;
}

interface ScheduleTableProps {
  items: string; // JSON string
}

export function ScheduleTable({ items }: ScheduleTableProps) {
  let parsedItems: ScheduleItem[] = [];
  try {
    parsedItems = JSON.parse(items);
  } catch (e) {
    console.error('Failed to parse ScheduleTable items', e);
  }

  return (
    <div className="not-prose my-10">
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-[#f2f5f9] text-[#0a3d7e] border-b border-slate-200">
              <th className="py-4 px-6 font-bold text-center w-1/5">요일</th>
              <th className="py-4 px-6 font-bold text-center w-1/5">신청 날짜</th>
              <th className="py-4 px-6 font-bold text-center w-2/5">출생연도 끝자리</th>
              <th className="py-4 px-6 font-bold text-center w-1/5">비고</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {parsedItems.map((item, idx) => (
              <tr key={idx} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${item.isToday ? 'bg-blue-50/50' : ''}`}>
                <td className="py-4 px-6 text-center font-bold text-slate-700">{item.day}</td>
                <td className="py-4 px-6 text-center text-slate-600">{item.date}</td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">
                    {item.birthYear}
                  </span>
                </td>
                <td className="py-4 px-6 text-center text-sm text-slate-500">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs md:text-sm text-slate-600 space-y-1.5">
        <p>※ 요일제를 지키지 않아도 지원금 수령이 불가능한 것은 아니나, 서버 과부하 방지를 위한 정부 권고 사항입니다.</p>
        <p>※ 오프라인(주민센터) 신청의 요일제 운영 기간은 지역별로 다를 수 있으니 관할 주민센터에 확인하세요.</p>
      </div>
    </div>
  );
}
