'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SearchBar from '../ui/SearchBar';

const PROPERTIES = [
  { id: 1, lngLat: [85.3182, 27.7172] as [number, number], price: 'Rs 2.5 Cr', label: 'Thamel', type: 'Apartment', beds: 3 },
  { id: 2, lngLat: [85.3340, 27.7050] as [number, number], price: 'Rs 1.8 Cr', label: 'Patan', type: 'House', beds: 4 },
  { id: 3, lngLat: [85.3450, 27.7300] as [number, number], price: 'Rs 75 L', label: 'Boudha', type: 'Land', beds: 0 },
  { id: 4, lngLat: [85.3060, 27.7250] as [number, number], price: 'Rs 3.1 Cr', label: 'Baluwatar', type: 'Villa', beds: 5 },
  { id: 5, lngLat: [85.3550, 27.6950] as [number, number], price: 'Rs 55 L', label: 'Lalitpur', type: 'Apartment', beds: 2 },
  { id: 6, lngLat: [85.2900, 27.7100] as [number, number], price: 'Rs 1.2 Cr', label: 'Swayambhu', type: 'House', beds: 3 },
  { id: 7, lngLat: [85.3700, 27.7400] as [number, number], price: 'Rs 4.2 Cr', label: 'Bhaktapur', type: 'Villa', beds: 6 },
];

