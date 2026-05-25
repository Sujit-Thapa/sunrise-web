'use client';

import React, { useState } from 'react';

type PropertyType = 'land' | 'house';
type ListingStatus = 'available' | 'under offer';

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  type: PropertyType;
  size: string;
  seller: string;
  status: ListingStatus;
  beds?: number;
  baths?: number;
  posted: string;
}

const INITIAL_LISTINGS: Listing[] = [
  { id: '1', title: 'Corner Plot, Riverside District', location: 'Riverside, CA', price: 185000, type: 'land', size: '0.8 acres', seller: 'Marcus T.', status: 'available', posted: '2 days ago' },
  { id: '2', title: 'Colonial Home with Garden', location: 'Maplewood, NJ', price: 620000, type: 'house', size: '2,400 sq ft', seller: 'Priya S.', status: 'available', beds: 4, baths: 3, posted: '5 days ago' },
  { id: '3', title: 'Agricultural Land Parcel', location: 'Fresno, CA', price: 95000, type: 'land', size: '3.2 acres', seller: 'Elena R.', status: 'under offer', posted: '1 week ago' },
  { id: '4', title: 'Modern Townhouse, City Centre', location: 'Austin, TX', price: 480000, type: 'house', size: '1,850 sq ft', seller: 'James K.', status: 'available', beds: 3, baths: 2, posted: '3 days ago' },
  { id: '5', title: 'Hillside Building Lot', location: 'Boulder, CO', price: 310000, type: 'land', size: '1.1 acres', seller: 'Sofia M.', status: 'available', posted: '6 days ago' },
  { id: '6', title: 'Craftsman Bungalow', location: 'Portland, OR', price: 545000, type: 'house', size: '1,620 sq ft', seller: 'Daniel W.', status: 'available', beds: 3, baths: 2, posted: '4 days ago' },
];

