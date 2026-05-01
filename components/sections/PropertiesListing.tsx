'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Property } from '@/types';

const KATHMANDU_CENTER: [number, number] = [85.324, 27.7172];

interface PropertiesListingProps {
  properties: Property[];
}

export default function PropertiesListing({ properties }: PropertiesListingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="grid min-h-[calc(100vh-68px)] grid-cols-1 bg-white lg:grid-cols-[50vw_1fr]">
      <section className="relative min-h-[520px] overflow-hidden border-r border-slate-200 bg-slate-50 lg:min-h-[calc(100vh-68px)]">
        <PropertiesMap
          properties={properties}
          hoveredId={hoveredId}
          onHoverChange={setHoveredId}
        />
        <SearchPanel />
        <style jsx global>{`
          .sunrise-map-price-marker {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            color: #1e293b;
            text-decoration: none;
            transform-origin: bottom center;
            transition: transform 180ms ease;
          }

          .sunrise-map-price-marker:hover {
            transform: translateY(-4px);
          }

          .sunrise-map-price-label {
            display: block;
            border-radius: 9999px;
            background: #ffffff;
            padding: 8px 14px;
            font-size: 14px;
            font-weight: 600;
            line-height: 1;
            box-shadow: 0 10px 24px rgba(13, 27, 42, 0.2);
            white-space: nowrap;
            transition: background 0.18s ease, color 0.18s ease,
              box-shadow 0.18s ease, transform 0.18s ease;
          }

          .sunrise-map-price-dot {
            display: block;
            width: 14px;
            height: 14px;
            margin-top: 8px;
            border: 2px solid #ffffff;
            border-radius: 9999px;
            background: #F5B931;
            box-shadow: 0 6px 16px rgba(236, 72, 153, 0.2);
            transition: transform 0.18s ease, box-shadow 0.18s ease;
          }

          /* Highlighted state applied via JS when hoveredId matches */
          .sunrise-map-price-marker.is-highlighted .sunrise-map-price-label {
            background: #F5B931;
            color: #ffffff;
            box-shadow: 0 10px 28px rgba(13, 27, 42, 0.4);
            transform: translateY(-4px) scale(1.06);
          }

          .sunrise-map-price-marker.is-highlighted .sunrise-map-price-dot {
            transform: scale(1.3);
            box-shadow: 0 8px 20px rgba(13, 27, 42, 0.3);
          }
        `}</style>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:max-h-[calc(100vh-68px)] lg:overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {properties.length} Properties Found
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Showing results for Kathmandu, Nepal
          </p>
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  // Map from property id → marker element for fast highlight lookups
  const markerEls = useRef<Map<string, HTMLElement>>(new Map());
  const [mapError, setMapError] = useState('');

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const mapMessage = mapboxToken ? mapError : 'Mapbox token is missing.';

  // Sync highlighted class whenever hoveredId changes — no map re-init needed
  useEffect(() => {
    markerEls.current.forEach((el, id) => {
      el.classList.toggle('is-highlighted', id === hoveredId);
    });
  }, [hoveredId]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    const mappedProperties = properties.filter(
      (property): property is Property & { coordinates: [number, number] } =>
        Boolean(property.coordinates)
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

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    const addMarkers = () => {
      map.resize();
      const bounds = new mapboxgl.LngLatBounds();

      mappedProperties.forEach((property) => {
        bounds.extend(property.coordinates);

        const el = createPriceMarker(property);

        // Pin hover → lift hoveredId into shared state
        el.addEventListener('mouseenter', () => onHoverChange(property.id));
        el.addEventListener('mouseleave', () => onHoverChange(null));

        markerEls.current.set(property.id, el);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
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
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, properties]);

  return (
    <div className="absolute inset-0 bg-slate-200">
      <div ref={mapContainer} className="h-full w-full" />
      {mapMessage && (
        <div className="absolute inset-x-6 bottom-6 z-20 rounded-brand-md bg-white p-4 text-sm font-semibold text-slate-600 shadow-xl">
          {mapMessage}
        </div>
      )}
    </div>
  );
}

function SearchPanel() {
  return (
    <div className="absolute left-4 right-4 top-5 z-30 rounded-full bg-white shadow-xl sm:left-6 sm:right-6">
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 p-2 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="min-w-0 px-5 md:hidden">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Location</p>
          <p className="mt-1 truncate text-sm font-bold text-slate-500">Where are you looking?</p>
        </div>
        <SearchField label="Location" value="Where are you looking?" />
        <SearchField label="Property Type" value="All Types" showChevron />
        <SearchField label="Price Range" value="Any Price" />
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
        {showChevron && (
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0 text-slate-800">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

function createPriceMarker(property: Property): HTMLAnchorElement {
  const marker = document.createElement('a');
  marker.href = `/properties/${property.id}`;
  marker.ariaLabel = `View ${property.title}`;
  marker.className = 'sunrise-map-price-marker';
  marker.innerHTML = `
    <span class="sunrise-map-price-label">$${property.price.toLocaleString()}</span>
    <span class="sunrise-map-price-dot"></span>
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
      className={[
        'grid grid-cols-[124px_1fr] gap-5 rounded-brand-lg border bg-white p-4',
        'transition-all duration-200 sm:grid-cols-[150px_1fr]',
        isHovered
          ? 'border-gold-highlight shadow-brand-md'
          : 'border-slate-100 hover:border-gold-highlight hover:shadow-brand-md',
      ].join(' ')}
    >
      <div className="relative h-28 overflow-hidden rounded-brand-md bg-slate-100 sm:h-32">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="150px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 py-1">
        <h2 className="truncate text-lg font-medium text-slate-800">{property.title}</h2>
        <p className="mt-2 truncate text-base  text-slate-400">{property.location}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm  text-slate-500">
          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          <span>{property.area.toLocaleString()} sqft</span>
        </p>
        <p className="mt-3 text-lg font-medium text-gold-primary">
          ${property.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}