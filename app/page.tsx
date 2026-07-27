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

  try {
    const response =
      await api.get<PropertiesListResponseDto>('/v1/properties');

    properties = Array.isArray(response?.items)
      ? response.items
      : [];
  } catch (error) {
    console.error('Failed to load homepage properties:', error);
  }

  return (
    <main>
      <HeroSection properties={properties} />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 mt-20 text-center">
            <h2 className="text-3xl font-normal tracking-wide text-midnight md:text-4xl">
              The smartest way to buy a property
            </h2>
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No properties are available right now.
            </div>
          )}

          <div className="mt-20 flex justify-center">
            <Link
              href="/properties"
              className="rounded-full border border-ink/10 bg-white px-10 py-5 text-base font-bold text-midnight shadow-sm transition-all duration-250 hover:border-gold-primary hover:text-gold-primary hover:shadow-gold-md"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}