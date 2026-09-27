'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { RiMapPinLine, RiRulerLine, RiHome4Line, RiPriceTag3Line, RiCheckboxCircleLine, RiKey2Line } from 'react-icons/ri';
import type { IconType } from 'react-icons';
import ReservationDialog from '@/components/payment/ReservationDialog';

import { ApiError } from '@/lib/api';
import { auth, getAuthToken } from '@/lib/auth';
import { propertiesApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-40 rounded-full bg-stone-200" />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-8">
                <div className="h-[520px] rounded-[34px] bg-stone-200" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="h-28 rounded-[24px] bg-stone-200" />
                  <div className="h-28 rounded-[24px] bg-stone-200" />
                  <div className="h-28 rounded-[24px] bg-stone-200" />
                </div>
                <div className="h-72 rounded-[28px] bg-stone-200" />
              </div>
              <div className="h-[520px] rounded-[32px] bg-stone-200" />
            </div>
          </div>
        </div>
      </main>
    );
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
    <div className="bg-[#f8f6f1] text-[#2A2723]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/properties" className="mb-6 inline-block text-xs text-stone-500 hover:text-[#ca7653]">Properties / {getPropertyCategoryLabel(property.category)}</Link>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0 space-y-8">
          <section aria-label="Property photos" className="space-y-4">
            <div className="relative aspect-[5/3] overflow-hidden rounded-xl bg-stone-200">
              <Image src={selectedImage ? resolveImageSrcFromProperty(selectedImage) : resolveImageSrcFromProperty(property)} alt={property.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            {gallery.length > 1 ? <div className="grid grid-cols-3 gap-3">{gallery.map((img, index) => <button key={img.id} type="button" onClick={() => setSelectedImage(img.url)} aria-label={`View property photo ${index + 1}`} aria-pressed={(selectedImage ?? hero?.url) === img.url} className={`relative aspect-[3/2] overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ca7653] ${(selectedImage ?? hero?.url) === img.url ? 'ring-2 ring-[#ca7653]' : ''}`}><Image src={resolveImageSrcFromProperty(img.url)} alt="" fill sizes="(min-width: 1024px) 180px, 30vw" className="object-cover" /></button>)}</div> : null}
          </section>
          {property.description ? <section aria-labelledby="property-description"><h2 id="property-description" className="mb-3 text-lg font-semibold">{property.category === 'LAND' ? 'Plot Description' : 'Property Description'}</h2><p className="whitespace-pre-line break-words text-sm leading-7 text-stone-500">{property.description}</p></section> : null}
          <section aria-labelledby="property-map-heading">
            <h2 id="property-map-heading" className="mb-3 text-lg font-semibold">Location Map</h2>
            {mapQuery ? <>
              <iframe title={`Location of ${property.title}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-[280px] w-full rounded-xl border border-stone-200 bg-[#e9e6dd] sm:h-[320px]" />
              {!coordinates ? <p className="mt-2 text-xs text-stone-500">Showing the listed address. An exact property pin has not been provided.</p> : null}
              <a href={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#ca7653]"><RiMapPinLine />Open in Google Maps</a>
            </> : <p className="rounded-xl bg-white p-5 text-sm text-stone-500">A location has not been provided for this property.</p>}
          </section>
          </div>
          <div className="space-y-8">
            <header>
              <p className="text-xs text-[#ca7653]">{getListingTypeLabel(property.listingType)}</p>
              <p className="mt-1 text-3xl font-medium text-[#ca7653]">{formatCurrency(property.price)}</p>
              <h1 className="mt-1 text-2xl font-bold">{property.title}</h1>
              {location ? <p className="mt-2 text-sm text-stone-500">{location}</p> : null}
              <div className="mt-5 flex items-center gap-3">
                {property.status === 'ACTIVE' ? <button type="button" onClick={() => setReserving(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#ca7653] px-5 py-3 text-sm font-bold text-white hover:bg-[#b66545]"><RiKey2Line />Reserve Property</button> : null}
                <SavePropertyButton property={property} compact />
              </div>
            </header>
            <section aria-labelledby="property-facts"><h2 id="property-facts" className="mb-4 text-sm font-bold">Property Detail</h2><div className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={RiHome4Line} label="Property type" value={getPropertyCategoryLabel(property.category)} />
              {property.areaSize != null && property.areaUnit ? <InfoTile icon={RiRulerLine} label="Area" value={sizeLabel(property)} /> : null}
              <InfoTile icon={RiPriceTag3Line} label="Listing type" value={getListingTypeLabel(property.listingType)} />
              <InfoTile icon={RiCheckboxCircleLine} label="Status" value={getPropertyStatusLabel(property.status)} />
              {property.reservationFeeOverride != null ? <InfoTile icon={RiKey2Line} label="Reservation fee" value={formatCurrency(property.reservationFeeOverride)} /> : null}
            </div></section>
            {location ? <section aria-labelledby="property-location"><h2 id="property-location" className="mb-4 text-sm font-bold">Location</h2><InfoTile icon={RiMapPinLine} label="Address" value={location} />{mapQuery ? <a href={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#ca7653]"><RiMapPinLine />View on Maps</a> : null}</section> : null}
          </div>
        </div>
      </div>
      {reserving ? <ReservationDialog property={property} onClose={() => setReserving(false)} /> : null}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded-xl bg-white p-4"><span className="rounded-lg bg-[#fff3ee] p-2 text-[#ca7653]"><Icon size={18} /></span><div className="min-w-0"><p className="text-xs text-stone-400">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div></div>;
}
