'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import type { PropertyResponseDto } from '@/types';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getPropertyCategoryLabel,
  getListingTypeLabel,
} from '@/lib/properties';
import { resolveImageSrcFromProperty } from '@/lib/image';
import SavePropertyButton from '@/components/ui/SavePropertyButton';

const PROPERTY_TYPES = ['All Types', 'Apartment', 'House', 'Land', 'Commercial'];
const EMPTY_PROPERTIES: PropertyResponseDto[] = [];
const PRICE_RANGES = ['Any Price', 'Under Rs 50 L', 'Rs 50 L – 1 Cr', 'Rs 1 Cr – 2 Cr', 'Rs 2 Cr+'];

interface PropertiesListingProps {
  properties?: PropertyResponseDto[];
  total?: number;
  searchQuery?: string;
  loadError?: string | null;
}

export default function PropertiesListing({
  properties,
  total,
  searchQuery,
  loadError,
}: PropertiesListingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const searchParams = useSearchParams();
  const items = Array.isArray(properties) ? properties : EMPTY_PROPERTIES;
  const resultCount = total ?? items.length;
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `/properties?${params}`;
  };
  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    if (sort === 'price-asc') return Number(a.price) - Number(b.price);
    if (sort === 'price-desc') return Number(b.price) - Number(a.price);
    return sort === 'oldest' ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : Date.parse(b.createdAt) - Date.parse(a.createdAt);
  }), [items, sort]);

  return (
    <div className="grid grid-cols-1 bg-[#f8f6f1] text-[#2A2723] lg:h-svh lg:min-h-[724px] lg:grid-cols-[minmax(0,64fr)_minmax(390px,36fr)]">
      <section aria-label="Property map" className="relative min-h-[430px] overflow-hidden bg-[#a9d8e9] lg:min-h-0">
        <PropertiesMap properties={items} hoveredId={hoveredId} onHoverChange={setHoveredId} />
        <SearchPanel />
      </section>

      <section aria-label="Property results" className="min-w-0 px-5 py-6 sm:px-7 lg:overflow-y-auto lg:pt-[148px]">
        <div className="mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-xl font-bold">{searchQuery ? `${searchQuery} Properties` : 'Explore Properties'}{searchParams.get('listingType') === 'SALE' ? ' for Sale' : searchParams.get('listingType') === 'RENT' ? ' for Rent' : ''}</h1>
            <p className="text-sm text-stone-500">{resultCount.toLocaleString()} results</p>
          </div>
          <div className="mt-3 flex justify-end">
            <select aria-label="Sort properties on this page" value={sort} onChange={event => setSort(event.target.value)} className="rounded-full border-0 bg-white px-4 py-2 text-xs outline-offset-2 focus-visible:outline-[#ca7653]">
              <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {loadError ? (
            <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              We couldn’t load properties. Please refresh to try again.
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {items.length > 0 ? (
            sortedItems.map((property) => (
              <PropertyResult
                key={property.id}
                property={property}
                isHovered={hoveredId === property.id}
                onHoverChange={setHoveredId}
              />
            ))
          ) : !loadError ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-sm">
              <p className="text-lg font-medium text-slate-800">No properties available right now</p>
              <p className="mt-2 text-sm text-slate-500">
                Try again later or broaden your search once new listings are published.
              </p>
            </div>
          ) : null}
        </div>
        {!loadError && resultCount > 50 ? (
          <nav aria-label="Results pages" className="mt-6 flex items-center justify-between text-sm">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)} className="rounded-full bg-white px-4 py-2">Previous</Link> : <span />}
            <span className="text-stone-500">Page {currentPage} of {Math.ceil(resultCount / 50)}</span>
            {currentPage * 50 < resultCount ? <Link href={pageHref(currentPage + 1)} className="rounded-full bg-[#3E4A3D] px-4 py-2 text-white">Next</Link> : <span />}
          </nav>
        ) : null}
      </section>
    </div>
  );
}

