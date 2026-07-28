'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth';
import { userPropertiesApi } from '@/lib/backend';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getPropertyCategoryLabel,
  getListingTypeLabel,
  getPrimaryImage,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type {
  AreaUnit,
  CreateUserPropertyDto,
  ListingType,
  UserPropertyResponseDto,
} from '@/types';

type CategoryFilter = 'all' | 'house' | 'land' | 'apartment' | 'commercial';
type SortOption = 'newest' | 'price-asc' | 'price-desc';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  listingType: 'SALE' as ListingType,
  category: 'HOUSE' as Exclude<CategoryFilter, 'all'>,
  city: '',
  state: '',
  country: '',
  areaSize: '',
  areaUnit: 'sqft' as AreaUnit,
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const categoryFilters: CategoryFilter[] = ['all', 'house', 'land', 'apartment', 'commercial'];

function locationLabel(item: UserPropertyResponseDto): string {
  return formatLocation(item);
}

function sizeLabel(item: UserPropertyResponseDto): string {
  return formatArea(item.areaSize, item.areaUnit);
}

export default function Marketplace() {
  const [listings, setListings] = useState<UserPropertyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await userPropertiesApi.findAll({ page: 1, limit: 50 });
      setListings(res.items);
    } catch (err) {
      setLoadError((err as Error).message || 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filtered = (listings ?? [])
    .filter((listing) => {
      const matchesType = filter === 'all' || listing.category?.toLowerCase() === filter;
      const haystack = `${listing.title ?? ''} ${locationLabel(listing)}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSubmitting(true);

    const token = getAuthToken();

    const payload: CreateUserPropertyDto = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      listingType: form.listingType,
      category: form.category,
      city: form.city,
      state: form.state,
      country: form.country,
      areaSize: form.areaSize ? Number(form.areaSize) : undefined,
      areaUnit: form.areaSize ? form.areaUnit : undefined,
    };

    try {
      if (!token) {
        throw new Error('You must be signed in to submit a property.');
      }
      const created = await userPropertiesApi.submit(payload, token);
      setListings((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setApiError((err as Error).message || 'Unable to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('You must be signed in to remove a listing.');
      await userPropertiesApi.remove(id, token);
      setListings((prev) => prev.filter((listing) => listing.id !== id));
    } catch (err) {
      setLoadError((err as Error).message || 'Unable to remove listing.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-white text-stone-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-stone-200 bg-white/85 px-6 py-8 shadow-brand-sm backdrop-blur sm:px-8">
            <p className="mb-3 text-[0.68rem] uppercase tracking-[0.24em] text-gold-primary">
              Sunrise Realestate · Community Marketplace
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Properties listed by <span className="text-slate-500">the community.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Browse land and homes posted directly by sellers. List your own property, connect
              with buyers, and keep the marketplace moving in one place.
            </p>
          </div>

          {/* Sticky filter bar */}
          <div className="sticky top-0 z-30 my-6 rounded-[28px] border border-stone-200 bg-white/95 px-4 py-4 shadow-brand-sm backdrop-blur sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or location…"
                  className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`rounded-full border px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] transition ${filter === option ? 'border-midnight bg-midnight text-white' : 'border-stone-200 bg-white text-slate-500 hover:border-gold-primary hover:text-gold-primary'}`}
                  >
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-full border border-stone-200 bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.1em] text-slate-600 outline-none transition focus:border-gold-primary"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-midnight bg-midnight px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-stone-100 transition hover:bg-slate-800"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                List Property
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-stone-200 bg-white px-8 py-16 text-center shadow-brand-sm">
              <p className="text-sm text-slate-500">Loading listings…</p>
            </div>
          ) : loadError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</p>
          ) : (
            <>
              <p className="mb-6 text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
              </p>

              {filtered.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center text-slate-500 shadow-brand-sm">
                  <p className="text-xl font-medium text-slate-700">No listings match your search.</p>
                  <p className="mt-2 text-sm">Try a different location or category to widen the search.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((listing) => (
                    <article
                      key={listing.id}
                      onMouseEnter={() => setHoveredId(listing.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-brand-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-brand-md ${hoveredId === listing.id ? 'border-gold-primary/40' : ''}`}
                    >
                      <div className="relative aspect-[4/3] bg-slate-100">
                        {getPrimaryImage(listing.images)?.url ? (
                          <Image
                            src={getPrimaryImage(listing.images)!.url}
                            alt={listing.title || 'Property'}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(184,155,78,0.12),rgba(15,23,42,0.05))] text-sm font-medium text-slate-500">
                            No image yet
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight/35 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${String(listing.category).toLowerCase() === 'land' ? 'bg-emerald-50 text-emerald-700' : 'bg-white/90 text-midnight'} backdrop-blur`}>
                            {getPropertyCategoryLabel(listing.category)}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${listing.status === 'pending' ? 'bg-amber-50 text-amber-700' : listing.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-white/90 text-slate-500'} backdrop-blur`}>
                            {getPropertyStatusLabel(listing.status)}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xl font-semibold text-midnight">{listing.title}</h3>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {locationLabel(listing) || 'Location not specified'}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                            {sizeLabel(listing)}
                          </span>
                          <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                            {getListingTypeLabel(listing.listingType)}
                          </span>
                        </div>

                        <div className="mt-6 flex items-end justify-between gap-4 border-t border-stone-100 pt-5">
                          <div>
                            <p className="text-2xl font-semibold text-midnight">{formatCurrency(listing.price)}</p>
                            <p className="mt-1 text-[0.72rem] text-slate-400">Listed by {listing.submittedBy.fullName}</p>
                            <p className="text-[0.68rem] text-slate-400">{new Date(listing.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => setDeleteId(listing.id)}
                            aria-label="Delete listing"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
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
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 py-6" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-stone-300 bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-2xl font-light text-stone-900">List your property</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              {apiError ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {apiError}
                </p>
              ) : null}
              <div>
                <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Property Title</label>
                <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. Corner Plot, Riverside District" />
              </div>

              <div>
                <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500 min-h-[80px] resize-none" placeholder="Describe the property…" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Category</label>
                  <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as typeof prev.category }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500">
                    <option value="HOUSE">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Listing Type</label>
                  <select value={form.listingType} onChange={(e) => setForm((prev) => ({ ...prev, listingType: e.target.value as ListingType }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500">
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Price (NPR)</label>
                <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. 25000000" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">City</label>
                  <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="Kathmandu" />
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">State/Province</label>
                  <input value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="Bagmati" />
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Country</label>
                  <input value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} required className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="Nepal" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Area Size</label>
                  <input type="number" value={form.areaSize} onChange={(e) => setForm((prev) => ({ ...prev, areaSize: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="e.g. 1500" />
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Area Unit</label>
                  <select value={form.areaUnit} onChange={(e) => setForm((prev) => ({ ...prev, areaUnit: e.target.value as AreaUnit }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500">
                    <option value="sqft">sq ft</option>
                    <option value="sqm">sq m</option>
                    <option value="aana">Aana</option>
                    <option value="ropani">Ropani</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-stone-300 bg-transparent px-4 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 border border-stone-900 bg-stone-900 px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-stone-100 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Publish Listing →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4" onClick={() => !deleting && setDeleteId(null)}>
          <div className="w-full max-w-sm border border-stone-300 bg-white p-7 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-2xl font-light text-stone-900">Remove listing?</h3>
            <p className="mb-6 text-sm leading-7 text-stone-600">This listing will be permanently removed from the marketplace. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button disabled={deleting} onClick={() => setDeleteId(null)} className="flex-1 border border-stone-300 bg-transparent px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-stone-600 transition hover:bg-stone-100 disabled:opacity-60">Keep it</button>
              <button disabled={deleting} onClick={() => handleDelete(deleteId)} className="flex-1 bg-rose-700 px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] text-white transition hover:bg-rose-800 disabled:opacity-60">
                {deleting ? 'Removing…' : 'Yes, remove'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
