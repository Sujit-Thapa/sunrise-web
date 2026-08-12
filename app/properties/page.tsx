import PropertiesListing from '@/components/sections/PropertiesListing';
import { propertiesApi } from '@/lib/backend';

import type { PropertyListQueryParams, PropertyResponseDto } from '@/types';

type PropertiesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function singleValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseNumber(
  value: string | undefined,
): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function Properties({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = await searchParams;
  let properties: PropertyResponseDto[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const filters: PropertyListQueryParams = {
      city: singleValue(resolvedSearchParams.city),
      category: (() => {
        const raw = singleValue(resolvedSearchParams.category);
        if (!raw) return undefined;

        const normalized = raw.toUpperCase();
        return normalized === 'HOUSE' ||
          normalized === 'APARTMENT' ||
          normalized === 'LAND' ||
          normalized === 'COMMERCIAL'
          ? normalized
          : undefined;
      })(),
      listingType: (() => {
        const raw = singleValue(resolvedSearchParams.listingType);
        if (!raw) return undefined;
        const normalized = raw.toUpperCase();
        return normalized === 'SALE' || normalized === 'RENT'
          ? normalized
          : undefined;
      })(),
      minPrice: parseNumber(singleValue(resolvedSearchParams.minPrice)),
      maxPrice: parseNumber(singleValue(resolvedSearchParams.maxPrice)),
      page: 1,
      limit: 50,
    };

    const response = await propertiesApi.findAll(filters);
    properties = Array.isArray(response?.items) ? response.items : [];
    total = response?.pagination?.total ?? properties.length;
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : 'Property listings are temporarily unavailable.';
  }

  return (
    <div className="min-h-screen bg-white">
      <PropertiesListing
        properties={properties}
        total={total}
        searchQuery={singleValue(resolvedSearchParams.city) ?? ''}
        loadError={loadError}
      />
    </div>
  );
}