export default function HeroSection() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [ctrlHint, setCtrlHint] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    let map: mapboxgl.Map;

    const initTimer = setTimeout(() => {
      if (!mapContainer.current) return;

      map = new mapboxgl.Map({
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

      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const rect = map.getContainer().getBoundingClientRect();
          const cursorLngLat = map.unproject([e.clientX - rect.left, e.clientY - rect.top]);
          const delta = e.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? e.deltaY * 16
            : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? e.deltaY * window.innerHeight
              : e.deltaY;
          const nextZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), map.getZoom() - delta / 450));
          map.easeTo({ zoom: nextZoom, around: cursorLngLat, duration: 0 });

          setIsZooming(true);
          setCtrlHint(false);
          if (zoomEndTimer.current) clearTimeout(zoomEndTimer.current);
          zoomEndTimer.current = setTimeout(() => setIsZooming(false), 1000);
        } else {
          e.stopPropagation();
          setCtrlHint(true);
          if (hintTimer.current) clearTimeout(hintTimer.current);
          hintTimer.current = setTimeout(() => setCtrlHint(false), 1800);
        }
      };

      mapContainer.current.addEventListener('wheel', onWheel, { passive: false });

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

        PROPERTIES.forEach((prop, i) => {
          // ✅ Store each timer ID so cleanup can cancel it before it fires
          const t = setTimeout(() => {
            // ✅ Guard: if map was removed before this timer fired, bail out
            if (!mapRef.current) return;

            const el = createPinElement(prop.price);
            const popup = new mapboxgl.Popup({
              offset: 20,
              closeButton: false,
              className: 'sunrise-popup',
            }).setHTML(`
              <div style="font-family:system-ui,sans-serif;padding:10px 14px;min-width:160px;">
                <p style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#D4920A;margin:0 0 4px;">
                  ${prop.type}${prop.beds > 0 ? ` · ${prop.beds} bed` : ''}
                </p>
                <p style="font-size:16px;font-weight:700;color:#1A1A1A;margin:0 0 2px;">${prop.price}</p>
                <p style="font-size:11px;color:#777;margin:0;">${prop.label}, Kathmandu</p>
              </div>
            `);
            const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat(prop.lngLat)
              .setPopup(popup)
              .addTo(mapRef.current);   // ✅ Use the ref, not the closed-over `map` variable
            el.style.opacity = '0';
            el.style.transform = 'scale(0.4) translateY(12px)';
            requestAnimationFrame(() => {
              el.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
              el.style.opacity = '1';
              el.style.transform = 'scale(1) translateY(0)';
            });
            markersRef.current.push(marker);
          }, 2600 + i * 180);

          markerTimers.current.push(t);
        });
      });
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (zoomEndTimer.current) clearTimeout(zoomEndTimer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      // ✅ Cancel all pending marker stagger timers before they can fire on a dead map
      markerTimers.current.forEach(clearTimeout);
      markerTimers.current = [];
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[580px] overflow-hidden">

      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Hero content — pointer-events-none so scroll reaches map, re-enabled on children */}
      <div
        className={[
          'absolute inset-0 z-10',
          'flex flex-col items-center justify-center',
          'px-4 pb-20',
          'pointer-events-none',
          'transition-all duration-300',
          isZooming ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100',
        ].join(' ')}
      >
        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-9 h-px bg-gold-primary opacity-70" />
          <p className="text-[9px] uppercase tracking-[0.28em] text-gold-primary">
            Real Estate Nepal
          </p>
          <span className="block w-9 h-px bg-gold-primary opacity-70" />
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl font-bold text-midnight text-center leading-[1.08] tracking-tight mb-3"
          style={{ textShadow: '0 1px 12px rgba(253,243,220,0.9), 0 0 40px rgba(253,243,220,0.6)' }}
        >
          The Simplest Way to<br />
          <em className="not-italic text-gold-primary">Find Property</em>
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm text-ink text-center leading-relaxed mb-8 max-w-md"
          style={{ textShadow: '0 1px 8px rgba(253,243,220,0.95), 0 0 24px rgba(253,243,220,0.7)' }}
        >
          Discover your perfect home across Kathmandu Valley
          on an interactive map. Every listing verified.
        </p>

        {/* Search bar — re-enable pointer events */}
        <div className="w-full max-w-3xl pointer-events-auto">
          <SearchBar />
        </div>
      </div>

      {/* Scroll / down cue */}
      <button
        className={[
          'absolute bottom-8 left-1/2 -translate-x-1/2 z-20',
          'flex items-center justify-center',
          'w-11 h-11 rounded-full',
          'bg-gold-primary hover:bg-gold-deep shadow-gold',
          'transition-all duration-250 hover:scale-110 animate-bounce',
          isZooming ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        aria-label="Scroll down"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Ctrl-scroll hint toast */}
      {ctrlHint && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 bg-white shadow rounded-brand-lg px-6 py-3 text-ink/60 text-sm">
            <kbd className="bg-gold-primary/20 shadow rounded-brand-sm px-2 py-0.5 text-gold-highlight text-xs font-mono">
              Ctrl
            </kbd>
            <span>+ scroll to zoom the map</span>
          </div>
        </div>
      )}

      {/* Mapbox popup + pin styles — must stay in JSX, target dynamically created DOM */}
      <style>{`
        .sunrise-pin {
          cursor: pointer;
          transform-origin: bottom center;
          filter: drop-shadow(0 4px 12px rgba(13,27,42,0.22));
        }
        .sunrise-pin:hover .pin-pill {
          background: #FDF3DC;
          transform: scale(1.06) translateY(-2px);
        }
        .pin-wrap {
          position: relative;
          padding-bottom: 7px;
        }
        .pin-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: white;
          border: 1px solid rgba(13,27,42,0.08);
          border-radius: 9999px;
          padding: 5px 12px 5px 8px;
          white-space: nowrap;
          transition: background 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pin-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .pin-price {
          font-size: 12px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.01em;
          font-family: system-ui, sans-serif;
        }
        .pin-tail {
          position: absolute;
          bottom: 1px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: white;
          border-right: 1px solid rgba(13,27,42,0.08);
          border-bottom: 1px solid rgba(13,27,42,0.08);
        }
        .sunrise-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          border: 0.5px solid rgba(13,27,42,0.1);
          box-shadow: 0 8px 32px rgba(13,27,42,0.16);
          overflow: hidden;
        }
        .sunrise-popup .mapboxgl-popup-tip { border-top-color: white !important; }
      `}</style>

    </div>
  );
}

function createPinElement(price: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'sunrise-pin';
  el.innerHTML = `
    <div class="pin-wrap">
      <div class="pin-pill">
        <span class="pin-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#D4920A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#D4920A" stroke="none"/>
          </svg>
        </span>
        <span class="pin-price">${price}</span>
      </div>
      <div class="pin-tail"></div>
    </div>
  `;
  return el;
}