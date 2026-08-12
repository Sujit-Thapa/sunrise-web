import Link from 'next/link';

import HeroSection from '@/components/sections/HeroSection';
import PropertyCard from '@/components/ui/PropertyCard';
import { api } from '@/lib/api';

import type {
  PropertyResponseDto,
  PropertiesListResponseDto,
} from '@/types';

export default async function Home() {
  let properties: PropertyResponseDto[] = [];
  let loadError: string | null = null;

  try {
    const response =
      await api.get<PropertiesListResponseDto>('/v1/properties');

    properties = Array.isArray(response?.items)
      ? response.items
      : [];
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : 'Property listings are temporarily unavailable.';
  }

  return (
    <main>
      <HeroSection properties={properties} />

      <section className="border-t border-stone-200/80 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
              Featured homes
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-midnight md:text-4xl">
              Thoughtful listings for people who value clarity.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Browse a quieter collection of properties with a cleaner layout and faster path to the details that matter.
            </p>
            {loadError ? (
              <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Live listings are unavailable right now. The site is still available while the feed recovers.
              </div>
            ) : null}
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-stone-200 bg-white px-8 py-14 text-center text-slate-500 shadow-brand-sm">
              No properties are available right now.
            </div>
          )}

          <div className="mt-14 flex justify-center">
            <Link
              href="/properties"
              className="rounded-full border border-stone-200 bg-white px-8 py-4 text-sm font-medium text-midnight shadow-brand-sm transition hover:border-stone-300 hover:shadow-brand-md"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
