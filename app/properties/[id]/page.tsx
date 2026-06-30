import Image from 'next/image';
import { notFound } from 'next/navigation';
import { properties as fallbackProperties } from '@/lib/data/properties';
import type { Property } from '@/types';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = params;
  let property: Property | null = null;

  try {
    const response = await fetch(`/api/properties/${id}`, { cache: 'no-store' });
    if (response.ok) {
      property = await response.json();
    }
  } catch {
    // ignore and fallback to local static data below
  }

  if (!property) {
    property = fallbackProperties.find((p) => p.id === id) ?? null;
  }

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-96 md:h-[500px]">
            <Image
              src={property.image}
              alt={property.title}
              fill
              sizes="(min-width: 768px) 1280px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {property.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{property.location}</p>
            <p className="text-4xl font-bold text-pink-500 mb-6">
              ${property.price.toLocaleString()}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{property.bedrooms}</p>
                <p className="text-gray-600">Bedrooms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{property.bathrooms}</p>
                <p className="text-gray-600">Bathrooms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{property.area}</p>
                <p className="text-gray-600">Sq Ft</p>
              </div>
            </div>
            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
            <div className="mt-8">
              <button className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors text-lg font-semibold">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
