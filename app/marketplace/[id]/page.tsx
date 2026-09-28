'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { RiArrowLeftLine, RiMapPinLine, RiPhoneLine, RiHome4Line, RiRulerLine, RiPriceTag3Line, RiCheckboxCircleLine } from 'react-icons/ri';

import type { IconType } from 'react-icons';
import OwnerContactDialog from '@/components/marketplace/OwnerContactDialog';
import { parseCoordinates } from '@/lib/coordinates';
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
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [expandedGallery, setExpandedGallery] = useState(false);

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
  const hero = getPrimaryImage(images);
  const gallery = hero ? [hero, ...images.filter(image => image.id !== hero.id)] : images;
  const location = formatLocation(listing);
  const coordinates = parseCoordinates(listing.latitude, listing.longitude);
  const mapQuery = coordinates ? `${coordinates[1]},${coordinates[0]}` : location;
  const owner = listing.submittedBy;
  const initials = owner.fullName.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('');

  return (
    <div className="bg-[#f8f6f1] text-[#2A2723]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/marketplace" className="mb-6 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-[#ca7653]"><RiArrowLeftLine />Back to marketplace</Link>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0 space-y-8">
            <section aria-label="Property gallery">
              <div className="relative aspect-[5/3] overflow-hidden rounded-xl bg-[#e9e6dd]"><Image src={resolveImageSrcFromProperty(selectedPhoto || hero?.url || listing)} alt={listing.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div>
              {gallery.length > 1 ? <div className="mt-4 grid grid-cols-3 gap-3">{(expandedGallery ? gallery : gallery.slice(0, 3)).map((image, index) => {
                const more = !expandedGallery && index === 2 && gallery.length > 3;
                return <button key={image.id} type="button" onClick={() => { if (more) setExpandedGallery(true); else setSelectedPhoto(image.url); }} aria-label={more ? `Show all ${gallery.length} photos` : `View property photo ${index + 1}`} className="relative aspect-[3/2] overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ca7653]"><Image src={resolveImageSrcFromProperty(image.url)} alt="" fill sizes="(min-width: 1024px) 180px, 30vw" className="object-cover" />{more ? <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-3xl text-white">+{gallery.length - 2}</span> : null}</button>;
              })}</div> : null}
              {expandedGallery ? <button onClick={() => setExpandedGallery(false)} className="mt-3 text-xs text-[#ca7653]">Show fewer photos</button> : null}
            </section>
            {listing.description ? <section><h2 className="mb-3 text-lg font-semibold">{listing.category === 'LAND' ? 'Plot Description' : 'Property Description'}</h2><p className="whitespace-pre-line break-words text-sm leading-7 text-stone-500">{listing.description}</p></section> : null}
            {mapQuery ? <section><h2 className="mb-3 text-lg font-semibold">Location Map</h2><iframe title={`Location of ${listing.title}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-[280px] w-full rounded-xl border border-stone-200 bg-[#e9e6dd] sm:h-[320px]" />{!coordinates ? <p className="mt-2 text-xs text-stone-500">Showing the listed address; an exact pin has not been provided.</p> : null}<a href={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#ca7653]"><RiMapPinLine />Open in Google Maps</a></section> : null}
          </div>
          <div className="space-y-8">
            <header><p className="text-2xl font-medium text-[#ca7653]">{formatCurrency(listing.price)}</p><h1 className="mt-2 text-xl font-bold">{listing.title}</h1>{location ? <p className="mt-2 text-xs text-stone-500">{location}</p> : null}<button type="button" onClick={() => setContactOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-full py-1 pr-3 text-sm font-semibold hover:bg-white focus-visible:outline-[#ca7653]" aria-label={`Contact ${owner.fullName}`}><span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e6dd] text-xs text-[#3E4A3D]">{initials}</span>{owner.fullName}<RiPhoneLine className="rounded-full bg-[#f7e4da] p-1 text-2xl text-[#ca7653]" /></button></header>
            <section><h2 className="mb-4 text-lg font-semibold">Property Detail</h2><div className="grid gap-3 sm:grid-cols-2"><Fact icon={RiHome4Line} label="Property type" value={getPropertyCategoryLabel(listing.category)} />{listing.areaSize != null && listing.areaUnit ? <Fact icon={RiRulerLine} label="Area" value={formatArea(listing.areaSize, listing.areaUnit)} /> : null}<Fact icon={RiPriceTag3Line} label="Listing type" value={getListingTypeLabel(listing.listingType)} /><Fact icon={RiCheckboxCircleLine} label="Listing status" value={getPropertyStatusLabel(listing.status)} /></div></section>
            {location ? <section><h2 className="mb-4 text-lg font-semibold">Overview</h2><Fact icon={RiMapPinLine} label="City & area" value={location} /></section> : null}
          </div>
        </div>
      </div>
      {contactOpen ? <OwnerContactDialog listing={listing} onClose={() => setContactOpen(false)} /> : null}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-4"><span className="rounded-lg bg-[#fff3ee] p-2 text-[#ca7653]"><Icon size={18} /></span><div className="min-w-0"><p className="text-xs text-stone-400">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div></div>;
}
