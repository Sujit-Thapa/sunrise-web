/** Mapbox expects longitude first. Empty fields must not become a pin at 0, 0. */
export function parseCoordinates(latitude: unknown, longitude: unknown): [number, number] | null {
  const parse = (value: unknown) => {
    if (typeof value !== 'number' && typeof value !== 'string') return NaN;
    if (typeof value === 'string' && !value.trim()) return NaN;
    return Number(value);
  };
  const lat = parse(latitude);
  const lng = parse(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lng, lat];
}
