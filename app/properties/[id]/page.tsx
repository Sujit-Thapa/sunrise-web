'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { BadgeCheck, KeyRound, LandPlot, MapPin, Square, Tag } from 'lucide-react';
import ReservationDialog from '@/components/payment/ReservationDialog';
import { DescriptionSection, DetailGrid, DetailSection, DetailTile, LocationMapSection, PropertyGallery } from '@/components/property/PropertyDetailParts';

import { ApiError } from '@/lib/api';
import { auth, getAuthToken } from '@/lib/auth';
import { propertiesApi } from '@/lib/backend';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getPropertyCategoryLabel,
  getListingTypeLabel,
  getPrimaryImage,
  getPropertyStatusLabel,
} from '@/lib/properties';
import SavePropertyButton from '@/components/ui/SavePropertyButton';
import { PropertyDetailSkeleton } from '@/components/ui/Skeleton';
import { parseCoordinates } from '@/lib/coordinates';
import type { PropertyResponseDto, UserRole } from '@/types';

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}


type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; property: PropertyResponseDto }
  | { kind: 'error'; message: string; isUnavailable: boolean };

function locationLabel(property: PropertyResponseDto): string {
  return formatLocation(property);
}

function sizeLabel(property: PropertyResponseDto): string {
  return formatArea(property.areaSize, property.areaUnit);
}

function isPrivileged(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'AGENT';
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [retryIndex, setRetryIndex] = useState(0);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setState({ kind: 'loading' });

      const token = getAuthToken();
      let authTokenToUse: string | undefined;

      if (token) {
        try {
          const me = await auth.me(token);
          if (isPrivileged(me.role)) {
            authTokenToUse = token;
          }
        } catch {
          authTokenToUse = undefined;
        }
      }

      try {
        const property = await propertiesApi.findOne(id, authTokenToUse);
        if (!active) return;
        setState({ kind: 'ready', property });
      } catch (error) {
        if (!active) return;

        const message = (error as Error).message || 'Unable to load property.';
        setState({
          kind: 'error',
          message,
          isUnavailable: error instanceof ApiError && error.status === 404,
        });
      }
    }

    void loadProperty();

    return () => {
      active = false;
    };
  }, [id, retryIndex]);

  if (state.kind === 'loading') {
    return <PropertyDetailSkeleton />;
  }

  if (state.kind === 'error') {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-[32px] border border-stone-200 bg-white p-8 text-center shadow-brand-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
              Property details
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-midnight">
              {state.isUnavailable ? 'This property is no longer available' : 'We could not load this property'}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {state.isUnavailable
                ? 'This property may have been reserved, sold, or removed. Browse our available listings to find another property.'
                : 'Please try again or return to the property list.'}
            </p>
            {!state.isUnavailable && <p className="mt-4 text-xs text-slate-400">{state.message}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to properties
              </Link>
              {!state.isUnavailable && (
                <button
                  type="button"
                  onClick={() => setRetryIndex((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const property = state.property;
  const images = Array.isArray(property.images) ? property.images : [];
  const hero = getPrimaryImage(images);
  const gallery = hero ? [hero, ...images.filter(image => image.id !== hero.id)] : images;
  const location = locationLabel(property);
  const coordinates = parseCoordinates(property.latitude, property.longitude);
  const mapQuery = coordinates ? `${coordinates[1]},${coordinates[0]}` : location;

  return (
    <div className="bg-[#f7f5f1] text-[#2a2723]">
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-6 sm:px-8 xl:px-0">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,660fr)_minmax(0,614fr)] lg:gap-[46px]">
          <div className="min-w-0 space-y-[46px]">
            <PropertyGallery images={gallery.flatMap(image => image.id ? [{ id: image.id, url: image.url }] : [])} fallback={property} title={property.title} />
            {property.description ? <DescriptionSection category={property.category} description={property.description} /> : null}
            <LocationMapSection title={property.title} query={mapQuery} exact={Boolean(coordinates)} />
          </div>
          <div className="min-w-0 space-y-[46px]">
            <header>
              <span className="inline-flex rounded-[7px] bg-[#f2e7e0] px-2 py-px text-xs font-medium capitalize tracking-[0.01em] text-[#cc7654]">{getListingTypeLabel(property.listingType)}</span>
              <p className="mt-1 text-[28px] font-semibold text-[#cc7654]">{formatCurrency(property.price)}</p>
              <h1 className="mt-1 text-[28px] font-bold leading-tight first-letter:uppercase">{property.title}</h1>
              {location ? <p className="mt-2 text-xs font-medium capitalize tracking-[0.01em] text-[#989898]">{location}</p> : null}
              <div className="mt-6 flex items-center gap-3">
                {property.status === 'ACTIVE' ? <button type="button" onClick={() => setReserving(true)} className="inline-flex h-[35px] items-center rounded-[20px] bg-[#ad5938] px-6 text-sm font-bold tracking-[0.01em] text-white transition hover:bg-[#954a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad5938]">Reserve Property</button> : null}
                <SavePropertyButton property={property} compact />
              </div>
            </header>
            <DetailSection id="property-facts" title="Property Detail">
              <DetailGrid>
                <DetailTile icon={LandPlot} label="Property type" value={getPropertyCategoryLabel(property.category)} />
                {property.areaSize != null && property.areaUnit ? <DetailTile icon={Square} label="Area" value={sizeLabel(property)} /> : null}
                <DetailTile icon={Tag} label="Listing type" value={getListingTypeLabel(property.listingType)} />
                <DetailTile icon={BadgeCheck} label="Status" value={getPropertyStatusLabel(property.status)} />
                {property.reservationFeeOverride != null ? <DetailTile icon={KeyRound} label="Reservation fee" value={formatCurrency(property.reservationFeeOverride)} /> : null}
              </DetailGrid>
            </DetailSection>
            {location ? (
              <DetailSection id="property-overview" title="Overview">
                <DetailGrid><DetailTile icon={MapPin} label="City & Area" value={location} /></DetailGrid>
              </DetailSection>
            ) : null}
          </div>
        </div>
      </div>
      {reserving ? <ReservationDialog property={property} onClose={() => setReserving(false)} /> : null}
    </div>
  );
}
