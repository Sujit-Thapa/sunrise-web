import Image from 'next/image';
import Link from 'next/link';
import { House } from 'lucide-react';

import { getPropertyImageSource, resolveImageSrc } from '@/lib/image';
import { formatArea, formatCurrency, getListingTypeLabel } from '@/lib/properties';
import type { PropertyResponseDto, UserPropertyResponseDto } from '@/types';

interface PropertyCardProps {
  property: PropertyResponseDto | UserPropertyResponseDto;
  href: string;
  owner?: string;
  sizes?: string;
}

export default function PropertyCard({ property, href, owner, sizes = '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' }: PropertyCardProps) {
  const image = getPropertyImageSource(property);
  const location = [property.street, property.city].filter(Boolean).join(', ') || property.country;
  const area = property.areaSize != null ? formatArea(property.areaSize, property.areaUnit) : null;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[26px] border border-transparent bg-white transition duration-200 hover:-translate-y-1 hover:border-[#e3cfc4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cc7654]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#e8e4db]">
        {image ? (
          <Image src={resolveImageSrc(image)} alt={property.title || 'Property'} fill sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-stone-400">
            <House aria-hidden="true" size={42} strokeWidth={1} />
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}
      </div>

      <div className="px-[23px] pb-4 pt-4">
        <p className="text-[22px] font-bold leading-tight text-[#cc7654] transition-colors duration-200 group-hover:text-[#b5583a]">{formatCurrency(property.price).replace(' ', '\u00a0')}</p>
        <h3 className="mt-1.5 truncate text-lg font-bold leading-tight text-[#2a2723] transition-colors duration-200 first-letter:uppercase group-hover:text-[#cc7654]">
          {property.title || 'Untitled property'}
        </h3>
        {owner ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
            <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8e4db] text-[10px]">{owner.charAt(0)}</span>
            <span className="truncate">{owner}</span>
          </p>
        ) : null}
        <p className="mt-1 truncate text-xs font-medium tracking-[0.01em] text-[#989898]">{location || 'Location not provided'}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[#e8e4db] pt-2 text-base tracking-[0.01em] text-[#7e7e7e]">
          <span>{area ?? property.category}</span>
          <span>{getListingTypeLabel(property.listingType)}</span>
        </div>
      </div>
    </Link>
  );
}
