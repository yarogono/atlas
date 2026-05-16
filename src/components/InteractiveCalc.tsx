'use client';

import React, { useState } from 'react';

interface Props {
  initialPrincipal?: number | string;
  initialRate?: number | string;
  initialYears?: number | string;
}

export const InteractiveCalc = ({ 
  initialPrincipal = 1000, 
  initialRate = 5, 
  initialYears = 10 
}: Props) => {
  const [principal, setPrincipal] = useState(Number(initialPrincipal));
  const [rate, setRate] = useState(Number(initialRate));
  const [years, setYears] = useState(Number(initialYears));

  const finalAmount = (principal * Math.pow(1 + rate / 100, years)).toFixed(2);

  return (
    <div className="p-6 my-8 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-xl font-semibold mb-4 mt-0">Compound Growth Calculator</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Principal ($)</label>
          <input 
            type="number" 
            value={principal} 
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rate (%)</label>
          <input 
            type="number" 
            value={rate} 
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Years</label>
          <input 
            type="number" 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
        <p className="text-sm mb-1 text-blue-600 dark:text-blue-400">Future Value</p>
        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">${finalAmount}</p>
      </div>
    </div>
  );
};
