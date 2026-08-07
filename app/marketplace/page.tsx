'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
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
  PropertyCategory,
  UserPropertyResponseDto,
  UserPropertyStatus,
} from '@/types';

type CategoryFilter = 'all' | 'house' | 'land' | 'apartment' | 'commercial';
type SortOption = 'newest' | 'price-asc' | 'price-desc';

interface MarketplaceFormState {
  title: string;
  description: string;
  price: string;
  listingType: ListingType;
  category: PropertyCategory;
  city: string;
  state: string;
  country: string;
  areaSize: string;
  areaUnit: AreaUnit;
  street: string;
  postalCode: string;
  latitude: string;
  longitude: string;
}

const EMPTY_FORM: MarketplaceFormState = {
  title: '',
  description: '',
  price: '',
  listingType: 'SALE' as ListingType,
  category: 'HOUSE',
  city: '',
  state: '',
  country: '',
  areaSize: '',
  areaUnit: 'sqft' as AreaUnit,
  street: '',
  postalCode: '',
  latitude: '',
  longitude: '',
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

function isPublicApproved(status: UserPropertyStatus): boolean {
  return status === 'APPROVED';
}

function statusTone(status: UserPropertyStatus): string {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700';
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700';
  if (status === 'HIDDEN') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-50 text-amber-700';
}

export default function Marketplace() {
  const { user } = useAuthSession();
  const [publicListings, setPublicListings] = useState<UserPropertyResponseDto[]>([]);
  const [myListings, setMyListings] = useState<UserPropertyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      setPublicListings((res.items ?? []).filter((listing) => isPublicApproved(listing.status)));
    } catch (err) {
      setLoadError((err as Error).message || 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMine = async () => {
    const token = getAuthToken();
    if (!token) {
      setMyListings([]);
      return;
    }

    try {
      const res = await userPropertiesApi.findMine(token, { page: 1, limit: 50 });
      setMyListings(res.items ?? []);
    } catch (err) {
      setApiError((err as Error).message || 'Unable to load your submissions.');
    }
  };

  useEffect(() => {
    void fetchListings();
    void fetchMine();
  }, []);

  const filteredPublic = (publicListings ?? [])
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
      street: form.street?.trim() || undefined,
      city: form.city,
      state: form.state,
      country: form.country,
      postalCode: form.postalCode?.trim() || undefined,
      areaSize: form.areaSize ? Number(form.areaSize) : undefined,
      areaUnit: form.areaSize ? form.areaUnit : undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
    };

    try {
      if (!token) {
        throw new Error('You must be signed in to submit a property.');
      }
      if (editingId) {
        const updated = await userPropertiesApi.update(editingId, payload, token);
        setMyListings((prev) => [updated, ...prev.filter((listing) => listing.id !== updated.id)]);
        setEditingId(null);
      } else {
        const created = await userPropertiesApi.submit(payload, token);
        setMyListings((prev) => [created, ...prev]);
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchListings();
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
      setMyListings((prev) => prev.filter((listing) => listing.id !== id));
    } catch (err) {
      setLoadError((err as Error).message || 'Unable to remove listing.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleHide = async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('You must be signed in to hide a listing.');
      const updated = await userPropertiesApi.hide(id, token);
      setMyListings((prev) => [updated, ...prev.filter((listing) => listing.id !== updated.id)]);
      await fetchListings();
    } catch (err) {
      setApiError((err as Error).message || 'Unable to hide listing.');
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
              Browse approved community listings, submit your own property for review, and manage
              your submissions from one place.
            </p>
            <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-slate-600">
              New submissions are sent to the admin review queue. Approved listings appear here,
              while your personal submissions stay in <a href="#my-submissions" className="font-semibold text-gold-primary underline-offset-4 hover:underline">My submissions</a>.
            </div>
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
              {filteredPublic.length} listing{filteredPublic.length !== 1 ? 's' : ''} found
              </p>

              {filteredPublic.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center text-slate-500 shadow-brand-sm">
                  <p className="text-xl font-medium text-slate-700">No listings match your search.</p>
                  <p className="mt-2 text-sm">Try a different location or category to widen the search.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPublic.map((listing) => {
                    const isMine = user?.id ? listing.submittedBy.id === user.id : false;

                    return (
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
                          <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${statusTone(listing.status)} backdrop-blur`}>
                            {getPropertyStatusLabel(listing.status)}
                          </span>
                          {isMine ? (
                            <span className="rounded-full bg-midnight/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                              Your listing
                            </span>
                          ) : null}
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
                          {isMine ? (
                            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Manage in My submissions
                            </span>
                          ) : (
                            <a
                              href="#my-submissions"
                              className="rounded-full border border-stone-200 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:border-gold-primary hover:text-gold-primary"
                            >
                              View mine
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}

              <div id="my-submissions" className="mt-12">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-primary">
                      My submissions
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-midnight">Your user properties</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(EMPTY_FORM);
                      setShowForm(true);
                    }}
                    className="rounded-full border border-midnight px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-midnight transition hover:bg-midnight hover:text-white"
                  >
                    Add new
                  </button>
                </div>

                {myListings.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-8 py-12 text-center text-slate-500 shadow-brand-sm">
                    <p className="text-lg font-medium text-slate-700">No submissions yet.</p>
                    <p className="mt-2 text-sm">Use the form above to submit a property for review.</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {myListings.map((listing) => (
                      <article
                        key={listing.id}
                        className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-brand-sm"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${statusTone(listing.status)}`}>
                                {getPropertyStatusLabel(listing.status)}
                              </p>
                              <h3 className="mt-3 text-xl font-semibold text-midnight">{listing.title}</h3>
                            </div>
                            <span className="text-lg font-semibold text-gold-primary">{formatCurrency(listing.price)}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">{locationLabel(listing) || 'Location not specified'}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">{getListingTypeLabel(listing.listingType)}</span>
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">{sizeLabel(listing)}</span>
                          </div>
                          <div className="mt-6 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(listing.id);
                                setForm({
                                  title: listing.title ?? '',
                                  description: listing.description ?? '',
                                  price: String(listing.price ?? ''),
                                  listingType: listing.listingType,
                                  category: listing.category as PropertyCategory,
                                  city: listing.city ?? '',
                                  state: listing.state ?? '',
                                  country: listing.country ?? '',
                                  areaSize: listing.areaSize != null ? String(listing.areaSize) : '',
                                  areaUnit: listing.areaUnit ?? 'sqft',
                                  street: listing.street ?? '',
                                  postalCode: listing.postalCode ?? '',
                                  latitude: listing.latitude != null ? String(listing.latitude) : '',
                                  longitude: listing.longitude != null ? String(listing.longitude) : '',
                                });
                                setShowForm(true);
                              }}
                              className="flex-1 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                            >
                              Edit
                            </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(listing.id)}
                            className="flex-1 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHide(listing.id)}
                            className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                          >
                            Hide
                          </button>
                        </div>
                      </div>
                    </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 py-6" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-stone-300 bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-2xl font-light text-stone-900">
              {editingId ? 'Edit your property' : 'List your property'}
            </h2>
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
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Street</label>
                  <input value={form.street} onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="Boudha Road" />
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Postal code</label>
                  <input value={form.postalCode} onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="44600" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="27.7172" />
                </div>
                <div>
                  <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))} className="w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500" placeholder="85.324" />
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
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 border border-stone-300 bg-transparent px-4 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 border border-stone-900 bg-stone-900 px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-stone-100 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Submitting…' : editingId ? 'Update Listing →' : 'Publish Listing →'}
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
