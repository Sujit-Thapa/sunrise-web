'use client';

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Custom range control for the EMI calculator: orange fill, round handle, value bubble.
export function EmiSlider({ value, min, max, step, onChange, label, format }: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  format: (value: number) => string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const clamped = Math.min(Math.max(value, min), max);
  const percent = ((clamped - min) / (max - min)) * 100;
  const decimals = (String(step).split('.')[1] ?? '').length;

  const snap = (raw: number) => Number((Math.round((Math.min(Math.max(raw, min), max) - min) / step) * step + min).toFixed(decimals));
  const valueAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return clamped;
    return snap(min + ((clientX - rect.left) / rect.width) * (max - min));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    onChange(valueAt(event.clientX));
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) onChange(valueAt(event.clientX));
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const big = (max - min) / 10;
    const next = {
      ArrowRight: clamped + step, ArrowUp: clamped + step,
      ArrowLeft: clamped - step, ArrowDown: clamped - step,
      PageUp: clamped + big, PageDown: clamped - big,
      Home: min, End: max,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(snap(next));
  };

  return (
    <div className="relative pt-7">
      <span aria-hidden="true" className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2a2723] px-2 py-0.5 text-xs font-semibold text-white" style={{ left: `${percent}%` }}>{format(clamped)}</span>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={format(clamped)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        className="group relative flex h-7 cursor-pointer touch-none items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654] focus-visible:ring-offset-4"
      >
        <span aria-hidden="true" className="absolute inset-x-0 h-[6px] rounded-full bg-[#efece7]" />
        <span aria-hidden="true" className="absolute left-0 h-[6px] rounded-full bg-[#cc7654]" style={{ width: `${percent}%` }} />
        <span aria-hidden="true" className="absolute size-[22px] -translate-x-1/2 rounded-full border-[3px] border-[#cc7654] bg-white shadow-[0_2px_6px_rgba(42,39,35,0.2)] transition-transform group-active:scale-110" style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
}

// Up/down buttons for a numeric field. Holding a button keeps stepping until released.
export function EmiStepper({ label, onStep }: { label: string; onStep: (direction: 1 | -1) => void }) {
  const timer = useRef<number | null>(null);
  const onStepRef = useRef(onStep);
  useEffect(() => { onStepRef.current = onStep; }, [onStep]);
  const stop = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const start = (direction: 1 | -1) => {
    onStepRef.current(direction);
    let delay = 380;
    const repeat = () => {
      onStepRef.current(direction);
      delay = Math.max(60, delay * 0.8);
      timer.current = window.setTimeout(repeat, delay);
    };
    timer.current = window.setTimeout(repeat, delay);
  };

  const button = (direction: 1 | -1) => (
    <button
      type="button"
      aria-label={`${direction === 1 ? 'Increase' : 'Decrease'} ${label}`}
      onPointerDown={(event) => { if (event.button === 0) start(direction); }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onStepRef.current(direction); } }}
      className="grid h-[27px] w-7 place-items-center rounded-lg bg-[#f4f1ec] text-[#6b665f] transition hover:bg-[#ebe6de] hover:text-[#2a2723] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#cc7654]"
    >
      {direction === 1 ? <ChevronUp aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} /> : <ChevronDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />}
    </button>
  );

  return <div className="flex shrink-0 flex-col gap-[5px]">{button(1)}{button(-1)}</div>;
}
