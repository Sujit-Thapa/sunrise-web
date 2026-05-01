import PropertiesListing from '@/components/sections/PropertiesListing';
import { properties } from '@/lib/data/properties';

export default function Properties() {
  return (
    <div className="min-h-screen bg-white pt-[68px]">
      <PropertiesListing properties={properties} />
    </div>
  );
}
