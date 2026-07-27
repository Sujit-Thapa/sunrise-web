import Image from 'next/image';
import type { PropertyResponseDto } from '@/types';

interface PropertyCardProps {
  property: PropertyResponseDto;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const images = Array.isArray(property.images) ? property.images : [];
  const primaryImage =
    images.find((image) => image.isPrimary) ??
    [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  const location = [property.street, property.city, property.state, property.country]
    .filter(Boolean)
    .join(', ');

  const price = Number(property.price);
  const area = property.areaSize != null ? Number(property.areaSize) : null;

  return (
    <div className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-brand-lg bg-gray-100">
        <Image
          src={primaryImage?.url || '/images/sunrise.png'}
          alt={property.title || 'Property'}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {property.listingType ? (
          <span className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase text-gray-800 shadow-sm">
            {property.listingType}
          </span>
        ) : null}
      </div>

      <div className="pt-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="min-w-0 text-xl font-normal leading-snug text-midnight">
            {property.title || 'Untitled property'}
          </h3>

          <span className="whitespace-nowrap text-xl font-medium text-gold-primary">
            Rs. {Number.isFinite(price) ? price.toLocaleString('en-US') : '0'}
          </span>
        </div>

        <p className="mb-4 text-base text-slate-500">{location || 'Location not provided'}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
          {area != null && Number.isFinite(area) ? (
            <span className="flex items-center gap-1.5">
              <AreaIcon />
              {area.toLocaleString('en-US')} {property.areaUnit ?? ''}
            </span>
          ) : null}

          {property.category ? <span className="capitalize">{property.category}</span> : null}

          {property.status ? (
            <span className="capitalize">{String(property.status).toLowerCase()}</span>
          ) : null}
        </div>
      </div>
    </div>
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