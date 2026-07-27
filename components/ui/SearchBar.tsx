'use client';

import { useState, useRef, useEffect } from 'react';

const PROPERTY_TYPES = ['All Types', 'Apartment', 'House', 'Villa', 'Land', 'Commercial'];
const PRICE_RANGES = ['Any Price', 'Under Rs 50 L', 'Rs 50 L – 1 Cr', 'Rs 1 Cr – 2 Cr', 'Rs 2 Cr+'];

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-[14px] text-left bg-transparent border-none outline-none"
      >
        <p className="text-[9px] font-normal uppercase tracking-[0.2em] text-stone mb-1">{label}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-ink truncate">{value}</span>
          <svg
            width="10" height="6" viewBox="0 0 10 6" fill="none"
            className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M1 1L5 5L9 1" stroke="#777777" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      {/* Custom dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-brand-md shadow-brand-md border border-ink/10 z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={[
                'w-full px-5 py-3 text-left text-sm transition-colors duration-150',
                value === opt
                  ? 'bg-gold-primary/10 text-gold-deep font-normal'
                  : 'text-ink hover:bg-blush',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchBar() {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [priceRange, setPriceRange] = useState('Any Price');

  return (
    <div className="flex items-center w-full bg-white rounded-full shadow-brand-lg overflow-visible">

      {/* Location */}
      <div className="flex-1 px-6 py-[14px] min-w-0">
        <label className="block text-[9px] font-normal uppercase tracking-[0.2em] text-stone mb-1">
          Location
        </label>
        <input
          type="text"
          placeholder="Where are you looking?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm text-ink bg-transparent border-none outline-none placeholder:text-stone/50"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-ink/10 shrink-0" />

      {/* Property Type */}
      <Dropdown
        label="Property Type"
        options={PROPERTY_TYPES}
        value={propertyType}
        onChange={setPropertyType}
      />

      {/* Divider */}
      <div className="w-px h-10 bg-ink/10 shrink-0" />

      {/* Price Range */}
      <Dropdown
        label="Price Range"
        options={PRICE_RANGES}
        value={priceRange}
        onChange={setPriceRange}
      />

      {/* Search button */}
      <button
        type="button"
        aria-label="Search properties"
        className="w-[52px] h-[52px] m-[6px] rounded-full bg-gold-primary hover:bg-gold-deep hover:shadow-gold flex items-center justify-center shrink-0 transition-all duration-250 active:scale-95"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="17" y1="17" x2="22" y2="22" />
        </svg>
      </button>

    </div>
  );
}