const EMPTY_FORM = { title: '', location: '', price: '', type: 'house' as PropertyType, size: '', beds: '', baths: '', seller: '' };

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [filter, setFilter] = useState<'all' | PropertyType>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = listings.filter((l) => {
    const matchType = filter === 'all' || l.type === filter;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: Listing = {
      id: Date.now().toString(),
      title: form.title,
      location: form.location,
      price: Number(form.price),
      type: form.type,
      size: form.size,
      seller: form.seller || 'You',
      status: 'available',
      beds: form.beds ? Number(form.beds) : undefined,
      baths: form.baths ? Number(form.baths) : undefined,
      posted: 'Just now',
    };
    setListings([newListing, ...listings]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setListings(listings.filter((l) => l.id !== id));
    setDeleteId(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .mp { min-height: 100vh; background: #F7F5F0; font-family: 'DM Sans', sans-serif; font-weight: 300; color: #1A1814; }
        .mp-container { max-width: 1200px; margin: 0 auto; padding: 6rem 2.5rem 5rem; }

        /* Header */
        .mp-eyebrow { font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase; color: #8A8070; margin-bottom: 1rem; }
        .mp-headline { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.4rem, 4vw, 3.4rem); line-height: 1.08; color: #1A1814; margin: 0 0 0.9rem; letter-spacing: -0.01em; }
        .mp-headline em { font-style: italic; color: #5C5040; }
        .mp-subhead { font-size: 0.92rem; line-height: 1.8; color: #6E6455; max-width: 460px; margin-bottom: 3rem; }

        /* Toolbar */
        .mp-toolbar { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .mp-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .mp-search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #B0A890; pointer-events: none; }
        .mp-search { width: 100%; background: #fff; border: 1px solid #E0DAD0; padding: 0.75rem 1rem 0.75rem 2.6rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.88rem; color: #1A1814; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
        .mp-search:focus { border-color: #8A8070; }
        .mp-search::placeholder { color: #C0B8A8; }

        .mp-filters { display: flex; gap: 2px; }
        .mp-filter-btn { background: #fff; border: 1px solid #E0DAD0; padding: 0.7rem 1.2rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: #8A8070; cursor: pointer; transition: all 0.2s; }
        .mp-filter-btn.active { background: #1A1814; color: #F7F5F0; border-color: #1A1814; }
        .mp-filter-btn:hover:not(.active) { background: #EFECE5; }

        .mp-add-btn { background: #1A1814; color: #F7F5F0; border: none; padding: 0.75rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 0.5rem; }
        .mp-add-btn:hover { background: #3A3428; }

        /* Count */
        .mp-count { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #B0A890; margin-bottom: 1.5rem; }

        /* Grid */
        .mp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2px; }

        /* Card */
        .mp-card { background: #fff; border: 1px solid #E8E3D8; padding: 1.75rem; display: flex; flex-direction: column; gap: 0; transition: border-color 0.2s; position: relative; }
        .mp-card:hover { border-color: #C0B8A8; }

        .mp-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
        .mp-type-badge { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.3rem 0.65rem; }
        .mp-type-badge.land { background: #EAF0E8; color: #4A6040; }
        .mp-type-badge.house { background: #E8EDF5; color: #3A4E70; }
        .mp-status-badge { font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: #B0A890; }
        .mp-status-badge.under { color: #C08040; }

        .mp-card-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 1.25rem; color: #1A1814; margin: 0 0 0.3rem; line-height: 1.25; }
        .mp-card-location { font-size: 0.8rem; color: #9A9080; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.35rem; }

        .mp-card-meta { display: flex; gap: 1.5rem; margin-bottom: 1.4rem; }
        .mp-meta-item { font-size: 0.78rem; color: #7A7060; }
        .mp-meta-label { font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: #B0A890; margin-bottom: 0.15rem; }

        .mp-card-divider { height: 1px; background: #F0EBE4; margin-bottom: 1.25rem; }

        .mp-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .mp-price { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 1.5rem; color: #1A1814; letter-spacing: -0.01em; }
        .mp-seller { font-size: 0.72rem; color: #B0A890; letter-spacing: 0.04em; }
        .mp-posted { font-size: 0.68rem; color: #C0B8A8; margin-top: 0.15rem; }

        .mp-delete-btn { background: none; border: 1px solid #E8E3D8; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: #C0B8A8; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .mp-delete-btn:hover { border-color: #D4908080; color: #C06060; background: #FDF5F5; }

        /* Empty */
        .mp-empty { text-align: center; padding: 5rem 2rem; color: #B0A890; }
        .mp-empty p { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.3rem; }

        /* Modal overlay */
        .mp-overlay { position: fixed; inset: 0; background: rgba(26,24,20,0.55); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }

        /* Form modal */
        .mp-form-modal { background: #F7F5F0; width: 100%; max-width: 560px; padding: 2.5rem; max-height: 90vh; overflow-y: auto; }
        .mp-form-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 1.6rem; color: #1A1814; margin: 0 0 1.75rem; }
        .mp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .mp-form-field { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1rem; }
        .mp-form-label { font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8070; }
        .mp-form-input, .mp-form-select { background: #fff; border: 1px solid #E0DAD0; padding: 0.8rem 0.9rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.88rem; color: #1A1814; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; -webkit-appearance: none; }
        .mp-form-input:focus, .mp-form-select:focus { border-color: #8A8070; }
        .mp-form-input::placeholder { color: #C0B8A8; }
        .mp-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .mp-form-submit { flex: 1; background: #1A1814; color: #F7F5F0; border: none; padding: 0.9rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .mp-form-submit:hover { background: #3A3428; }
        .mp-form-cancel { background: none; border: 1px solid #E0DAD0; padding: 0.9rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8070; cursor: pointer; transition: all 0.2s; }
        .mp-form-cancel:hover { background: #EFECE5; }

        /* Confirm delete */
        .mp-confirm-modal { background: #F7F5F0; width: 100%; max-width: 380px; padding: 2rem; text-align: center; }
        .mp-confirm-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 400; color: #1A1814; margin-bottom: 0.75rem; }
        .mp-confirm-text { font-size: 0.85rem; color: #7A7060; line-height: 1.7; margin-bottom: 1.75rem; }
        .mp-confirm-actions { display: flex; gap: 0.75rem; }
        .mp-confirm-delete { flex: 1; background: #8B3030; color: #fff; border: none; padding: 0.85rem; font-family: 'DM Sans', sans-serif; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .mp-confirm-delete:hover { background: #6A2020; }
        .mp-confirm-cancel { flex: 1; background: none; border: 1px solid #E0DAD0; padding: 0.85rem; font-family: 'DM Sans', sans-serif; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8070; cursor: pointer; }

        @media (max-width: 600px) {
          .mp-container { padding: 4rem 1.5rem 4rem; }
          .mp-grid { grid-template-columns: 1fr; }
          .mp-form-row { grid-template-columns: 1fr; }
          .mp-toolbar { flex-direction: column; align-items: stretch; }
          .mp-add-btn { justify-content: center; }
        }
      `}</style>

      <div className="mp">
        <div className="mp-container">

          {/* Header */}
          <p className="mp-eyebrow">Sunrise Realty · Community Marketplace</p>
          <h1 className="mp-headline">Properties listed by<br /><em>the community.</em></h1>
          <p className="mp-subhead">
            Browse land and homes posted directly by sellers. List your own property, connect with buyers, and transact through our trusted platform.
          </p>

          {/* Toolbar */}
          <div className="mp-toolbar">
            <div className="mp-search-wrap">
              <svg className="mp-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="mp-search" placeholder="Search by title or location…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="mp-filters">
              {(['all', 'house', 'land'] as const).map((f) => (
                <button key={f} className={`mp-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f === 'house' ? 'Houses' : 'Land'}
                </button>
              ))}
            </div>
            <button className="mp-add-btn" onClick={() => setShowForm(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              List Property
            </button>
          </div>

          <p className="mp-count">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="mp-empty"><p>No listings match your search.</p></div>
          ) : (
            <div className="mp-grid">
              {filtered.map((l) => (
                <div className="mp-card" key={l.id}>
                  <div className="mp-card-top">
                    <span className={`mp-type-badge ${l.type}`}>{l.type}</span>
                    <span className={`mp-status-badge ${l.status === 'under offer' ? 'under' : ''}`}>
                      {l.status}
                    </span>
                  </div>

                  <h3 className="mp-card-title">{l.title}</h3>
                  <p className="mp-card-location">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {l.location}
                  </p>

                  <div className="mp-card-meta">
                    <div>
                      <p className="mp-meta-label">Size</p>
                      <p className="mp-meta-item">{l.size}</p>
                    </div>
                    {l.beds && (
                      <div>
                        <p className="mp-meta-label">Beds</p>
                        <p className="mp-meta-item">{l.beds}</p>
                      </div>
                    )}
                    {l.baths && (
                      <div>
                        <p className="mp-meta-label">Baths</p>
                        <p className="mp-meta-item">{l.baths}</p>
                      </div>
                    )}
                  </div>

                  <div className="mp-card-divider" />

                  <div className="mp-card-footer">
                    <div>
                      <p className="mp-price">${l.price.toLocaleString()}</p>
                      <p className="mp-seller">Listed by {l.seller}</p>
                      <p className="mp-posted">{l.posted}</p>
                    </div>
                    <button className="mp-delete-btn" onClick={() => setDeleteId(l.id)} aria-label="Delete listing">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Listing Modal */}
      {showForm && (
        <div className="mp-overlay" onClick={() => setShowForm(false)}>
          <div className="mp-form-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="mp-form-title">List your property</h2>
            <form onSubmit={handleAdd}>
              <div className="mp-form-field">
                <label className="mp-form-label">Property Title</label>
                <input className="mp-form-input" placeholder="e.g. Corner Plot, Riverside District" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="mp-form-row">
                <div className="mp-form-field" style={{ marginBottom: 0 }}>
                  <label className="mp-form-label">Type</label>
                  <select className="mp-form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}>
                    <option value="house">House</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="mp-form-field" style={{ marginBottom: 0 }}>
                  <label className="mp-form-label">Price (USD)</label>
                  <input className="mp-form-input" type="number" placeholder="e.g. 250000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }} />
              <div className="mp-form-row">
                <div className="mp-form-field" style={{ marginBottom: 0 }}>
                  <label className="mp-form-label">Location</label>
                  <input className="mp-form-input" placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="mp-form-field" style={{ marginBottom: 0 }}>
                  <label className="mp-form-label">Size</label>
                  <input className="mp-form-input" placeholder="e.g. 1,500 sq ft or 0.5 acres" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }} />
              {form.type === 'house' && (
                <div className="mp-form-row">
                  <div className="mp-form-field" style={{ marginBottom: 0 }}>
                    <label className="mp-form-label">Bedrooms</label>
                    <input className="mp-form-input" type="number" placeholder="e.g. 3" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
                  </div>
                  <div className="mp-form-field" style={{ marginBottom: 0 }}>
                    <label className="mp-form-label">Bathrooms</label>
                    <input className="mp-form-input" type="number" placeholder="e.g. 2" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
                  </div>
                </div>
              )}
              {form.type === 'house' && <div style={{ marginBottom: '1rem' }} />}
              <div className="mp-form-field">
                <label className="mp-form-label">Your Name</label>
                <input className="mp-form-input" placeholder="How you'll appear on the listing" value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} />
              </div>
              <div className="mp-form-actions">
                <button type="button" className="mp-form-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="mp-form-submit">Publish Listing →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="mp-overlay" onClick={() => setDeleteId(null)}>
          <div className="mp-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mp-confirm-title">Remove listing?</h3>
            <p className="mp-confirm-text">This listing will be permanently removed from the marketplace. This action cannot be undone.</p>
            <div className="mp-confirm-actions">
              <button className="mp-confirm-cancel" onClick={() => setDeleteId(null)}>Keep it</button>
              <button className="mp-confirm-delete" onClick={() => handleDelete(deleteId)}>Yes, remove</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}