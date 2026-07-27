import Image from 'next/image';
import { notFound } from 'next/navigation';
import { propertiesApi } from '@/lib/backend';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
  getPrimaryImage,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type { PropertyResponseDto } from '@/types';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

function locationLabel(property: PropertyResponseDto): string {
  return formatLocation(property);
}

function sizeLabel(property: PropertyResponseDto): string {
  return formatArea(property.areaSize, property.areaUnit);
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  RESERVED: 'bg-amber-50 text-amber-700',
  HIDDEN: 'bg-stone-100 text-stone-500',
  DRAFT: 'bg-stone-100 text-stone-500',
  COMPLETED: 'bg-sky-50 text-sky-700',
};

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = params;
  let property: PropertyResponseDto | null = null;

  try {
    property = await propertiesApi.findOne(id);
  } catch {
    property = null;
  }

  if (!property) {
    notFound();
  }

  const hero = getPrimaryImage(property.images);
  const gallery = property.images.filter((img) => img.id !== hero?.id);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfaf6_0%,#ffffff_100%)]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="relative h-96 md:h-[500px] bg-stone-100">
            {hero ? (
              <Image
                src={hero.url}
                alt={property.title}
                fill
                sizes="(min-width: 768px) 1280px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                No image available
              </div>
            )}

            <span
              className={`absolute left-6 top-6 rounded-full px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] ${statusStyles[property.status] ?? 'bg-stone-100 text-stone-500'}`}
            >
              {getPropertyStatusLabel(property.status)}
            </span>
          </div>

          {gallery.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white p-3">
              {gallery.map((img) => (
                <div key={img.id} className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  <Image src={img.url} alt="" fill sizes="112px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="p-8 sm:p-10">
            <p className="mb-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#B89B4E]">
              {property.category} · {getListingTypeLabel(property.listingType)}
            </p>
            <h1 className="mb-3 text-3xl font-semibold text-stone-900 sm:text-4xl">{property.title}</h1>
            <p className="mb-6 text-lg text-stone-500">{locationLabel(property) || 'Location not specified'}</p>
            <p className="mb-8 text-4xl font-semibold text-stone-900">{formatCurrency(property.price)}</p>

            <div className="mb-8 grid grid-cols-2 gap-4 border-y border-stone-200 py-6 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-xl font-semibold text-stone-900">{sizeLabel(property)}</p>
                <p className="text-sm text-stone-500">Size</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold capitalize text-stone-900">{property.category}</p>
                <p className="text-sm text-stone-500">Category</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold capitalize text-stone-900">{property.listingType}</p>
                <p className="text-sm text-stone-500">Listing Type</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-stone-900">Description</h2>
              <p className="leading-relaxed text-stone-700">{property.description}</p>
            </div>

            {/*
              NOTE: there's no "contact agent" endpoint in the current API
              schema (the two open questions with your backend dev — a
              contact form endpoint and auth token storage — are still
              pending). This button is a placeholder until that endpoint
              exists; wire it up once confirmed.
            */}
            <button className="rounded-xl bg-[#B89B4E] px-8 py-3 text-lg font-semibold text-white shadow-sm shadow-[#B89B4E]/30 transition hover:bg-[#a3894a]">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
