import HeroSection from '../components/HeroSection';
import PropertyCard from '../components/PropertyCard';
import { properties } from '../data/properties';

export default function Home() {
  const featuredProperties = properties.slice(0, 3); // Show first 3 properties

  return (
    <div>
      <HeroSection />
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
