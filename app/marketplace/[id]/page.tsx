'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { RiArrowLeftLine, RiMailLine, RiMapPinLine, RiPhoneLine } from 'react-icons/ri';

import { userPropertiesApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
  getPropertyCategoryLabel,
  getPropertyStatusLabel,
  getPrimaryImage,
} from '@/lib/properties';
import type { UserPropertyResponseDto } from '@/types';

interface MarketplacePropertyPageProps {
  params: Promise<{ id: string }>;
}

export default function MarketplacePropertyPage({ params }: MarketplacePropertyPageProps) {
  const { id } = use(params);
  const [listing, setListing] = useState<UserPropertyResponseDto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    userPropertiesApi.findOne(id)
      .then((result) => {
        if (active) setListing(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this listing.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-4 py-16">
        <div className="max-w-lg rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-brand-sm">
          <h1 className="text-2xl font-semibold text-midnight">This listing is unavailable</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">{error}</p>
          <Link href="/marketplace" className="mt-6 inline-flex rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white">
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#f5f1e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-5 w-36 rounded-full bg-stone-200" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[520px] rounded-[32px] bg-stone-200" />
            <div className="h-[420px] rounded-[32px] bg-stone-200" />
          </div>
        </div>
      </main>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const heroImage = getPrimaryImage(images);
  const gallery = images.filter((image) => image.id !== heroImage?.id);
  const location = formatLocation(listing) || 'Location not specified';
  const emailSubject = encodeURIComponent(`Interest in ${listing.title}`);
  const emailBody = encodeURIComponent(`Hello ${listing.submittedBy.fullName},\n\nI am interested in your marketplace listing: ${listing.title}.\n\nPlease let me know when it would be convenient to discuss it.`);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(184,155,78,0.13),transparent_28%),linear-gradient(180deg,#fcfbf7_0%,#f5f1e8_100%)] text-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-midnight">
          <RiArrowLeftLine className="h-4 w-4" />
          Back to marketplace
        </Link>

        <header className="mt-8 grid gap-5 border-b border-stone-200 pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
              <span>{getPropertyCategoryLabel(listing.category)}</span>
              <span className="h-1 w-1 rounded-full bg-gold-primary" />
              <span>{getListingTypeLabel(listing.listingType)}</span>
            </div>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-midnight sm:text-6xl">{listing.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><RiMapPinLine className="h-4 w-4 text-gold-primary" />{location}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Asking price</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-midnight sm:text-5xl">{formatCurrency(listing.price)}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section>
            <div className="overflow-hidden border border-stone-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-3">
              <div className="relative aspect-[16/10] min-h-[340px] bg-stone-100 sm:aspect-[16/9]">
                <Image
                  src={resolveImageSrcFromProperty(heroImage?.url ?? listing)}
                  alt={listing.title || 'Marketplace property'}
                  fill
                  priority
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                />
              </div>

              {gallery.length > 0 ? (
                <div className="grid gap-3 bg-white pt-3 sm:grid-cols-3">
                  {gallery.slice(0, 3).map((image) => (
                    <div key={image.id} className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <Image
                        src={resolveImageSrcFromProperty(image.url)}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 30vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Fact label="Area" value={formatArea(listing.areaSize, listing.areaUnit)} />
              <Fact label="Listing type" value={getListingTypeLabel(listing.listingType)} />
              <Fact label="Availability" value={getPropertyStatusLabel(listing.status)} />
            </div>

            <section className="mt-6 border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-8">
              <h2 className="text-2xl font-semibold text-midnight">About this property</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600">{listing.description}</p>
            </section>
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="border border-midnight/10 bg-midnight p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)] sm:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-highlight">Direct contact</p>
              <p className="mt-6 text-sm text-slate-300">Listed by</p>
              <h2 className="mt-3 text-3xl font-semibold">{listing.submittedBy.fullName}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Contact the person who listed this property directly to ask questions, arrange a viewing, or discuss the next step.
              </p>

              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:${listing.submittedBy.email}?subject=${emailSubject}&body=${emailBody}`}
                  className="flex items-center gap-3 border border-white/20 px-4 py-3 text-sm transition hover:border-gold-highlight hover:text-gold-highlight"
                >
                  <RiMailLine className="h-5 w-5" />
                  <span className="truncate">{listing.submittedBy.email}</span>
                </a>
                {listing.submittedBy.phoneNumber ? (
                  <a
                    href={`tel:${listing.submittedBy.phoneNumber}`}
                    className="flex items-center gap-3 border border-white/20 px-4 py-3 text-sm transition hover:border-gold-highlight hover:text-gold-highlight"
                  >
                    <RiPhoneLine className="h-5 w-5" />
                    <span>{listing.submittedBy.phoneNumber}</span>
                  </a>
                ) : null}
              </div>

              <a
                href={`mailto:${listing.submittedBy.email}?subject=${emailSubject}&body=${emailBody}`}
                className="mt-6 inline-flex h-12 w-full items-center justify-center bg-gold-primary px-5 text-sm font-semibold text-midnight transition hover:bg-gold-highlight"
              >
                Contact lister
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-200 bg-white px-4 py-4 shadow-brand-sm">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-midnight">{value}</p>
    </div>
  );
}