function PropertiesMap({
  properties,
  hoveredId,
  onHoverChange,
}: {
  properties: PropertyResponseDto[];
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const markerEls = useRef<Map<string, HTMLElement>>(new Map());
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState('');

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const mapMessage = mapboxToken ? mapError : 'Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the live map.';

  useEffect(() => {
    markerEls.current.forEach((element, id) => {
      const label = element.querySelector('[data-role="label"]') as HTMLElement | null;
      const dot = element.querySelector('[data-role="dot"]') as HTMLElement | null;
      const active = id === hoveredId;

      element.classList.toggle('translate-y-[-4px]', active);
      label?.classList.toggle('bg-white', !active);
      label?.classList.toggle('bg-[#AC953E]', active);
      label?.classList.toggle('text-slate-800', !active);
      label?.classList.toggle('text-white', active);
      label?.classList.toggle('shadow-[0_10px_24px_rgba(13,27,42,0.2)]', !active);
      label?.classList.toggle('shadow-[0_10px_28px_rgba(13,27,42,0.4)]', active);
      label?.classList.toggle('scale-105', active);
      dot?.classList.toggle('scale-125', active);
      dot?.classList.toggle('shadow-[0_8px_20px_rgba(13,27,42,0.3)]', active);
    });
  }, [hoveredId]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    const container = mapContainer.current;

    // Strict Mode replays effects before the next frame. Avoid starting map
    // requests for that throwaway setup, then cancelling them immediately.
    let disposeMap: (() => void) | undefined;
    const setupFrame = window.requestAnimationFrame(() => {
      const mappedProperties = properties.filter((property) => {
        const latitude = Number(property.latitude);
        const longitude = Number(property.longitude);
        return Number.isFinite(latitude) && Number.isFinite(longitude);
      });

      mapboxgl.accessToken = mapboxToken;

      const firstProperty = mappedProperties[0];
      const initialCenter: [number, number] = firstProperty
        ? [Number(firstProperty.longitude), Number(firstProperty.latitude)]
        : [80, 19];

      const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: initialCenter,
        zoom: firstProperty ? 12 : 3.5,
        attributionControl: false,
        cooperativeGestures: true,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

      let isDisposed = false;

      const addMarkers = () => {
        if (isDisposed) return;

        map.resize();
        const bounds = new mapboxgl.LngLatBounds();

        mappedProperties.forEach((property) => {
          const coordinates: [number, number] = [
            Number(property.longitude),
            Number(property.latitude),
          ];

          bounds.extend(coordinates);

          const element = createPriceMarker(property);
          element.addEventListener('mouseenter', () => onHoverChange(property.id));
          element.addEventListener('mouseleave', () => onHoverChange(null));

          markerEls.current.set(property.id, element);

          const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
            .setLngLat(coordinates)
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

      const handleError = (event: { error?: Error }) => {
        if (isDisposed || event.error?.name === 'AbortError') return;
        setMapError('Mapbox could not load the map. Check the public token and allowed URLs.');
      };

      const resizeMap = () => { if (!isDisposed) map.resize(); };
      const resizeTimer = window.setTimeout(resizeMap, 250);

      map.once('load', addMarkers);
      map.on('error', handleError);
      window.addEventListener('resize', resizeMap);

      const markerElements = markerEls.current;

      disposeMap = () => {
        if (isDisposed) return;
        isDisposed = true;

        window.clearTimeout(resizeTimer);
        window.removeEventListener('resize', resizeMap);
        map.off('load', addMarkers);
        map.off('error', handleError);

        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch {
            // Ignore cleanup errors while the map is tearing down.
          }
        });

        markersRef.current = [];
        markerElements.clear();

        try {
          map.remove();
        } catch (error) {
          // Only synchronous cancellation is expected during teardown.
          if (!(error instanceof Error) || error.name !== 'AbortError') throw error;
        }
      };
    });

    return () => {
      window.cancelAnimationFrame(setupFrame);
      disposeMap?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, properties]);

  return (
    <div className="absolute inset-0 bg-slate-200">
      <div ref={mapContainer} className="h-full w-full" />
      {mapMessage ? (
          <div className="absolute inset-x-6 bottom-6 z-20 rounded-brand-md bg-white p-4 text-sm font-medium text-slate-600 shadow-xl">
            {mapMessage}
          </div>
        ) : null}
    </div>
  );
}

function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocation = searchParams.get('city') ?? '';
  const currentCategory = PROPERTY_TYPES.find(
    (type) => type.toUpperCase() === searchParams.get('category')?.toUpperCase(),
  ) ?? 'All Types';
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');

  const currentPriceRange = useMemo(() => {
    if (currentMinPrice === '20000000') return 'Rs 2 Cr+';
    if (currentMinPrice === '10000000' && currentMaxPrice === '20000000') return 'Rs 1 Cr – 2 Cr';
    if (currentMinPrice === '5000000' && currentMaxPrice === '10000000') return 'Rs 50 L – 1 Cr';
    if (currentMaxPrice === '5000000') return 'Under Rs 50 L';
    return 'Any Price';
  }, [currentMaxPrice, currentMinPrice]);

  const pushSearch = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const location = String(formData.get('location') ?? '').trim();
    const category = String(formData.get('category') ?? 'All Types');
    const priceRange = String(formData.get('priceRange') ?? 'Any Price');

    const params = new URLSearchParams(searchParams.toString());
    ['city', 'category', 'minPrice', 'maxPrice', 'page'].forEach(key => params.delete(key));

    if (location) {
      params.set('city', location);
    }

    if (category !== 'All Types') {
      params.set('category', category.toUpperCase());
    }

    if (priceRange === 'Under Rs 50 L') {
      params.set('maxPrice', '5000000');
    } else if (priceRange === 'Rs 50 L – 1 Cr') {
      params.set('minPrice', '5000000');
      params.set('maxPrice', '10000000');
    } else if (priceRange === 'Rs 1 Cr – 2 Cr') {
      params.set('minPrice', '10000000');
      params.set('maxPrice', '20000000');
    } else if (priceRange === 'Rs 2 Cr+') {
      params.set('minPrice', '20000000');
    }

    const query = params.toString();
    router.push(query ? `/properties?${query}` : '/properties');
  };

  return (
    <form
      key={searchParams.toString()}
      onSubmit={(event) => {
        event.preventDefault();
        pushSearch(event.currentTarget);
      }}
      className="absolute left-4 right-4 top-28 z-30 mx-auto max-w-[660px] rounded-[24px] bg-white p-2 shadow-lg sm:top-[148px] sm:rounded-full"
    >
      <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="min-w-0 px-3">
          <input
            name="location"
            aria-label="Location"
            defaultValue={currentLocation}
            placeholder="City or location"
            className="w-full border-none bg-transparent py-2 text-xs text-stone-600 outline-offset-2 placeholder:text-stone-400"
          />
        </div>

        <SearchField
          label="Property Type"
          name="category"
          options={PROPERTY_TYPES}
          defaultValue={currentCategory}
          showChevron
        />

        <SearchField
          label="Price Range"
          name="priceRange"
          options={PRICE_RANGES}
          defaultValue={currentPriceRange}
        />

        <button
          type="submit"
          aria-label="Search properties"
          className="flex items-center justify-center gap-1.5 rounded-full bg-[#3E4A3D] px-5 py-2.5 text-xs text-white transition hover:bg-[#303c2f]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}

function SearchField({
  label,
  name,
  options,
  defaultValue,
  showChevron = false,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue: string;
  showChevron?: boolean;
}) {
  return (
    <div className="min-w-0 border-l border-stone-100 px-3 py-2">
      <div className="flex items-center justify-between gap-1">
        <select
          name={name}
          aria-label={label}
          defaultValue={defaultValue}
          className={`w-full min-w-0 border-none bg-transparent text-xs text-stone-600 outline-offset-2 ${showChevron ? 'appearance-none' : ''}`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {showChevron ? (
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0 text-slate-800">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
}

function createPriceMarker(property: PropertyResponseDto): HTMLAnchorElement {
  const marker = document.createElement('a');
  const price = Number(property.price);

  marker.href = `/properties/${property.id}`;
  marker.ariaLabel = `View ${property.title}`;
  marker.className = 'group flex cursor-pointer flex-col items-center text-slate-800 no-underline';
  marker.innerHTML = `
    <span data-role="label" class="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(13,27,42,0.2)] transition duration-200">Rs. ${
      Number.isFinite(price) ? price.toLocaleString('en-US') : '0'
    }</span>
    <span data-role="dot" class="mt-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#AC953E] shadow-[0_6px_16px_rgba(13,27,42,0.2)] transition duration-200"></span>
  `;

  return marker;
}

function PropertyResult({
  property,
  isHovered,
  onHoverChange,
}: {
  property: PropertyResponseDto;
  isHovered: boolean;
  onHoverChange: (id: string | null) => void;
}) {
  const location = formatLocation(property) || 'Location not provided';
  const price = formatCurrency(property.price);
  const areaSize = formatArea(property.areaSize, property.areaUnit);
  const category = getPropertyCategoryLabel(property.category);
  const listingType = getListingTypeLabel(property.listingType);

  return (
    <article
      onMouseEnter={() => onHoverChange(property.id)}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={() => onHoverChange(property.id)}
      onBlur={() => onHoverChange(null)}
      className={`relative grid min-h-[164px] grid-cols-[43%_minmax(0,1fr)] overflow-hidden rounded-[26px] border bg-white transition-colors ${
        isHovered
          ? 'border-[#ca7653]'
          : 'border-transparent hover:border-[#ca7653]'
      }`}
    >
      <Link href={`/properties/${property.id}`} aria-label={`View ${property.title}`} className="absolute inset-0 z-10 rounded-[26px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#ca7653]" />
      <div className="relative min-h-[164px] overflow-hidden bg-stone-200">
        <Image
          src={resolveImageSrcFromProperty(property)}
          alt={property.title || 'Property'}
          fill
          sizes="(min-width: 1024px) 18vw, 43vw"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col px-4 py-3 sm:px-5">
        <p className="text-lg font-bold leading-tight text-[#ca7653]">{price}</p>
          <h2 className="mt-1 truncate text-[22px] font-bold leading-tight tracking-tight text-[#2A2723] capitalize">
            {property.title || 'Untitled property'}
          </h2>
        <p className="mt-1 truncate text-xs text-stone-400">{location}</p>
        <div className="relative z-20 my-1 w-fit"><SavePropertyButton property={property} compact /></div>
        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-200 pt-2 text-xs text-stone-400">
          <span>{areaSize}</span>
          <span>{category} · {listingType}</span>
        </div>
      </div>
    </article>
  );
}
