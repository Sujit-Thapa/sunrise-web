'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Property } from '@/types';

const KATHMANDU_CENTER: [number, number] = [85.324, 27.7172];

interface PropertiesListingProps {
  properties: Property[];
}

export default function PropertiesListing({ properties }: PropertiesListingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="grid min-h-[calc(100vh-68px)] grid-cols-1 bg-white lg:grid-cols-[minmax(0,50vw)_minmax(320px,1fr)]">
      <section className="relative min-h-[520px] overflow-hidden border-r border-slate-200 bg-slate-50 lg:min-h-[calc(100vh-68px)]">
        <PropertiesMap properties={properties} hoveredId={hoveredId} onHoverChange={setHoveredId} />
        <SearchPanel />
      </section>

      <section className="px-5 py-8 sm:px-8 lg:max-h-[calc(100vh-68px)] lg:overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{properties.length} Properties Found</h1>
          <p className="mt-2 text-base text-slate-500">Showing results for Kathmandu, Nepal</p>
        </div>

        <div className="space-y-5">
          {properties.map((property) => (
            <PropertyResult
              key={property.id}
              property={property}
              isHovered={hoveredId === property.id}
              onHoverChange={setHoveredId}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function PropertiesMap({
  properties,
  hoveredId,
  onHoverChange,
}: {
  properties: Property[];
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const markerEls = useRef<Map<string, HTMLElement>>(new Map());
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState('');

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const mapMessage = mapboxToken ? mapError : 'Mapbox token is missing.';

  useEffect(() => {
    markerEls.current.forEach((element, id) => {
      const label = element.querySelector('[data-role="label"]') as HTMLElement | null;
      const dot = element.querySelector('[data-role="dot"]') as HTMLElement | null;
      const active = id === hoveredId;

      element.classList.toggle('translate-y-[-4px]', active);
      label?.classList.toggle('bg-[#f5b931]', active);
      label?.classList.toggle('text-white', active);
      label?.classList.toggle('shadow-[0_10px_28px_rgba(13,27,42,0.4)]', active);
      label?.classList.toggle('scale-105', active);
      dot?.classList.toggle('scale-125', active);
      dot?.classList.toggle('shadow-[0_8px_20px_rgba(13,27,42,0.3)]', active);
    });
  }, [hoveredId]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    const mappedProperties = properties.filter(
      (property): property is Property & { coordinates: [number, number] } => Boolean(property.coordinates),
    );

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: mappedProperties[0]?.coordinates ?? KATHMANDU_CENTER,
      zoom: 12,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    const addMarkers = () => {
      map.resize();
      const bounds = new mapboxgl.LngLatBounds();

      mappedProperties.forEach((property) => {
        bounds.extend(property.coordinates);

        const element = createPriceMarker(property);
        element.addEventListener('mouseenter', () => onHoverChange(property.id));
        element.addEventListener('mouseleave', () => onHoverChange(null));

        markerEls.current.set(property.id, element);

        const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
          .setLngLat(property.coordinates)
          .addTo(map);
        markersRef.current.push(marker);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 140, right: 80, bottom: 80, left: 80 },
          maxZoom: 14,
          duration: 0,
        });
      }
    };

    const handleError = () => {
      setMapError('Mapbox could not load the map. Check the public token and allowed URLs.');
    };

    const resizeMap = () => map.resize();
    const resizeTimer = window.setTimeout(resizeMap, 250);

    map.once('load', addMarkers);
    map.on('error', handleError);
    window.addEventListener('resize', resizeMap);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', resizeMap);
      map.off('error', handleError);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      markerEls.current.clear();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, properties]);

  return (
    <div className="absolute inset-0 bg-slate-200">
      <div ref={mapContainer} className="h-full w-full" />
      {mapMessage ? (
        <div className="absolute inset-x-6 bottom-6 z-20 rounded-brand-md bg-white p-4 text-sm font-semibold text-slate-600 shadow-xl">
          {mapMessage}
        </div>
      ) : null}
    </div>
  );
}

function SearchPanel() {
  const fields = [
    { label: 'Location', value: 'Where are you looking?' },
    { label: 'Property Type', value: 'All Types', showChevron: true },
    { label: 'Price Range', value: 'Any Price' },
  ];

  return (
    <div className="absolute left-4 right-4 top-5 z-30 rounded-full bg-white shadow-xl sm:left-6 sm:right-6">
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 p-2 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="min-w-0 px-5 md:hidden">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Location</p>
          <p className="mt-1 truncate text-sm font-bold text-slate-500">Where are you looking?</p>
        </div>
        {fields.map((field) => (
          <SearchField key={field.label} label={field.label} value={field.value} showChevron={field.showChevron} />
        ))}
        <button
          aria-label="Search properties"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-primary text-white transition-colors duration-200 hover:bg-gold-deep"
        >
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SearchField({
  label,
  value,
  showChevron = false,
}: {
  label: string;
  value: string;
  showChevron?: boolean;
}) {
  return (
    <div className="hidden min-w-0 border-r border-slate-200 px-6 py-2 last:border-r-0 md:block">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-bold text-slate-500">{value}</p>
        {showChevron ? (
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0 text-slate-800">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    </div>
  );
}

function createPriceMarker(property: Property): HTMLAnchorElement {
  const marker = document.createElement('a');
  marker.href = `/properties/${property.id}`;
  marker.ariaLabel = `View ${property.title}`;
  marker.className = 'group flex cursor-pointer flex-col items-center text-slate-800 no-underline';
  marker.innerHTML = `
    <span data-role="label" class="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold shadow-[0_10px_24px_rgba(13,27,42,0.2)] transition duration-200">$${property.price.toLocaleString()}</span>
    <span data-role="dot" class="mt-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#f5b931] shadow-[0_6px_16px_rgba(13,27,42,0.2)] transition duration-200"></span>
  `;
  return marker;
}

function PropertyResult({
  property,
  isHovered,
  onHoverChange,
}: {
  property: Property;
  isHovered: boolean;
  onHoverChange: (id: string | null) => void;
}) {
  return (
    <Link
      href={`/properties/${property.id}`}
      onMouseEnter={() => onHoverChange(property.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={`grid grid-cols-[124px_1fr] gap-5 rounded-brand-lg border bg-white p-4 transition-all duration-200 sm:grid-cols-[150px_1fr] ${
        isHovered ? 'border-gold-highlight shadow-brand-md' : 'border-slate-100 hover:border-gold-highlight hover:shadow-brand-md'
      }`}
    >
      <div className="relative h-28 overflow-hidden rounded-brand-md bg-slate-100 sm:h-32">
        <Image src={property.image} alt={property.title} fill sizes="150px" className="object-cover" />
      </div>
      <div className="min-w-0 py-1">
        <h2 className="truncate text-lg font-medium text-slate-800">{property.title}</h2>
        <p className="mt-2 truncate text-base text-slate-400">{property.location}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>
            {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
          </span>
          <span>
            {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
          </span>
          <span>{property.area.toLocaleString()} sqft</span>
        </p>
        <p className="mt-3 text-lg font-medium text-gold-primary">${property.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}