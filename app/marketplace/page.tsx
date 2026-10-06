'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  RiAddLine,
  RiCloseLine,
  RiArrowRightLine,
  RiFilter3Line,
  RiSearchLine,
  RiSparklingLine,
} from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import MapLocationPicker from '@/components/admin/MapLocationPicker';
import { getAuthToken } from '@/lib/auth';
import { userPropertiesApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
} from '@/lib/properties';
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
      <main className="min-h-screen bg-[#f8f6f1] text-[#2A2723]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#ca7653]">Marketplace</p>
              <h1 className="mt-2 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">Search, List, and <span className="text-[#ca7653]">Connect.</span> Your community place for real estate.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-500">Connect directly with property owners and discover properties listed by people across our community.</p>
              <a href="#marketplace-listings" className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Explore the marketplace<RiArrowRightLine /></a>
            </div>
            <aside className="rounded-2xl bg-white p-7 text-center shadow-[0_3px_20px_rgba(42,39,35,0.08)]">
              <h2 className="text-lg font-bold">Selling your home?</h2>
              <p className="mt-3 text-sm leading-7 text-stone-500">Share your property with the Sunrise community. Add your details and submit it for review.</p>
              {user ? <button type="button" onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3E4A3D] px-6 py-3 text-sm font-bold text-white hover:bg-[#303c2f]">Post Your Property<RiAddLine /></button> : <Link href="/auth/login?next=/marketplace" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3E4A3D] px-6 py-3 text-sm font-bold text-white hover:bg-[#303c2f]">Sign in to list<RiArrowRightLine /></Link>}
              {user ? <Link href="/marketplace/manage" className="mt-4 block text-xs text-stone-600 underline underline-offset-4">Manage my submissions</Link> : null}
            </aside>
          </section>
          <div id="marketplace-listings" className="mt-12 scroll-mt-6 lg:mt-24"><h2 className="sr-only">Marketplace listings</h2></div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, ease: cubicBezier(0.22, 1, 0.36, 1), delay: 0.05 }}
            className="my-6 rounded-[24px] bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <RiSearchLine className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search marketplace listings"
                  placeholder="Search by title or location…"
                  className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-[#f8f6f1] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <RiFilter3Line className="h-4 w-4" />
                  Filter
                </span>
                {categoryFilters.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={filter === option}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition ${
                      filter === option
                        ? 'border-[#3E4A3D] bg-[#3E4A3D] text-white'
                        : 'border-stone-200 bg-white text-slate-500 hover:border-[#ca7653] hover:text-[#ca7653]'
                    }`}
                  >
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <select
                  aria-label="Sort marketplace listings"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-full border border-stone-200 bg-white px-4 py-3 text-xs uppercase tracking-[0.1em] text-slate-600 outline-none transition focus:border-[#ca7653]"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {user ? (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#3E4A3D] bg-[#3E4A3D] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#303c2f]"
                  >
                    <RiAddLine className="h-4 w-4" />
                    List property
                  </button>
                ) : (
                  <Link
                    href="/auth/login?next=/marketplace"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#3E4A3D] bg-[#3E4A3D] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#303c2f]"
                  >
                    <RiAddLine className="h-4 w-4" />
                    List property
                  </Link>
                )}
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
              <p className="mb-6 text-xs uppercase tracking-[0.16em] text-slate-400">
                {filteredPublic.length} listing{filteredPublic.length !== 1 ? 's' : ''} found
              </p>

              {filteredPublic.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center text-slate-500 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-xl font-medium text-slate-700">No listings match your search.</p>
                  <p className="mt-2 text-sm">Try a different location or category to widen the search.</p>
                </div>
              ) : (
                <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredPublic.map(listing => (
                    <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group overflow-hidden rounded-[22px] bg-white transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ca7653]">
                      <div className="relative aspect-square bg-[#e9e6dd]"><Image src={resolveImageSrcFromProperty(listing)} alt={listing.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-105" /></div>
                      <div className="p-4">
                        <p className="text-lg font-medium text-[#ca7653]">{formatCurrency(listing.price)}</p>
                        <h3 className="mt-1 truncate text-sm font-bold">{listing.title}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-600"><span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e9e6dd] text-[10px]">{listing.submittedBy.fullName.charAt(0)}</span><span className="truncate">{listing.submittedBy.fullName}</span></p>
                        <p className="mt-1 truncate text-xs text-stone-400">{locationLabel(listing)}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-100 pt-2 text-xs text-stone-400">{listing.areaSize != null && listing.areaUnit ? <span>{sizeLabel(listing)}</span> : null}<span>{getListingTypeLabel(listing.listingType)}</span></div>
                      </div>
                    </Link>
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
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ca7653]">
                    <RiSparklingLine className="h-4 w-4" />
                    Property listing
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#2A2723]">
                    List your property
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-slate-500 transition hover:border-[#ca7653] hover:text-[#ca7653]"
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
                    className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                    placeholder="e.g. Corner Plot, Riverside District"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    className="min-h-[120px] w-full resize-none rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                    placeholder="Describe the property…"
                  />
                </Field>

                <Field label="Property images">
                  <div className="rounded-[20px] border border-dashed border-stone-300 bg-[#f8f6f1] p-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageSelection}
                      disabled={submitting || pendingImages.length >= MAX_MARKETPLACE_IMAGES}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#3E4A3D] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
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
                              <p className="truncate text-xs font-medium text-[#2A2723]">{image.file.name}</p>
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                    placeholder="e.g. 25000000"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="City">
                    <input
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="Kathmandu"
                    />
                  </Field>
                  <Field label="State / Province">
                    <input
                      value={form.state}
                      onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="Bagmati"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={form.country}
                      onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                      required
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="Nepal"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Street">
                    <input
                      value={form.street}
                      onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="Boudha Road"
                    />
                  </Field>
                  <Field label="Postal code">
                    <input
                      value={form.postalCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="44600"
                    />
                  </Field>
                </div>

                <div className="rounded-[20px] border border-stone-200 bg-[#f8f6f1] p-4">
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="27.7172"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
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
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#ca7653]"
                      placeholder="e.g. 1500"
                    />
                  </Field>
                  <Field label="Area unit">
                    <select
                      value={form.areaUnit}
                      onChange={(e) => setForm((prev) => ({ ...prev, areaUnit: e.target.value as AreaUnit }))}
                      className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-[#ca7653] hover:text-[#ca7653]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#3E4A3D] bg-[#3E4A3D] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#303c2f] disabled:cursor-not-allowed disabled:opacity-60"
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
