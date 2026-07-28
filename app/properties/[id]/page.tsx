import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Ruler, Sparkles, Tag, Wallet, BadgeInfo, ImageOff } from 'lucide-react';

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
import type { PropertyResponseDto } from '@/types';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

function locationLabel(property: PropertyResponseDto): string {
  return formatLocation(property);
}

function sizeLabel(property: PropertyResponseDto): string {
  return formatArea(property.areaSize, property.areaUnit);
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  RESERVED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  HIDDEN: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200',
  DRAFT: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200',
  COMPLETED: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
};

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = params;
  let property: PropertyResponseDto | null = null;

  try {
    property = await propertiesApi.findOne(id);
  } catch {
    property = null;
  }

  if (!property) {
    notFound();
  }

  const hero = getPrimaryImage(property.images);
  const gallery = property.images.filter((img) => img.id !== hero?.id);
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
                {hero ? (
                  <Image
                    src={hero.url}
                    alt={property.title}
                    fill
                    sizes="(min-width: 1024px) 900px, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-stone-400">
                    <ImageOff className="h-8 w-8" />
                    <p className="text-sm font-medium">No image available</p>
                  </div>
                )}

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
                        index === 3 && gallery.length > 4 ? 'after:absolute after:inset-0 after:bg-midnight/35 after:content-[""]' : ''
                      }`}
                    >
                      <Image src={img.url} alt="" fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover" />
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
                <p className="mt-3 text-sm leading-7 text-slate-600">{location || 'Location not specified'}</p>
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

function ActionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-midnight">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-midnight">{value}</p>
    </div>
  );
}
