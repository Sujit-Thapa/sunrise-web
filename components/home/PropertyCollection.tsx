import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, House } from 'lucide-react';
import { getPropertyImageSource, resolveImageSrc } from '@/lib/image';
import { formatArea, getListingTypeLabel } from '@/lib/properties';
import type { PropertyResponseDto, UserPropertyResponseDto } from '@/types';

type Listing = PropertyResponseDto | UserPropertyResponseDto;

export default function PropertyCollection({ id, eyebrow, title, properties, href, marketplace = false, inset = false, error = false }: {
  id: string; eyebrow: string; title: string; properties: Listing[]; href: string; marketplace?: boolean; inset?: boolean; error?: boolean;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={`mx-auto px-5 py-12 sm:px-8 sm:py-16 ${inset ? 'max-w-[1248px]' : 'max-w-6xl'}`}>
      <div className={inset ? 'bg-[#e9e6dd] px-5 py-10 sm:px-10 sm:py-14' : ''}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-[#ca7653]">{eyebrow}</p>
            <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight text-[#2c2925] sm:text-3xl">{title}</h2>
          </div>
          <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-[#2c2925] transition hover:text-[#ca7653]">{marketplace ? 'View Marketplace' : 'View Gallery'}<ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
        {error ? (
          <p role="status" className="rounded-2xl border border-stone-200 bg-white/70 p-8 text-sm text-stone-600">Listings are temporarily unavailable. Please try the gallery again shortly.</p>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-8 text-center">
            <House aria-hidden="true" className="mx-auto mb-3 h-7 w-7 text-[#ca7653]" />
            <p className="font-medium text-stone-700">{marketplace ? 'No marketplace properties available yet.' : 'New properties are on the way.'}</p>
            <p className="mt-2 text-sm text-stone-500">{marketplace ? 'Have a property to share? Submit it for review in the marketplace.' : 'Check back for available Sunrise listings, or contact us about your search.'}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {properties.map((property) => <CollectionCard key={property.id} property={property} marketplace={marketplace} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionCard({ property, marketplace }: { property: Listing; marketplace: boolean }) {
  const image = getPropertyImageSource(property);
  return (
    <Link href={`/${marketplace ? 'marketplace' : 'properties'}/${property.id}`} className="group block overflow-hidden rounded-[22px] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ca7653]">
      <div className="relative aspect-square overflow-hidden bg-[#e9e6dd]">
        {image ? <Image src={resolveImageSrc(image)} alt={property.title} fill sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-stone-400"><House aria-hidden="true" size={42} strokeWidth={1} /><span className="text-xs">Photo coming soon</span></div>}
      </div>
      <div className="p-4">
        <p className="text-xl font-medium text-[#ca7653]">Rs. {Number(property.price).toLocaleString('en-IN')}</p>
        <h3 className="mt-1 truncate text-sm font-bold text-[#2c2925]">{property.title}</h3>
        <p className="mt-1 truncate text-xs text-stone-400">{[property.street, property.city].filter(Boolean).join(', ') || property.country}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#e9e6dd] pt-2 text-xs text-stone-500">
          <span>{property.areaSize != null ? formatArea(property.areaSize, property.areaUnit) : property.category}</span>
          <span>{getListingTypeLabel(property.listingType)}</span>
        </div>
      </div>
    </Link>
  );
}
