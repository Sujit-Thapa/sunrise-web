'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import {
  BadgeInfo,
  MapPin,
  Ruler,
  Sparkles,
  Tag,
  Wallet,
} from 'lucide-react';

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
import type { PropertyResponseDto, UserRole } from '@/types';

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  RESERVED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  HIDDEN: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200',
  DRAFT: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200',
  COMPLETED: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
};

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; property: PropertyResponseDto }
  | { kind: 'error'; message: string; isPrivate: boolean };

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

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      setState({ kind: 'loading' });

      const token = getAuthToken();
      let role: UserRole | null = null;
      let authTokenToUse: string | undefined;

      if (token) {
        try {
          const me = await auth.me(token);
          role = me.role;
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
        const isPrivate =
          !authTokenToUse &&
          (message.includes('404') ||
            message.toLowerCase().includes('not found') ||
            message.toLowerCase().includes('not have permission') ||
            message.toLowerCase().includes('forbidden'));

        setState({
          kind: 'error',
          message,
          isPrivate: isPrivate || role === 'USER',
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
              {state.isPrivate ? 'This property is not public' : 'We could not load this property'}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {state.isPrivate
                ? 'This listing is hidden or still in draft. Agent and admin accounts can view it after signing in.'
                : 'The backend returned an error while loading this listing. Please try again or go back to the property list.'}
            </p>
            <p className="mt-4 text-xs text-slate-400">{state.message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to properties
              </Link>
              {state.isPrivate ? (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Sign in
                </Link>
              ) : (
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
  const gallery = images.filter((img) => img.id !== hero?.id);
  const location = locationLabel(property);
  const size = sizeLabel(property);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span>Properties</span>
          <span className="text-slate-300">/</span>
          <span>{getPropertyCategoryLabel(property.category)}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="space-y-8">
            <div className="overflow-hidden rounded-[34px] border border-stone-200 bg-white shadow-brand-sm">
              <div className="relative aspect-[16/10] min-h-[340px] bg-stone-100 sm:aspect-[16/9]">
                <Image
                  src={resolveImageSrcFromProperty(property)}
                  alt={property.title}
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-midnight/55 via-midnight/10 to-transparent" />

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${statusStyles[property.status] ?? 'bg-stone-100 text-stone-500 ring-1 ring-stone-200'}`}
                  >
                    {getPropertyStatusLabel(property.status)}
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-midnight backdrop-blur">
                    {getListingTypeLabel(property.listingType)}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="max-w-3xl">
                    <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/80">
                      {getPropertyCategoryLabel(property.category)}
                    </p>
                    <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                      {property.title}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/80">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {location || 'Location not specified'}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-white/50 sm:inline-block" />
                      <span>{size}</span>
                    </div>
                  </div>
                </div>
              </div>

              {gallery.length > 0 ? (
                <div className="grid gap-3 border-t border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                  {gallery.slice(0, 4).map((img, index) => (
                    <div
                      key={img.id}
                      className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 ${
                        index === 3 && gallery.length > 4
                          ? 'after:absolute after:inset-0 after:bg-midnight/35 after:content-[""]'
                          : ''
                      }`}
                    >
                      <Image
                        src={resolveImageSrcFromProperty(img.url)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 240px, 50vw"
                        className="object-cover"
                      />
                      {index === 3 && gallery.length > 4 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                          +{gallery.length - 4} more
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <InfoTile icon={Wallet} label="Price" value={formatCurrency(property.price)} />
              <InfoTile icon={Ruler} label="Size" value={size} />
              <InfoTile
                icon={Tag}
                label="Listing"
                value={getListingTypeLabel(property.listingType)}
              />
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
              <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-primary">
                  <Sparkles className="h-4 w-4" />
                  Property details
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-midnight">Description</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">
                  {property.description}
                </p>
              </section>

              <aside className="rounded-[28px] border border-stone-200 bg-stone-50 p-6 shadow-brand-sm sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-primary">
                  <BadgeInfo className="h-4 w-4" />
                  Quick facts
                </div>

                <dl className="mt-5 space-y-4">
                  <Fact label="Category" value={getPropertyCategoryLabel(property.category)} />
                  <Fact label="Status" value={getPropertyStatusLabel(property.status)} />
                  <Fact label="Listing type" value={getListingTypeLabel(property.listingType)} />
                  <Fact label="Location" value={location || 'Location not specified'} />
                  {property.reservationFeeOverride != null ? (
                    <Fact
                      label="Reservation fee"
                      value={formatCurrency(property.reservationFeeOverride)}
                    />
                  ) : null}
                  <Fact label="Property ID" value={property.id.slice(0, 12).toUpperCase()} />
                </dl>
              </aside>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-primary">
                Asking price
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-midnight sm:text-5xl">
                {formatCurrency(property.price)}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This listing is currently{' '}
                <span className="font-semibold text-midnight">
                  {getPropertyStatusLabel(property.status).toLowerCase()}
                </span>
                . Reach out if you want more details or a viewing.
              </p>

              <div className="mt-6">
                <SavePropertyButton property={property} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniStat label="Status" value={getPropertyStatusLabel(property.status)} />
                <MiniStat label="Category" value={getPropertyCategoryLabel(property.category)} />
                <MiniStat label="Type" value={getListingTypeLabel(property.listingType)} />
                <MiniStat label="Size" value={size} />
              </div>

              <div className="mt-6 space-y-3">
                <ActionRow label="Property ID" value={property.id.slice(0, 8).toUpperCase()} />
                <ActionRow label="Created" value={new Date(property.createdAt).toLocaleDateString()} />
                <ActionRow label="Updated" value={new Date(property.updatedAt).toLocaleDateString()} />
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href={`/booking?propertyId=${encodeURIComponent(property.id)}`}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold-primary px-5 text-sm font-semibold text-midnight transition hover:bg-gold-deep"
                >
                  Book this property
                </Link>
                <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Contact Agent
                </button>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(location || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-stone-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  View on Maps
                </a>
              </div>

              <div className="mt-8 rounded-3xl bg-stone-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Location summary
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {location || 'Location not specified'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-brand-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-50 text-gold-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-midnight">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-midnight">{value}</dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-midnight">{value}</p>
    </div>
  );
}

function ActionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-midnight">{value}</span>
    </div>
  );
}
