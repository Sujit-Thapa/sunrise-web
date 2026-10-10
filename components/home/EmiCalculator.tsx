'use client';

import { useState } from 'react';
import { EmiSlider, EmiStepper } from '@/components/home/EmiControls';
import { calculateEmi } from '@/lib/emi';

const labelClass = 'text-sm font-bold uppercase tracking-[0.01em] text-[#73706c]';
const fieldClass = 'rounded-[11px] bg-[#f7f7f7] font-bold leading-[40px] tracking-[0.01em] text-[#2a2723] outline-none [appearance:textfield] focus-visible:ring-2 focus-visible:ring-[#cc7654] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';


export default function EmiCalculator() {
  const [amount, setAmount] = useState('12500000');
  const [rate, setRate] = useState('3.85');
  const [months, setMonths] = useState('12');
  const valid = amount.trim() !== '' && rate.trim() !== '' && months.trim() !== '' && Number(rate) <= 25 && Number(months) <= 600;
  const payment = valid ? calculateEmi(Number(amount), Number(rate), Number(months)) : null;
  const formatted = payment === null ? '—' : `Rs. ${payment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stepAmount = (direction: 1 | -1) => setAmount(String(Math.max(0, (Number(amount) || 0) + direction * 100000)));
  const stepMonths = (direction: 1 | -1) => setMonths(String(Math.min(600, Math.max(1, (Number(months) || 0) + direction))));

  return (
    <section aria-labelledby="emi-heading" className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16 xl:px-0">
      <div className="grid items-stretch overflow-hidden rounded-[40px] bg-[#e8e4db] md:grid-cols-[minmax(0,1fr)_640px] md:rounded-[65px]">
        <div className="px-7 py-12 sm:px-12 md:self-center lg:pl-[94px]">
          <p className="text-sm font-bold uppercase tracking-[0.01em] text-[#cc7654]">Precision tool</p>
          <h2 id="emi-heading" className="mt-4 text-xl font-bold tracking-[0.01em] text-[#2a2723]">Know Your EMI.<br />Plan Your Property.</h2>
          <p className="mt-5 max-w-[367px] text-lg font-light leading-[22px] text-[#2a2723]">Estimate your monthly home loan payment and understand what your property budget could look like.</p>
          <p className="mt-6 text-lg leading-[22px] text-[#2a2723]">Financial Clarity for Your Next Move.</p>
        </div>

        <div className="rounded-[41px] bg-white px-7 py-10 shadow-[8px_8px_25px_rgba(0,0,0,0.1)] sm:px-[66px] sm:pb-12 sm:pt-12">
          <h3 className="text-2xl font-bold tracking-[0.01em] text-[#2a2723]">Emi Calculator</h3>

          <label className="mt-5 block">
            <span className={labelClass}>Loan amount</span>
            <span className="mt-6 flex items-center gap-3">
              <span aria-hidden="true" className="text-[32px] font-bold tracking-[0.01em] text-[#2a2723] sm:text-[40px]">Rs.</span>
              <input type="text" inputMode="numeric" value={amount ? Number(amount).toLocaleString('en-IN') : ''} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 12))} className={`${fieldClass} h-[59px] min-w-0 flex-1 px-[27px] text-[28px] sm:max-w-[336px] sm:text-[40px]`} />
              <EmiStepper label="loan amount" onStep={stepAmount} />
            </span>
          </label>

          <div className="mt-6">
            <p className={labelClass}>Interest rate</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="w-10 shrink-0 text-lg font-semibold leading-[22px] text-[#aeb3ad]">0%</span>
              <div className="flex-1">
                <EmiSlider label="Interest rate" value={Number(rate) || 0} min={0} max={25} step={0.05} onChange={(next) => setRate(String(next))} format={(next) => `${next}%`} />
              </div>
              <span className="w-10 shrink-0 text-right text-lg font-semibold leading-[22px] text-[#aeb3ad]">25%</span>
            </div>
          </div>

          <div className="mt-8 grid items-end gap-6 sm:grid-cols-[auto_1fr] sm:gap-[121px]">
            <label className="block">
              <span className={`${labelClass} whitespace-nowrap`}>Terms(months)</span>
              <span className="mt-3 flex items-center gap-2.5">
                <input type="number" min="1" max="600" step="1" value={months} onChange={(e) => setMonths(e.target.value)} className={`${fieldClass} h-[59px] w-[86px] px-2 text-center text-[40px]`} />
                <EmiStepper label="term" onStep={stepMonths} />
              </span>
            </label>
            <div className="min-h-[111px] rounded-[11px] bg-[#f7f7f7] px-[29px] py-5">
              <p className={labelClass}>Monthly payment (EMI)</p>
              <output aria-live="polite" className="mt-4 block break-words text-[22px] font-bold leading-[24px] tracking-[0.01em] text-[#2a2723]">{formatted}</output>
            </div>
          </div>
          {payment === null && <p role="alert" className="mt-3 text-xs text-rose-700">Enter a non-negative amount, a rate from 0–25%, and a whole term from 1–600 months.</p>}
        </div>
      </div>
    </section>
  );
}
