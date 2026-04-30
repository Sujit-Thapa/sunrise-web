'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import SearchBar from './SearchBar';

export default function HeroSection() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [85.324, 27.7172],
      zoom: 12,
      pitch: 20,
    });

    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([85.324, 27.7172])
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div className="relative h-screen md:h-[600px] overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="max-w-3xl text-center">
          <p className="text-sm uppercase tracking-wider text-blue-200 mb-3">Premium Properties</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Find Your Dream Home
          </h1>
          <p className="text-lg text-gray-100 mb-10">
            Explore beautiful properties across Kathmandu on an interactive map.
          </p>
          <SearchBar />
        </div>
      </div>
    </div>
  );
}