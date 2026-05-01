import Image from 'next/image';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-brand-lg bg-gray-100">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge */}
        {property.badge && (
          <span className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-800 shadow-sm">
            {property.badge}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="pt-6">
        {/* Title + Price */}
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="min-w-0 text-xl font-normal leading-snug text-midnight">
            {property.title}
          </h3>
          <span className="whitespace-nowrap text-xl font-medium text-gold-primary">
            ${property.price.toLocaleString()}
          </span>
        </div>

        {/* Location */}
        <p className="mb-4 text-base text-slate-500">{property.location}</p>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
          {/* Beds */}
          <span className="flex items-center gap-1.5">
            <BedIcon />
            {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
          </span>
          {/* Baths */}
          <span className="flex items-center gap-1.5">
            <BathIcon />
            {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
          </span>
          {/* Area */}
          <span className="flex items-center gap-1.5">
            <AreaIcon />
            {property.area.toLocaleString()} sqft
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline SVG Icons ─────────────────────────────────────────── */

function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3" />
      <path d="M3 9h18v8H3z" />
      <path d="M3 17v2" />
      <path d="M21 17v2" />
      <path d="M3 13h18" />
      <path d="M9 9v4" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" y1="5" x2="8" y2="7" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="7" y1="19" x2="7" y2="21" />
      <line x1="17" y1="19" x2="17" y2="21" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}
