import Image from 'next/image';
import Link from 'next/link';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>
        <p className="text-gray-600 mb-2">{property.location}</p>
        <p className="text-2xl font-bold text-blue-600 mb-2">
          ${property.price.toLocaleString()}
        </p>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.area} sq ft</span>
        </div>
        <Link
          href={`/properties/${property.id}`}
          className="block text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}