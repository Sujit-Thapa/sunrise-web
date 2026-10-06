import Image from 'next/image';
import Link from 'next/link';

import { resolveImageSrcFromProperty } from '@/lib/image';
import { formatArea, formatCurrency, formatLocation } from '@/lib/properties';
import type { PropertyResponseDto } from '@/types';

interface PropertyCardProps {
  property: PropertyResponseDto;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const location = formatLocation(property);
  const price = formatCurrency(property.price);
  const area = formatArea(property.areaSize, property.areaUnit);

  return (
    <article className="group overflow-hidden rounded-[30px] bg-white transition-colors duration-200 hover:bg-[#fdfcfb]">
      <Link
        href={`/properties/${property.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ce7c57] focus-visible:ring-inset"
        aria-label={`View ${property.title || 'property details'}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={resolveImageSrcFromProperty(property)}
            alt={property.title || 'Property'}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="px-7 pb-6 pt-5 sm:px-7">
          <p className="text-[1.65rem] font-bold leading-tight tracking-tight text-[#cf7654]">{price}</p>
          <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-[#2a2927]">
            {property.title || 'Untitled property'}
          </h3>
          <p className="mt-1 text-sm font-medium text-stone-400">
            {location || 'Location not provided'}
          </p>
          <div className="mt-2.5 border-t border-stone-200 pt-2.5">
            <p className="text-base font-medium tracking-tight text-stone-500">{area}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
