import PropertiesListing from '@/components/sections/PropertiesListing';
import { api } from '@/lib/api';

import type {
  PropertyResponseDto,
  PropertiesListResponseDto,
} from '@/types';

type PropertiesApiResponse =
  PropertiesListResponseDto & {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };

export default async function Properties() {
  let properties: PropertyResponseDto[] = [];
  let total = 0;

  try {
    const response =
      await api.get<PropertiesApiResponse>(
        '/v1/properties',
      );

    properties = Array.isArray(response?.items)
      ? response.items
      : [];

    total =
      response?.pagination?.total ??
      response?.total ??
      properties.length;
  } catch (error) {
    console.error(
      'Failed to fetch properties:',
      error,
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[68px]">
      <PropertiesListing
        properties={properties}
        total={total}
      />
    </div>
  );
}