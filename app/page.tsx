import HeroSection from '@/components/sections/HeroSection';
import PropertyCard from '@/components/ui/PropertyCard';
import { properties } from '@/lib/data/properties';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 mt-20 text-center">
            <div className="mb-5 flex items-center justify-center gap-8">
              <span className="h-px w-14 bg-gold-primary" />
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-primary">Our Services</p>
              <span className="h-px w-14 bg-gold-primary" />
            </div>
            <h2 className="text-3xl font-normal tracking-wide text-midnight md:text-4xl">The smartest way to buy a home</h2>
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
