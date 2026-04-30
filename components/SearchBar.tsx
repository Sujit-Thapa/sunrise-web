'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [location, setLocation] = useState('');

  return (
    <div className="search-bar-wrap">
      {/* Location */}
      <div className="search-field">
        <label className="search-field-label">Location</label>
        <input
          type="text"
          placeholder="Where are you looking?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="search-field-input"
        />
      </div>

      <div className="search-divider" />

      {/* Property Type */}
      <div className="search-field">
        <label className="search-field-label">Property Type</label>
        <select className="search-field-input search-field-select">
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <div className="search-divider" />

      {/* Price Range */}
      <div className="search-field">
        <label className="search-field-label">Price Range</label>
        <select className="search-field-input search-field-select">
          <option value="">Any Price</option>
          <option value="0-5000000">Under Rs 50 L</option>
          <option value="5000000-10000000">Rs 50 L – 1 Cr</option>
          <option value="10000000-20000000">Rs 1 Cr – 2 Cr</option>
          <option value="20000000+">Rs 2 Cr+</option>
        </select>
      </div>

      {/* Search button */}
      <button className="search-btn" aria-label="Search properties">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="17" y1="17" x2="22" y2="22" />
        </svg>
      </button>
    </div>
  );
}