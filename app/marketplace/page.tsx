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

const EMPTY_FORM = {
  title: '',
  location: '',
  price: '',
  type: 'house' as PropertyType,
  size: '',
  beds: '',
  baths: '',
  seller: '',
};

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [filter, setFilter] = useState<'all' | PropertyType>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = listings.filter((listing) => {
    const matchesType = filter === 'all' || listing.type === filter;
    const matchesSearch = listing.title.toLowerCase().includes(search.toLowerCase()) || listing.location.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
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

    setListings((prev) => [newListing, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
    setDeleteId(null);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <main className="min-h-screen bg-white text-stone-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.22em] text-stone-500">Sunrise Realty · Community Marketplace</p>
          <h1 className="mb-3 text-4xl font-light leading-tight sm:text-5xl">
            Properties listed by <span className="italic text-stone-600">the community.</span>
          </h1>
          <p className="mb-10 max-w-xl text-sm leading-7 text-stone-600">
            Browse land and homes posted directly by sellers. List your own property, connect with buyers, and transact through our trusted platform.
          </p>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or location…"
                className="w-full border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition focus:border-stone-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'house', 'land'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`border px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] transition ${filter === option ? 'border-stone-900 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-500 hover:bg-stone-100'}`}
                >
                  {option === 'all' ? 'All' : option === 'house' ? 'Houses' : 'Land'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 whitespace-nowrap border border-stone-900 bg-stone-900 px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-stone-100 transition hover:bg-stone-700"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              List Property
            </button>
          </div>

          <p className="mb-6 text-[0.72rem] uppercase tracking-[0.12em] text-stone-400">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
          </p>

          {filtered.length === 0 ? (
            <div className="rounded border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center text-stone-500">
              <p className="text-xl italic text-stone-600">No listings match your search.</p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((listing) => (
                <article key={listing.id} className="border border-stone-300 bg-white p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className={`px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em] ${listing.type === 'land' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                      {listing.type}
                    </span>
                    <span className={`text-[0.6rem] uppercase tracking-[0.14em] ${listing.status === 'under offer' ? 'text-amber-600' : 'text-stone-400'}`}>
                      {listing.status}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl text-stone-900">{listing.title}</h3>
                  <p className="mb-5 flex items-center gap-2 text-sm text-stone-500">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {listing.location}
                  </p>

                  <div className="mb-5 flex flex-wrap gap-5">
                    <div>
                      <p className="mb-1 text-[0.6rem] uppercase tracking-[0.14em] text-stone-400">Size</p>
                      <p className="text-sm text-stone-700">{listing.size}</p>
                    </div>
                    {listing.beds ? (
                      <div>
                        <p className="mb-1 text-[0.6rem] uppercase tracking-[0.14em] text-stone-400">Beds</p>
                        <p className="text-sm text-stone-700">{listing.beds}</p>
                      </div>
                    ) : null}
                    {listing.baths ? (
                      <div>
                        <p className="mb-1 text-[0.6rem] uppercase tracking-[0.14em] text-stone-400">Baths</p>
                        <p className="text-sm text-stone-700">{listing.baths}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-5 h-px bg-stone-200" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-light text-stone-900">${listing.price.toLocaleString()}</p>
                      <p className="mt-1 text-[0.72rem] text-stone-400">Listed by {listing.seller}</p>
                      <p className="text-[0.68rem] text-stone-400">{listing.posted}</p>
                    </div>
                    <button
                      onClick={() => setDeleteId(listing.id)}
                      aria-label="Delete listing"
                      className="flex h-8 w-8 items-center justify-center border border-stone-300 text-stone-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 py-6" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-stone-300 bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-2xl font-light text-stone-900">List your property</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Property Title</label>
                <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. Corner Plot, Riverside District" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Type</label>
                  <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as PropertyType }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500">
                    <option value="house">House</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Price (USD)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. 250000" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Location</label>
                  <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="City, State" />
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Size</label>
                  <input value={form.size} onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. 1,500 sq ft or 0.5 acres" />
                </div>
              </div>

              {form.type === 'house' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Bedrooms</label>
                    <input type="number" value={form.beds} onChange={(e) => setForm((prev) => ({ ...prev, beds: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. 3" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Bathrooms</label>
                    <input type="number" value={form.baths} onChange={(e) => setForm((prev) => ({ ...prev, baths: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. 2" />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Your Name</label>
                <input value={form.seller} onChange={(e) => setForm((prev) => ({ ...prev, seller: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="How you'll appear on the listing" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-300 bg-transparent px-4 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100">Cancel</button>
                <button type="submit" className="flex-1 border border-stone-900 bg-stone-900 px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-stone-100 transition hover:bg-stone-700">Publish Listing →</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm border border-stone-300 bg-white p-7 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-2xl font-light text-stone-900">Remove listing?</h3>
            <p className="mb-6 text-sm leading-7 text-stone-600">This listing will be permanently removed from the marketplace. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-stone-300 bg-transparent px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-stone-600 transition hover:bg-stone-100">Keep it</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-rose-700 px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-white transition hover:bg-rose-800">Yes, remove</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
