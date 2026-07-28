import Image from 'next/image';
import Link from 'next/link';
import type { PropertyResponseDto } from '@/types';
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

interface PropertyCardProps {
  property: PropertyResponseDto;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = getPrimaryImage(property.images);
  const location = formatLocation(property);
  const price = formatCurrency(property.price);
  const area = formatArea(property.areaSize, property.areaUnit);
  const listingTypeLabel = getListingTypeLabel(property.listingType);
  const statusLabel = getPropertyStatusLabel(property.status);

  return (
    <article className="group relative overflow-hidden rounded-brand-lg border border-slate-100 bg-white shadow-brand-sm transition-all duration-250 hover:-translate-y-1 hover:border-gold-highlight/50 hover:shadow-brand-md">
      <div className="absolute right-4 top-4 z-20">
        <SavePropertyButton property={property} />
      </div>

      <Link
        href={`/properties/${property.id}`}
        className="absolute inset-0 z-10 rounded-brand-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2"
        aria-label={`View ${property.title || 'property details'}`}
      />

      <div className="relative z-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={primaryImage?.url || '/images/sunrise.png'}
            alt={property.title || 'Property'}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-midnight/35 via-transparent to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-midnight shadow-brand-sm backdrop-blur">
              {listingTypeLabel}
            </span>

            {property.category ? (
              <span className="rounded-full bg-midnight/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                {getPropertyCategoryLabel(property.category)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-medium leading-snug text-midnight">
                {property.title || 'Untitled property'}
              </h3>
              <p className="mt-1 truncate text-sm text-slate-500">
                {location || 'Location not provided'}
              </p>
            </div>

            <span className="shrink-0 whitespace-nowrap text-lg font-semibold text-gold-primary">
              {price}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <AreaIcon />
              {area}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function AreaIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}
