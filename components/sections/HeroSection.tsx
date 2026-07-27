'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import SearchBar from '../ui/SearchBar';
import type { Property } from '@/types';

interface HeroSectionProps {
  properties?: Property[];
}

export default function HeroSection({ properties = [] }: HeroSectionProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerTimers = useRef<number[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const hintTimer = useRef<number | null>(null);
  const zoomEndTimer = useRef<number | null>(null);

  const [ctrlHint, setCtrlHint] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [mapNotice] = useState(
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      ? ''
      : 'Interactive map preview is unavailable without a Mapbox token.',
  );

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  const propertiesCount = properties.length;

  useEffect(() => {
    if (!mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const initTimer = window.setTimeout(() => {
      if (!mapContainer.current) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [85.324, 27.5],
        zoom: 1.7,
        pitch: 45,
        bearing: -20,
        scrollZoom: false,
        attributionControl: false,
      });

      mapRef.current = map;

      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const rect = map.getContainer().getBoundingClientRect();
          const cursorLngLat = map.unproject([event.clientX - rect.left, event.clientY - rect.top]);
          const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? event.deltaY * 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? event.deltaY * window.innerHeight
              : event.deltaY;
          const nextZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), map.getZoom() - delta / 450));

          map.easeTo({ zoom: nextZoom, around: cursorLngLat, duration: 0 });
          setIsZooming(true);
          setCtrlHint(false);
          if (zoomEndTimer.current) window.clearTimeout(zoomEndTimer.current);
          zoomEndTimer.current = window.setTimeout(() => setIsZooming(false), 1000);
        } else {
          event.stopPropagation();
          setCtrlHint(true);
          if (hintTimer.current) window.clearTimeout(hintTimer.current);
          hintTimer.current = window.setTimeout(() => setCtrlHint(false), 1800);
        }
      };

      const wheelTarget = mapContainer.current;
      wheelTarget?.addEventListener('wheel', onWheel, { passive: false });

      map.on('load', () => {
        map.resize();
        map.flyTo({
          center: [85.324, 27.7172],
          zoom: 13,
          pitch: 30,
          bearing: 0,
          duration: 5000,
          easing: (t) => 1 - Math.pow(1 - t, 2),
        });

        properties.forEach((property, index) => {
          const timeoutId = window.setTimeout(() => {
            if (!mapRef.current) return;

            const element = createPinElement(`$${property.price.toLocaleString()}`);
            const popup = new mapboxgl.Popup({
              offset: 20,
              closeButton: false,
              className: 'sunrise-popup',
            }).setHTML(`
              <div class="min-w-[160px] p-3 font-sans">
                <p class="mb-1 text-[9px] uppercase tracking-[0.18em] text-[#AC953E]">
                  ${property.bedrooms ? `${property.bedrooms} bed` : 'Property'}
                </p>
                <p class="mb-0.5 text-base font-bold text-stone-900">$${property.price.toLocaleString()}</p>
                <p class="text-[11px] text-stone-500">${property.location}</p>
              </div>
            `);

            const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
              .setLngLat([85.324, 27.7172] as [number, number])
              .setPopup(popup)
              .addTo(mapRef.current);

            element.style.opacity = '0';
            element.style.transform = 'scale(0.4) translateY(12px)';
            window.requestAnimationFrame(() => {
              element.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
              element.style.opacity = '1';
              element.style.transform = 'scale(1) translateY(0)';
            });

            markersRef.current.push(marker);
          }, 2600 + index * 180);

          markerTimers.current.push(timeoutId);
        });
      });
    }, 100);

    return () => {
      window.clearTimeout(initTimer);
      if (zoomEndTimer.current) window.clearTimeout(zoomEndTimer.current);
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
      markerTimers.current.forEach(window.clearTimeout);
      markerTimers.current = [];
      if (mapContainer.current) {
        mapContainer.current.removeEventListener('wheel', onWheel);
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, propertiesCount]);

  const overlayClasses = `absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-20 transition-all duration-300 pointer-events-none ${isZooming ? 'scale-[0.97] opacity-0' : 'scale-100 opacity-100'}`;

  return (
    <div className="relative h-screen min-h-[580px] w-full overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
      {mapNotice ? (
        <div className="absolute inset-x-4 bottom-4 z-20 rounded-brand-md bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur">
          {mapNotice}
        </div>
      ) : null}

      <div className={overlayClasses}>
        <div className="mb-5 flex items-center gap-3">
          <span className="block h-px w-9 bg-gold-primary/70" />
          <p className="text-[9px] uppercase tracking-[0.28em] text-gold-primary">Real Estate Nepal</p>
          <span className="block h-px w-9 bg-gold-primary/70" />
        </div>

        <h1
          className="mb-3 text-center text-5xl font-bold leading-[1.08] tracking-tight text-midnight md:text-6xl"
          style={{ textShadow: '0 1px 12px rgba(253,243,220,0.9), 0 0 40px rgba(253,243,220,0.6)' }}
        >
          The Simplest Way to
          <br />
          <em className="not-italic text-gold-primary">Finding Property</em>
        </h1>

        {/* <p
          className="mb-8 max-w-md text-center text-sm leading-relaxed text-ink"
          style={{ textShadow: '0 1px 8px rgba(253,243,220,0.95), 0 0 24px rgba(253,243,220,0.7)' }}
        >
          Discover your perfect home across Kathmandu Valley on an interactive map. Every listing verified.
        </p> */}

        <div className="pointer-events-auto w-full max-w-3xl">
          <SearchBar />
        </div>
      </div>

      <button
        type="button"
        className={`absolute bottom-8 left-1/2 z-20 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-gold-primary shadow-gold transition-all duration-250 hover:scale-110 hover:bg-gold-deep ${isZooming ? 'opacity-0' : 'opacity-100'} animate-bounce`}
        aria-label="Scroll down"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {ctrlHint ? (
        <div className="pointer-events-none absolute bottom-40 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center">
          <div className="flex items-center gap-3 rounded-brand-lg bg-white px-6 py-3 text-sm text-ink/60 shadow">
            <kbd className="rounded-brand-sm bg-gold-primary/20 px-2 py-0.5 text-xs font-mono text-gold-highlight shadow">
              Ctrl
            </kbd>
            <span>+ scroll to zoom the map</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function createPinElement(price: string): HTMLDivElement {
  const element = document.createElement('div');
  element.className = 'group relative cursor-pointer origin-bottom';
  element.innerHTML = `
    <div class="relative pb-[7px]">
      <div class="flex items-center gap-[5px] whitespace-nowrap rounded-full border border-stone-900/10 bg-white px-3 py-1.5 shadow-[0_8px_24px_rgba(13,27,42,0.14)] transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-[#fdf3dc]">
        <span class="flex shrink-0 items-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AC953E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" fill="#AC953E" stroke="none" />
          </svg>
        </span>
        <span class="text-[12px] font-bold tracking-[-0.01em] text-stone-900">${price}</span>
      </div>
      <div class="absolute bottom-[1px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-stone-900/10 bg-white"></div>
    </div>
  `;
  return element;
}