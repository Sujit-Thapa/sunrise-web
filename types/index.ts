export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  coordinates?: [number, number];
  image: string;
  badge?: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
}
