'use client';

import { useState } from 'react';
import { calculateEmi } from '@/lib/emi';

export default function EmiCalculator() {
  const [amount, setAmount] = useState('12500000');
  const [rate, setRate] = useState('3.85');
  const [months, setMonths] = useState('12');
  const valid = amount.trim() !== '' && rate.trim() !== '' && months.trim() !== '' && Number(rate) <= 25 && Number(months) <= 600;
  const payment = valid ? calculateEmi(Number(amount), Number(rate), Number(months)) : null;
  const formatted = payment === null ? '—' : `Rs. ${payment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <section aria-labelledby="emi-heading" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid items-center overflow-hidden rounded-[36px] bg-[#e9e6dd] md:grid-cols-2 md:rounded-[48px]">
        <div className="px-7 py-10 sm:p-12 lg:p-16">
          <p className="mb-3 text-xs uppercase text-[#ca7653]">Precision tool</p>
          <h2 id="emi-heading" className="text-2xl font-bold leading-tight text-[#2c2925]">Know Your EMI.<br />Plan Your Property.</h2>
          <p className="mt-5 max-w-xs text-sm leading-6 text-stone-600">Estimate your monthly home loan payment and understand what your property budget could look like.</p>
          <p className="mt-4 text-sm text-stone-700">Financial clarity for your next move.</p>
        </div>
        <div className="rounded-[32px] bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:p-10 lg:p-12">
          <h3 className="text-2xl font-bold text-[#2c2925]">EMI Calculator</h3>
          <label className="mt-6 block">
            <span className="text-xs uppercase text-stone-500">Loan amount (Rs.)</span>
            <span className="mt-3 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <span aria-hidden="true">Rs.</span>
              <input type="number" min="0" step="1000" value={amount} onChange={(e) => setAmount(e.target.value)} className="min-w-0 w-full rounded-xl bg-stone-50 px-3 py-2 text-[#3E4A3D] outline-none focus-visible:ring-2 focus-visible:ring-[#ca7653]" />
            </span>
          </label>
          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="emi-rate" className="text-xs uppercase text-stone-500">Annual interest rate</label>
              <label className="flex items-center gap-1 text-sm">
                <span className="sr-only">Annual interest rate percentage</span>
                <input type="number" min="0" max="25" step="0.05" value={rate} onChange={(e) => setRate(e.target.value)} className="w-20 rounded-lg bg-stone-50 px-2 py-1 text-right outline-none focus-visible:ring-2 focus-visible:ring-[#ca7653]" />%
              </label>
            </div>
            <input id="emi-rate" type="range" min="0" max="25" step="0.05" value={Number(rate) || 0} onChange={(e) => setRate(e.target.value)} className="mt-4 w-full cursor-pointer accent-[#3E4A3D]" />
            <div className="flex justify-between text-xs text-stone-400"><span>0%</span><span>25%</span></div>
          </div>
          <div className="mt-6 grid grid-cols-[100px_1fr] items-center gap-4">
            <label>
              <span className="text-xs uppercase text-stone-500">Term (months)</span>
              <input type="number" min="1" max="600" step="1" value={months} onChange={(e) => setMonths(e.target.value)} className="mt-2 w-full rounded-lg bg-stone-50 px-2 py-1 text-3xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-[#ca7653]" />
            </label>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs uppercase text-stone-500">Monthly payment (EMI)</p>
              <output aria-live="polite" className="mt-2 block break-words text-base font-bold text-[#2c2925]">{formatted}</output>
            </div>
          </div>
          {payment === null && <p role="alert" className="mt-3 text-xs text-rose-700">Enter a non-negative amount, a rate from 0–25%, and a whole term from 1–600 months.</p>}
          <p className="mt-5 text-xs leading-5 text-stone-400">Illustrative estimate. Rates are editable; lender fees and other charges are not included.</p>
        </div>
      </div>
    </section>
  );
}
