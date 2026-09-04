'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  RiAddLine,
  RiCalendarCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiArrowRightLine,
  RiEditLine,
  RiFilter3Line,
  RiMapPinLine,
  RiSearchLine,
  RiSparklingLine,
  RiEyeLine,
  RiEyeOffLine,
} from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getAuthToken } from '@/lib/auth';
import { userPropertiesApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getPropertyCategoryLabel,
  getListingTypeLabel,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type { AreaUnit, CreateUserPropertyDto, ListingType, PropertyCategory, UserPropertyResponseDto, UserPropertyStatus } from '@/types';

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

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: cubicBezier(0.22, 1, 0.36, 1) },
};

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

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-midnight">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
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

  const handleAdd = async (e: FormEvent) => {
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
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(184,155,78,0.1),transparent_30%),linear-gradient(180deg,#fcfbf7_0%,#f5f1e8_100%)] text-stone-900">
        <div className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-gold-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-56 h-80 w-80 rounded-full bg-midnight/6 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <motion.section
            {...fadeUp}
            className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-primary">
                <RiSparklingLine className="h-4 w-4" />
                Sunrise Realestate · Community Marketplace
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-midnight sm:text-5xl">
                Properties listed by the community.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Browse approved community listings, submit your own property for review, and manage
                your submissions from one place.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoChip label="Approved listings" value={filteredPublic.length.toString()} />
              <InfoChip label="Your submissions" value={myListings.length.toString()} />
              <InfoChip label="Workflow" value="Review to publish" />
            </div>

            <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
              New submissions are sent to the admin review queue. Approved listings appear here,
              while your personal submissions stay in{' '}
              <a href="#my-submissions" className="font-semibold text-gold-primary underline-offset-4 hover:underline">
                My submissions
              </a>
              .
            </div>
          </motion.section>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, ease: cubicBezier(0.22, 1, 0.36, 1), delay: 0.05 }}
            className="sticky top-4 z-30 my-6 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <RiSearchLine className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or location…"
                  className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <RiFilter3Line className="h-4 w-4" />
                  Filter
                </span>
                {categoryFilters.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={`rounded-full border px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] transition ${
                      filter === option
                        ? 'border-midnight bg-midnight text-white'
                        : 'border-stone-200 bg-white text-slate-500 hover:border-gold-primary hover:text-gold-primary'
                    }`}
                  >
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-full border border-stone-200 bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.1em] text-slate-600 outline-none transition focus:border-gold-primary"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-midnight bg-midnight px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-800"
                >
                  <RiAddLine className="h-4 w-4" />
                  List property
                </button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="rounded-[28px] border border-stone-200 bg-white/85 px-8 py-16 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <p className="text-sm text-slate-500">Loading listings…</p>
            </div>
          ) : loadError ? (
            <p className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loadError}
            </p>
          ) : (
            <>
              <p className="mb-6 text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                {filteredPublic.length} listing{filteredPublic.length !== 1 ? 's' : ''} found
              </p>

              {filteredPublic.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center text-slate-500 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-xl font-medium text-slate-700">No listings match your search.</p>
                  <p className="mt-2 text-sm">Try a different location or category to widen the search.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPublic.map((listing) => {
                    const isMine = user?.id ? listing.submittedBy.id === user.id : false;

                    return (
                      <motion.article
                        key={listing.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: cubicBezier(0.22, 1, 0.36, 1) }}
                        onMouseEnter={() => setHoveredId(listing.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        whileHover={{ y: -4 }}
                        className={`group overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-shadow duration-300 ${
                          hoveredId === listing.id ? 'border-gold-primary/40' : 'border-white/80'
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image
                            src={resolveImageSrcFromProperty(listing)}
                            alt={listing.title || 'Property'}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent" />
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
                            <RiMapPinLine className="h-4 w-4 shrink-0 text-gold-primary" />
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
                                href={`/marketplace/${listing.id}`}
                                className="rounded-full border border-midnight bg-midnight px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-800"
                              >
                                View listing
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}

              <motion.section
                id="my-submissions"
                {...fadeUp}
                transition={{ duration: 0.5, ease: cubicBezier(0.22, 1, 0.36, 1), delay: 0.06 }}
                className="mt-12"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-primary">
                      <RiCalendarCheckLine className="h-4 w-4" />
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
                    className="inline-flex items-center gap-2 rounded-full border border-midnight px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-midnight transition hover:bg-midnight hover:text-white"
                  >
                    <RiAddLine className="h-4 w-4" />
                    Add new
                  </button>
                </div>

                {myListings.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-8 py-12 text-center text-slate-500 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                    <p className="text-lg font-medium text-slate-700">No submissions yet.</p>
                    <p className="mt-2 text-sm">Use the form above to submit a property for review.</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {myListings.map((listing) => (
                      <motion.article
                        key={listing.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: cubicBezier(0.22, 1, 0.36, 1) }}
                        className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
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
                          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <RiMapPinLine className="h-4 w-4 shrink-0 text-gold-primary" />
                            {locationLabel(listing) || 'Location not specified'}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
                              {getListingTypeLabel(listing.listingType)}
                            </span>
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
                              {sizeLabel(listing)}
                            </span>
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
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                            >
                              <RiEditLine className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(listing.id)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50"
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleHide(listing.id)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                            >
                              {listing.status === 'HIDDEN' ? (
                                <RiEyeLine className="h-4 w-4" />
                              ) : (
                                <RiEyeOffLine className="h-4 w-4" />
                              )}
                              Hide
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </motion.section>
            </>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-4 py-6 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: cubicBezier(0.22, 1, 0.36, 1) }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/40 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
                    <RiSparklingLine className="h-4 w-4" />
                    Property listing
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-midnight">
                    {editingId ? 'Edit your property' : 'List your property'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-slate-500 transition hover:border-gold-primary hover:text-gold-primary"
                  aria-label="Close"
                >
                  <RiCloseLine className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="mt-6 space-y-4">
                {apiError ? (
                  <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {apiError}
                  </p>
                ) : null}

                <Field label="Property title">
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="e.g. Corner Plot, Riverside District"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    className="min-h-[120px] w-full resize-none rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="Describe the property…"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as typeof prev.category }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                    >
                      <option value="HOUSE">House</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="LAND">Land</option>
                      <option value="COMMERCIAL">Commercial</option>
                    </select>
                  </Field>
                  <Field label="Listing type">
                    <select
                      value={form.listingType}
                      onChange={(e) => setForm((prev) => ({ ...prev, listingType: e.target.value as ListingType }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                    >
                      <option value="SALE">For Sale</option>
                      <option value="RENT">For Rent</option>
                    </select>
                  </Field>
                </div>

                <Field label="Price (NPR)">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="e.g. 25000000"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="City">
                    <input
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="Kathmandu"
                    />
                  </Field>
                  <Field label="State / Province">
                    <input
                      value={form.state}
                      onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="Bagmati"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={form.country}
                      onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="Nepal"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Street">
                    <input
                      value={form.street}
                      onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="Boudha Road"
                    />
                  </Field>
                  <Field label="Postal code">
                    <input
                      value={form.postalCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="44600"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Latitude">
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="27.7172"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="85.324"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Area size">
                    <input
                      type="number"
                      value={form.areaSize}
                      onChange={(e) => setForm((prev) => ({ ...prev, areaSize: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                      placeholder="e.g. 1500"
                    />
                  </Field>
                  <Field label="Area unit">
                    <select
                      value={form.areaUnit}
                      onChange={(e) => setForm((prev) => ({ ...prev, areaUnit: e.target.value as AreaUnit }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                    >
                      <option value="sqft">sq ft</option>
                      <option value="sqm">sq m</option>
                      <option value="aana">Aana</option>
                      <option value="ropani">Ropani</option>
                    </select>
                  </Field>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-midnight bg-midnight px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : editingId ? 'Update listing' : 'Publish listing'}
                    <RiArrowRightLine className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-4 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: cubicBezier(0.22, 1, 0.36, 1) }}
              className="w-full max-w-sm rounded-[28px] border border-white/40 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                <RiDeleteBinLine className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-midnight">Remove listing?</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This listing will be permanently removed from the marketplace. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary disabled:opacity-60"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 rounded-full bg-rose-700 px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-rose-800 disabled:opacity-60"
                >
                  {deleting ? 'Removing…' : 'Yes, remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
