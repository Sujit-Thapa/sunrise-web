'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import PropertyCard from '@/components/ui/PropertyCard';
import { api } from '@/lib/api';
import type { PropertiesListResponseDto, Property as ApiProperty } from '@/types';
import Link from 'next/link';

export default function Home() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { properties: apiProperties } = await api.get<PropertiesListResponseDto>('/v1/properties');
        setProperties(apiProperties);
      } catch {
        setProperties([]);
      }
    };

    loadProperties();
  }, []);

  return (
    <div>
      <HeroSection properties={properties} />
      <section className="bg-white ">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 mt-20 text-center">
            <h2 className="text-3xl font-normal tracking-wide text-midnight md:text-4xl">The smartest way to buy a property</h2>
          </div>
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="mt-20 flex justify-center">
            <Link href="/properties" className="rounded-full border border-ink/10 bg-white px-10 py-5 text-base font-bold text-midnight shadow-sm transition-all duration-250 hover:border-gold-primary hover:text-gold-primary hover:shadow-gold-md">
              View All Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
