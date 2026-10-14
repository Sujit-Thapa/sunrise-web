// Search options shared by the home hero search bar and the properties-page search panel.

export const PROPERTY_TYPES = ['All Types', 'Apartment', 'House', 'Land', 'Commercial'];

const PRICE_BANDS: Array<{ label: string; min?: string; max?: string }> = [
  { label: 'Any Price' },
  { label: 'Under Rs 50 L', max: '5000000' },
  { label: 'Rs 50 L – 1 Cr', min: '5000000', max: '10000000' },
  { label: 'Rs 1 Cr – 2 Cr', min: '10000000', max: '20000000' },
  { label: 'Rs 2 Cr+', min: '20000000' },
];

export const PRICE_RANGES = PRICE_BANDS.map((band) => band.label);

// Writes the search filters onto `params`, replacing any previous search filters.
export function applySearch(params: URLSearchParams, { location, category, priceRange }: { location: string; category: string; priceRange: string }) {
  ['city', 'category', 'minPrice', 'maxPrice', 'page'].forEach((key) => params.delete(key));
  if (location.trim()) params.set('city', location.trim());
  if (category !== 'All Types') params.set('category', category.toUpperCase());
  const band = PRICE_BANDS.find((item) => item.label === priceRange);
  if (band?.min) params.set('minPrice', band.min);
  if (band?.max) params.set('maxPrice', band.max);
  return params;
}

export const priceRangeFromParams = (min: string | null, max: string | null) =>
  PRICE_BANDS.find((band) => band.label !== 'Any Price' && (band.min ?? null) === min && (band.max ?? null) === max)?.label ?? 'Any Price';

export const categoryFromParams = (category: string | null) =>
  PROPERTY_TYPES.find((type) => type.toUpperCase() === category?.toUpperCase()) ?? 'All Types';
