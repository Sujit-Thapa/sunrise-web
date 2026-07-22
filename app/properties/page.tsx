import PropertiesListing from '@/components/sections/PropertiesListing';
import { api } from '@/lib/api';
import type { Property, PropertiesListResponseDto } from '@/types';

export default async function Properties() {
  let properties: Property[] = [];

  try {
    const { properties: apiProperties } = await api.get<PropertiesListResponseDto>('/v1/properties');
    properties = apiProperties;
  } catch {}

  return <div className="min-h-screen bg-white pt-[68px]"><PropertiesListing properties={properties} /></div>;
}
