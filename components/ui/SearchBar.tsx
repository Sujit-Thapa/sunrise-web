'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PROPERTY_TYPES = ['All Types', 'Apartment', 'House', 'Land', 'Commercial'];
const PRICE_RANGES = ['Any Price', 'Under Rs 50 L', 'Rs 50 L – 1 Cr', 'Rs 1 Cr – 2 Cr', 'Rs 2 Cr+'];

function buildSearchUrl(location: string, propertyType: string, priceRange: string): string {
  const params = new URLSearchParams();

  if (location.trim()) {
    params.set('city', location.trim());
  }

  if (propertyType !== 'All Types') {
    params.set('category', propertyType.toUpperCase());
  }

  if (priceRange === 'Under Rs 50 L') {
    params.set('maxPrice', '5000000');
  } else if (priceRange === 'Rs 50 L – 1 Cr') {
    params.set('minPrice', '5000000');
    params.set('maxPrice', '10000000');
  } else if (priceRange === 'Rs 1 Cr – 2 Cr') {
    params.set('minPrice', '10000000');
    params.set('maxPrice', '20000000');
  } else if (priceRange === 'Rs 2 Cr+') {
    params.set('minPrice', '20000000');
  }

  const query = params.toString();
  return query ? `/properties?${query}` : '/properties';
}

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [priceRange, setPriceRange] = useState('Any Price');

  const handleSearch = () => {
    router.push(buildSearchUrl(location, propertyType, priceRange));
  };

  return (
    <form
      role="search"
      aria-label="Find a property"
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
      className="grid w-full grid-cols-1 items-center rounded-[26px] bg-white p-3 text-left shadow-[0_8px_32px_rgba(34,47,34,0.06)] sm:min-h-[102px] sm:grid-cols-[1fr_1fr_1fr_auto] sm:rounded-[30px] sm:py-4 sm:pl-0 sm:pr-9"
    >
      <label className="min-w-0 border-b border-stone-200 px-4 py-3 sm:border-b-0 sm:border-r sm:px-[23px]">
        <span className="mb-1.5 block text-xs font-semibold uppercase text-[#73706c]">Location</span>
        <input
          type="search"
          placeholder="City or location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="w-full min-w-0 border-none bg-transparent text-base font-medium text-[#2a2723] outline-none placeholder:text-[#73706c] focus-visible:ring-2 focus-visible:ring-[#cc7654]/50"
        />
      </label>
      <label className="min-w-0 border-b border-stone-200 px-4 py-3 sm:border-b-0 sm:border-r sm:px-[23px]">
        <span className="mb-1.5 block text-xs font-semibold uppercase text-[#73706c]">Property type</span>
        <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}
          className="w-full min-w-0 cursor-pointer bg-transparent text-base font-medium text-[#2a2723] outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]/50">
          {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <label className="min-w-0 px-4 py-3 sm:border-r sm:border-stone-200 sm:px-[23px]">
        <span className="mb-1.5 block text-xs font-semibold uppercase text-[#73706c]">Price range</span>
        <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}
          className="w-full min-w-0 cursor-pointer bg-transparent text-base font-medium text-[#2a2723] outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]/50">
          {PRICE_RANGES.map((range) => <option key={range} value={range}>{range}</option>)}
        </select>
      </label>
      <button type="submit" className="flex h-[69px] items-center justify-center gap-2 rounded-[33px] bg-[#3e4a3d] px-8 text-base font-semibold tracking-[0.01em] sm:w-[162px] text-white transition hover:bg-[#303c2f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3e4a3d] sm:ml-6">
        <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" />
        </svg>
        Search
      </button>
    </form>
  );
}
