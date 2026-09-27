'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { parseCoordinates } from '@/lib/coordinates';

const DEFAULT_CENTER: [number, number] = [85.324, 27.7172];

export default function MapLocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  onChange: (coordinates: { latitude: string; longitude: string }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState('');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  useEffect(() => {
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;
    const coordinates = parseCoordinates(latitude, longitude);
    const center = coordinates ?? DEFAULT_CENTER;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: coordinates ? 14 : 10,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    const placeMarker = (event: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = event.lngLat.wrap();
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#ca7653' }).setLngLat([lng, lat]).addTo(map);
      onChange({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
    };
    map.on('click', placeMarker);
    map.on('error', () => setMapError('Map could not load. Check the Mapbox token and try again.'));
    map.once('load', () => {
      if (coordinates && !markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: '#ca7653' }).setLngLat(center).addTo(map);
      }
      map.resize();
    });
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      map.off('click', placeMarker);
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // The map is intentionally initialized once; clicking updates the marker without recreating it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Add a Mapbox token to enable location pinning.</div>;
  }

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="h-72 overflow-hidden rounded-3xl border border-stone-200 bg-[#e9e6dd]" />
      <p className="text-xs leading-5 text-stone-500">Click the map to place the property pin. You can click again to move it.</p>
      {mapError ? <p className="text-xs text-rose-600">{mapError}</p> : null}
      {latitude && longitude ? <p className="text-xs font-medium text-stone-600">Pinned at {latitude}, {longitude}</p> : <p className="text-xs font-medium text-[#ca7653]">No location pinned yet</p>}
    </div>
  );
}
