import type {
  AreaUnit,
  ListingType,
  PropertyResponseDto,
  PropertyStatus,
} from '@/types';

type ImageLike = {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

export function formatCurrency(value: number | string | null | undefined): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Rs. 0';
  }

  return `Rs. ${amount.toLocaleString('en-US')}`;
}

export function formatArea(
  value: number | string | null | undefined,
  unit?: AreaUnit,
): string {
  const area = Number(value);

  if (!Number.isFinite(area)) {
    return 'Size not specified';
  }

  return `${area.toLocaleString('en-US')} ${unit ?? ''}`.trim();
}

export function formatLocation(property: Pick<PropertyResponseDto, 'street' | 'city' | 'state' | 'country'>): string {
  return [property.street, property.city, property.state, property.country]
    .filter(Boolean)
    .join(', ');
}

export function getPrimaryImage(
  images: Array<ImageLike> | null | undefined,
): ImageLike | undefined {
  if (!Array.isArray(images) || images.length === 0) {
    return undefined;
  }

  return (
    images.find((image) => image.isPrimary) ??
    [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
  );
}

export function getListingTypeLabel(listingType: ListingType | null | undefined): string {
  if (!listingType) return 'Listing';

  switch (String(listingType).toLowerCase()) {
    case 'sale':
      return 'For Sale';
    case 'rent':
      return 'For Rent';
    default:
      return String(listingType)
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\w/, (char) => char.toUpperCase());
  }
}

export function getPropertyCategoryLabel(category: string | null | undefined): string {
  if (!category) return 'Property';

  return String(category)
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getPropertyStatusLabel(status: PropertyStatus | string | null | undefined): string {
  if (!status) return 'Status unknown';

  return String(status)
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());
}
