'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, Plus, RotateCcw, Search, SearchX } from 'lucide-react';
import {
  RiCloseLine,
  RiArrowRightLine,
  RiSparklingLine,
} from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import MapLocationPicker from '@/components/admin/MapLocationPicker';
import PropertyCard from '@/components/ui/PropertyCard';
import { PropertyCardGridSkeleton } from '@/components/ui/Skeleton';
import { getAuthToken } from '@/lib/auth';
import { userPropertiesApi } from '@/lib/backend';
import { formatLocation } from '@/lib/properties';
import type {
  AreaUnit,
  CreateUserPropertyDto,
  ListingType,
  PresignUserPropertyImageResponseDto,
  PropertyCategory,
  UserPropertyResponseDto,
  UserPropertyStatus,
} from '@/types';

type CategoryFilter = 'all' | 'house' | 'land' | 'apartment' | 'commercial';
type SortOption = 'newest' | 'price-asc' | 'price-desc';
type ImageUploadStatus = 'pending' | 'uploading' | 'confirming' | 'done' | 'error';

interface PendingImage {
  file: File;
  previewUrl: string;
  status: ImageUploadStatus;
  error?: string;
}

const MAX_MARKETPLACE_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

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

const categoryFilters: CategoryFilter[] = ['all', 'house', 'apartment', 'land', 'commercial'];

function locationLabel(item: UserPropertyResponseDto): string {
  return formatLocation(item);
}

