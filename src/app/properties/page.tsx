import PropertyCard from '../../components/PropertyCard';
import SearchBar from '../../components/SearchBar';
import { properties } from '../../data/properties';

export default function Properties() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            All Properties
          </h1>
          <SearchBar />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}