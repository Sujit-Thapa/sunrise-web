'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SearchBar from './SearchBar';

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
        zoom: 1.5,
        pitch: 45,
        bearing: -20,
        scrollZoom: false,   // enabled per-scroll via onWheel
        attributionControl: false,
      });

      mapRef.current = map;

      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+scroll: zoom the map, hide hero UI
          e.preventDefault();
          // Pass the event directly to mapbox internals
          (map as any).scrollZoom._onWheel(e);
          setIsZooming(true);
          setCtrlHint(false);
          if (zoomEndTimer.current) clearTimeout(zoomEndTimer.current);
          // Restore UI 1s after scrolling stops
          zoomEndTimer.current = setTimeout(() => {
            setIsZooming(false);
          }, 1000);
        } else {
          // Normal scroll: don't zoom, show hint
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
          zoom: 12.5,
          pitch: 30,
          bearing: 0,
          duration: 6000,
          easing: (t) => 1 - Math.pow(1 - t, 2),
        });

        PROPERTIES.forEach((prop, i) => {
          setTimeout(() => {
            const el = createPinElement(prop.price, prop.type);

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
              .addTo(map);

            el.style.opacity = '0';
            el.style.transform = 'scale(0.4) translateY(12px)';
            requestAnimationFrame(() => {
              el.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
              el.style.opacity = '1';
              el.style.transform = 'scale(1) translateY(0)';
            });

            markersRef.current.push(marker);
          }, 2600 + i * 180);
        });
      });
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (zoomEndTimer.current) clearTimeout(zoomEndTimer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="hero-wrap">

      {/* Map — full background */}
      <div ref={mapContainer} className="hero-map" />

      {/* Centered column: title + subtitle + search */}
      <div className={`hero-text-block${isZooming ? ' zooming' : ''}`}>
        <h1 className="hero-h1">
          The Simplest Way to<br />
          <em>Find Property</em>
        </h1>
        <p className="hero-sub">
          Discover your perfect home across Kathmandu Valley
          on an interactive map. Every listing verified.
        </p>
        <div className="hero-search-float">
          <SearchBar />
        </div>
      </div>

      <button className="circle-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>


      {/* Ctrl hint toast */}
      {ctrlHint && (
        <div className="ctrl-hint">
          <div className="ctrl-hint-inner">
            <kbd className="ctrl-kbd">Ctrl</kbd>
            <span>+ scroll to zoom the map</span>
          </div>
        </div>
      )}

    </div>
  );
}

function createPinElement(price: string, type: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'sunrise-pin';
  el.innerHTML = `
    <div class="pin-bubble">
      <span class="pin-type">${type}</span>
      ${price}
    </div>
  `;
  return el;
}