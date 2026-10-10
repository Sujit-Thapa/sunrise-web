import Link from 'next/link';
import { ArrowRight, House } from 'lucide-react';
import PropertyCard from '@/components/ui/PropertyCard';
import type { PropertyResponseDto, UserPropertyResponseDto } from '@/types';

type Listing = PropertyResponseDto | UserPropertyResponseDto;

export default function PropertyCollection({ id, eyebrow, title, properties, href, marketplace = false, inset = false, error = false }: {
  id: string; eyebrow: string; title: string; properties: Listing[]; href: string; marketplace?: boolean; inset?: boolean; error?: boolean;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={inset ? 'mx-auto my-12 max-w-[1440px] bg-[#e8e4db] py-14 sm:my-16 sm:py-[95px]' : 'py-12 sm:py-16'}>
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 xl:px-0">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-1.5 text-sm font-bold tracking-[0.01em] text-[#cc7654]">{eyebrow}</p>
            <h2 id={`${id}-heading`} className="text-3xl font-bold tracking-[0.01em] text-[#2a2723] sm:text-4xl">{title}</h2>
          </div>
          <Link href={href} className="inline-flex items-center gap-2 text-lg font-semibold tracking-[0.01em] text-[#2a2723] transition hover:text-[#cc7654]">{marketplace ? 'View Marketplace' : 'View Gallery'}<ArrowRight aria-hidden="true" size={24} /></Link>
        </div>
        {error ? (
          <p role="status" className="rounded-2xl border border-stone-200 bg-white/70 p-8 text-sm text-stone-600">Listings are temporarily unavailable. Please try the gallery again shortly.</p>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-8 text-center">
            <House aria-hidden="true" className="mx-auto mb-3 h-7 w-7 text-[#cc7654]" />
            <p className="font-medium text-stone-700">{marketplace ? 'No marketplace properties available yet.' : 'New properties are on the way.'}</p>
            <p className="mt-2 text-sm text-stone-500">{marketplace ? 'Have a property to share? Submit it for review in the marketplace.' : 'Check back for available Sunrise listings, or contact us about your search.'}</p>
          </div>
        ) : (
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => <PropertyCard key={property.id} property={property} href={`/${marketplace ? 'marketplace' : 'properties'}/${property.id}`} sizes="(min-width: 1280px) 307px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />)}
          </div>
        )}
      </div>
    </section>
  );
}
