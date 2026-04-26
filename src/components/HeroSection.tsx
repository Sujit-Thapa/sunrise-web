'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import SearchBar from './SearchBar';

export default function HeroSection() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [85.3240, 27.7172],
      zoom: 11,
    });

    new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat([85.3240, 27.7172])
      .setPopup(new mapboxgl.Popup().setText('Kathmandu, Nepal'))
      .addTo(map);

    map.on('load', () => setMapLoaded(true));

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="relative h-[500px] md:h-[620px]">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200 mb-4">
            Kathmandu, Nepal
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            Find Your Dream Home in Kathmandu
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Browse top properties across the valley with a live Mapbox map as your guide.
          </p>
          <SearchBar />
        </div>
        {!mapLoaded && (
          <div className="mt-6 rounded-full bg-white/90 px-5 py-2 text-sm text-gray-700">
            Loading Kathmandu map…
          </div>
        )}
      </div>
    </div>
  );
}