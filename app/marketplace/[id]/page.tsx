'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { BadgeCheck, LandPlot, MapPin, Phone, Square, Tag } from 'lucide-react';

import OwnerContactDialog from '@/components/marketplace/OwnerContactDialog';
import { PropertyDetailSkeleton } from '@/components/ui/Skeleton';
import { DescriptionSection, DetailGrid, DetailSection, DetailTile, LocationMapSection, PropertyGallery } from '@/components/property/PropertyDetailParts';
import { parseCoordinates } from '@/lib/coordinates';
import { userPropertiesApi } from '@/lib/backend';
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
    return <PropertyDetailSkeleton />;
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
    <div className="bg-[#f7f5f1] text-[#2a2723]">
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-6 sm:px-8 xl:px-0">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,660fr)_minmax(0,614fr)] lg:gap-[46px]">
          <div className="min-w-0 space-y-[46px]">
            <PropertyGallery images={gallery.flatMap(image => image.id ? [{ id: image.id, url: image.url }] : [])} fallback={listing} title={listing.title} />
            {listing.description ? <DescriptionSection category={listing.category} description={listing.description} /> : null}
            <LocationMapSection title={listing.title} query={mapQuery} exact={Boolean(coordinates)} />
          </div>
          <div className="min-w-0 space-y-[46px]">
            <header>
              <p className="text-[28px] font-semibold text-[#cc7654]">{formatCurrency(listing.price)}</p>
              <h1 className="mt-1 text-[28px] font-bold leading-tight first-letter:uppercase">{listing.title}</h1>
              {location ? <p className="mt-2 text-xs font-medium capitalize tracking-[0.01em] text-[#989898]">{location}</p> : null}
              <button type="button" onClick={() => setContactOpen(true)} className="mt-4 inline-flex items-center gap-[5px] rounded-full py-1 pr-2 text-left focus-visible:outline-2 focus-visible:outline-[#cc7654]" aria-label={`Contact ${owner.fullName}`}>
                <span aria-hidden="true" className="flex size-[41px] shrink-0 items-center justify-center rounded-full bg-[#e8e4db] text-sm font-semibold uppercase text-[#3e4a3d]">{initials}</span>
                <span className="text-[22px] font-bold">{owner.fullName}</span>
                <span aria-hidden="true" className="ml-2 flex size-[25px] items-center justify-center rounded-full bg-[#e8c1b2] text-[#cc7654]"><Phone size={14} /></span>
              </button>
            </header>
            <DetailSection id="listing-facts" title="Property Detail">
              <DetailGrid>
                <DetailTile icon={LandPlot} label="Property type" value={getPropertyCategoryLabel(listing.category)} />
                {listing.areaSize != null && listing.areaUnit ? <DetailTile icon={Square} label="Area" value={formatArea(listing.areaSize, listing.areaUnit)} /> : null}
                <DetailTile icon={Tag} label="Listing type" value={getListingTypeLabel(listing.listingType)} />
                <DetailTile icon={BadgeCheck} label="Listing status" value={getPropertyStatusLabel(listing.status)} />
              </DetailGrid>
            </DetailSection>
            {location ? (
              <DetailSection id="listing-overview" title="Overview">
                <DetailGrid><DetailTile icon={MapPin} label="City & Area" value={location} /></DetailGrid>
              </DetailSection>
            ) : null}
          </div>
        </div>
      </div>
      {contactOpen ? <OwnerContactDialog listing={listing} onClose={() => setContactOpen(false)} /> : null}
    </div>
  );
}