async function uploadMarketplaceImages(
  listingId: string,
  images: PendingImage[],
  token: string,
  onStatusChange: (index: number, status: ImageUploadStatus, error?: string) => void,
): Promise<UserPropertyResponseDto> {
  let latestListing: UserPropertyResponseDto | undefined;

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];

    try {
      onStatusChange(index, 'uploading');
      const presign = await userPropertiesApi.presignImage(
        listingId,
        { mimeType: image.file.type as 'image/jpeg' | 'image/png' | 'image/webp' },
        token,
      );
      const presignResponse = presign as PresignUserPropertyImageResponseDto;

      const uploadResponse = await fetch(presignResponse.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': image.file.type },
        body: image.file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${await uploadResponse.text()}`);
      }

      onStatusChange(index, 'confirming');
      latestListing = await userPropertiesApi.confirmImage(
        listingId,
        {
          s3Key: presignResponse.s3Key,
          publicUrl: presignResponse.publicUrl,
          isPrimary: false,
          sortOrder: index,
        },
        token,
      );
      onStatusChange(index, 'done');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload image.';
      onStatusChange(index, 'error', message);
      throw new Error(`Image ${index + 1} failed: ${message}`);
    }
  }

  if (!latestListing) {
    throw new Error('No marketplace images were uploaded.');
  }

  return latestListing;
}

function isPublicApproved(status: UserPropertyStatus): boolean {
  return status === 'APPROVED';
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
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function Marketplace() {
  const { user } = useAuthSession();
  const [publicListings, setPublicListings] = useState<UserPropertyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [showForm, setShowForm] = useState(false);

  // The navbar's "List Properties" button links here with ?list=1 to open the form directly.
  useEffect(() => {
    if (!user || new URLSearchParams(window.location.search).get('list') !== '1') return;
    queueMicrotask(() => setShowForm(true));
    window.history.replaceState(null, '', '/marketplace');
  }, [user]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

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

  useEffect(() => {
    void fetchListings();
  }, []);

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (selectedFiles.length === 0) return;
    if (pendingImages.length + selectedFiles.length > MAX_MARKETPLACE_IMAGES) {
      setApiError(`You can upload a maximum of ${MAX_MARKETPLACE_IMAGES} images per listing.`);
      return;
    }

    const nextImages: PendingImage[] = [];
    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        setApiError(`${file.name}: only JPG, PNG, and WEBP images are supported.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setApiError(`${file.name}: image must be 5 MB or smaller.`);
        return;
      }
      nextImages.push({ file, previewUrl: URL.createObjectURL(file), status: 'pending' });
    }

    setApiError(null);
    setPendingImages((current) => [...current, ...nextImages]);
  };

  const removePendingImage = (index: number) => {
    setPendingImages((current) => {
      const image = current[index];
      if (image) URL.revokeObjectURL(image.previewUrl);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

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
      const savedListing = await userPropertiesApi.submit(payload, token);

      if (pendingImages.length > 0) {
        await uploadMarketplaceImages(
          savedListing.id,
          pendingImages,
          token,
          (index, status, error) => {
            setPendingImages((current) => current.map((image, imageIndex) => (
              imageIndex === index ? { ...image, status, error } : image
            )));
          },
        );
      }
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setPendingImages([]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchListings();
    } catch (err) {
      setApiError((err as Error).message || 'Unable to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#f7f5f1] text-[#2a2723]">
        <div className="mx-auto max-w-[1320px] px-5 pb-14 sm:px-8 xl:px-0">
          <section className="grid items-center gap-8 pb-[42px] pt-[54px] lg:grid-cols-[minmax(0,1fr)_408px] lg:gap-[68px]">
            <div>
              <p className="text-sm font-bold tracking-[0.01em] text-[#cc7654]">MARKETPLACE</p>
              <h1 className="mt-3.5 text-balance text-3xl font-bold leading-[1.12] tracking-[-0.01em] sm:text-4xl">Search, list, and <span className="text-[#cc7654]">connect</span>. Your community place for real estate solutions.</h1>
              <p className="mt-3.5 max-w-[760px] text-base leading-[1.45]">Discover distinctive homes, land, and commercial spaces from trusted owners. Refine your search to find the place that feels right.</p>
            </div>
            <aside className="flex flex-col items-center gap-3 rounded-2xl bg-white px-9 py-[26px] text-center shadow-[0_16px_40px_rgba(42,39,35,0.08)]">
              <h2 className="text-[22px] font-bold">Selling your home?</h2>
              <p className="text-base leading-[1.35] text-[#7e7a74]">Share your property with the Sunrise community and submit it for review.</p>
              {user ? <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-[#3e4a3d] px-[18px] py-[9px] text-sm font-bold text-white hover:bg-[#303c2f]">Post Your Property<Plus aria-hidden="true" size={14} /></button> : <Link href="/auth/login?next=/marketplace" className="inline-flex items-center gap-2 rounded-full bg-[#3e4a3d] px-[18px] py-[9px] text-sm font-bold text-white hover:bg-[#303c2f]">Sign in to list<ArrowRight aria-hidden="true" size={14} /></Link>}
              {user ? <Link href="/marketplace/manage" className="text-xs text-[#7e7a74] underline underline-offset-4">Manage my submissions</Link> : null}
            </aside>
          </section>

          <div id="marketplace-listings" className="flex scroll-mt-6 flex-wrap items-center justify-between gap-3 pb-6 pt-6">
            <h2 className="sr-only">Marketplace listings</h2>
            <div className="flex flex-wrap items-center gap-2.5">
              {categoryFilters.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={filter === option}
                  className={`rounded-full px-[18px] py-[11px] text-sm font-medium transition ${filter === option ? 'bg-[#cc7654] text-white' : 'bg-[#efeae2] text-[#2a2723] hover:bg-[#e8e1d6]'}`}
                >
                  {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
              <span aria-hidden="true" className="mx-1 h-6 w-px bg-[#e8e4db]" />
              <label className="relative">
                <span className="sr-only">Search marketplace listings</span>
                <Search aria-hidden="true" size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7e7a74]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or location" className="w-56 rounded-full bg-[#efeae2] py-[11px] pl-10 pr-4 text-sm font-medium text-[#2a2723] outline-none placeholder:text-[#7e7a74] focus-visible:ring-2 focus-visible:ring-[#cc7654]" />
              </label>
            </div>
            <label className="relative">
              <span className="sr-only">Sort marketplace listings</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="appearance-none rounded-full bg-[#efeae2] py-2.5 pl-4 pr-9 text-sm font-medium text-[#2a2723] outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]">
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown aria-hidden="true" size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
            </label>
          </div>

          {loading ? (
            <PropertyCardGridSkeleton count={8} label="Loading marketplace listings" />
          ) : loadError ? (
            <p className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loadError}
            </p>
          ) : (
            <>
              {filteredPublic.length === 0 ? (
                <div className="flex min-h-[650px] flex-col items-center justify-center gap-[18px] rounded-[32px] border border-[#e8e4db] bg-white px-6 py-[54px] text-center shadow-[0_8px_24px_rgba(42,39,35,0.05)] sm:px-[72px]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f4ded4] px-[13px] py-2 text-xs font-bold tracking-[0.06em] text-[#cc7654]"><SearchX aria-hidden="true" size={16} />SEARCH COMPLETE</span>
                  <p className="text-3xl font-bold leading-[1.15] tracking-[-0.01em] sm:text-4xl">No properties found</p>
                  <p className="max-w-[500px] text-lg leading-[1.55] text-[#7e7a74]">We couldn’t find a home that matches every detail. Try widening your search, or clear the filters to see everything available.</p>
                  <p className="flex items-center gap-2.5 pb-1.5 pt-1 text-sm"><Check aria-hidden="true" size={17} />Remove one filter at a time for broader results</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => { setFilter('all'); setSearch(''); }} className="inline-flex items-center gap-[9px] rounded-full bg-[#cc7654] px-[22px] py-[13px] text-base font-bold text-white hover:bg-[#b66545]"><RotateCcw aria-hidden="true" size={18} />Clear filters</button>
                    <Link href="/properties" className="inline-flex items-center gap-[9px] rounded-full border-[1.25px] border-[#2a2723] px-[22px] py-[13px] text-base font-bold hover:bg-[#2a2723] hover:text-white">Explore all properties<ArrowRight aria-hidden="true" size={18} /></Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredPublic.map(listing => (
                    <PropertyCard key={listing.id} property={listing} href={`/marketplace/${listing.id}`} owner={listing.submittedBy.fullName} />
                  ))}
                </div>
              )}

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
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#cc7654]">
                    <RiSparklingLine className="h-4 w-4" />
                    Property listing
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#2a2723]">
                    List your property
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-slate-500 transition hover:border-[#cc7654] hover:text-[#cc7654]"
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
                    className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                    placeholder="e.g. Corner Plot, Riverside District"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    className="min-h-[120px] w-full resize-none rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                    placeholder="Describe the property…"
                  />
                </Field>

                <Field label="Property images">
                  <div className="rounded-[20px] border border-dashed border-stone-300 bg-[#f7f5f1] p-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageSelection}
                      disabled={submitting || pendingImages.length >= MAX_MARKETPLACE_IMAGES}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#3e4a3d] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                    />
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Add up to {MAX_MARKETPLACE_IMAGES} JPG, PNG, or WEBP images. Each file must be 5 MB or smaller.
                      Adding images to an approved listing sends it back for review.
                    </p>

                    {pendingImages.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {pendingImages.map((image, index) => (
                          <div key={`${image.file.name}-${index}`} className="overflow-hidden rounded-[16px] border border-stone-200 bg-white">
                            <div className="relative aspect-square bg-stone-100">
                              <Image
                                src={image.previewUrl}
                                alt={image.file.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePendingImage(index)}
                                disabled={submitting || image.status === 'uploading' || image.status === 'confirming'}
                                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm disabled:opacity-50"
                                aria-label={`Remove ${image.file.name}`}
                              >
                                <RiCloseLine className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="p-2">
                              <p className="truncate text-xs font-medium text-[#2a2723]">{image.file.name}</p>
                              <p className={`mt-1 text-xs ${image.status === 'error' ? 'text-rose-600' : image.status === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {image.status === 'pending' ? 'Ready to upload' : image.status === 'uploading' ? 'Uploading…' : image.status === 'confirming' ? 'Saving image…' : image.status === 'done' ? 'Uploaded' : image.error ?? 'Upload failed'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as typeof prev.category }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                    placeholder="e.g. 25000000"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="City">
                    <input
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="Kathmandu"
                    />
                  </Field>
                  <Field label="State / Province">
                    <input
                      value={form.state}
                      onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="Bagmati"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={form.country}
                      onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="Nepal"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Street">
                    <input
                      value={form.street}
                      onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="Boudha Road"
                    />
                  </Field>
                  <Field label="Postal code">
                    <input
                      value={form.postalCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="44600"
                    />
                  </Field>
                </div>

                <div className="rounded-[20px] border border-stone-200 bg-[#f7f5f1] p-4">
                  <Field label="Pin property location">
                    <MapLocationPicker
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onChange={({ latitude, longitude }) =>
                        setForm((prev) => ({ ...prev, latitude, longitude }))
                      }
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="27.7172"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                      placeholder="e.g. 1500"
                    />
                  </Field>
                  <Field label="Area unit">
                    <select
                      value={form.areaUnit}
                      onChange={(e) => setForm((prev) => ({ ...prev, areaUnit: e.target.value as AreaUnit }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    }}
                    className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-[#cc7654] hover:text-[#cc7654]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#3e4a3d] bg-[#3e4a3d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#303c2f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Publish listing'}
                    <RiArrowRightLine className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </>
  );
}
