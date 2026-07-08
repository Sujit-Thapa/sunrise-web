import PropertiesListing from '@/components/sections/PropertiesListing';
import { properties as fallbackProperties } from '@/lib/data/properties';
import type { Property } from '@/types';

export default async function Properties() {
  let properties: Property[] = fallbackProperties;

  try {
    const response = await fetch('/api/properties', { cache: 'no-store' });
    if (response.ok) properties = await response.json();
  } catch {}

  return <div className="min-h-screen bg-white pt-[68px]"><PropertiesListing properties={properties} /></div>;
}
