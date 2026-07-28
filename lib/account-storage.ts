import { formatLocation, getPrimaryImage } from '@/lib/properties';
import type { PropertyResponseDto } from '@/types';

const SAVED_KEY_PREFIX = 'sunrise_saved_properties:';
const BOOKED_KEY_PREFIX = 'sunrise_booked_properties:';
const PENDING_BOOKING_KEY_PREFIX = 'sunrise_pending_booking:';
export const ACCOUNT_STORAGE_EVENT = 'sunrise-account-storage-changed';

export interface PropertySnapshot {
  id: string;
  title: string;
  price: number;
  listingType: string;
  category: string;
  status: string;
  areaSize?: number;
  areaUnit?: string;
  location: string;
  imageUrl: string | null;
  savedAt?: string;
}

export interface BookedPropertySnapshot extends PropertySnapshot {
  bookedAt: string;
  paymentId?: string | null;
  provider?: string | null;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function notifyChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ACCOUNT_STORAGE_EVENT));
}

function userKey(prefix: string, userId: string) {
  return `${prefix}${userId}`;
}

export function snapshotProperty(property: PropertyResponseDto): PropertySnapshot {
  return {
    id: property.id,
    title: property.title,
    price: property.price,
    listingType: String(property.listingType),
    category: String(property.category),
    status: String(property.status),
    areaSize: property.areaSize,
    areaUnit: property.areaUnit,
    location: formatLocation(property),
    imageUrl: getPrimaryImage(property.images)?.url ?? null,
  };
}

export function getSavedProperties(userId: string): PropertySnapshot[] {
  return readJson<PropertySnapshot[]>(userKey(SAVED_KEY_PREFIX, userId), []);
}

export function setSavedProperties(userId: string, items: PropertySnapshot[]) {
  writeJson(userKey(SAVED_KEY_PREFIX, userId), items);
  notifyChange();
}

export function isPropertySaved(userId: string, propertyId: string): boolean {
  return getSavedProperties(userId).some((item) => item.id === propertyId);
}

export function toggleSavedProperty(userId: string, property: PropertySnapshot): boolean {
  const saved = getSavedProperties(userId);
  const exists = saved.some((item) => item.id === property.id);
  const next = exists
    ? saved.filter((item) => item.id !== property.id)
    : [{ ...property, savedAt: new Date().toISOString() }, ...saved];

  setSavedProperties(userId, next);
  return !exists;
}

export function getBookedProperties(userId: string): BookedPropertySnapshot[] {
  return readJson<BookedPropertySnapshot[]>(userKey(BOOKED_KEY_PREFIX, userId), []);
}

export function addBookedProperty(
  userId: string,
  property: PropertySnapshot,
  details?: { paymentId?: string | null; provider?: string | null },
) {
  const booked = getBookedProperties(userId);
  const next: BookedPropertySnapshot[] = [
    {
      ...property,
      bookedAt: new Date().toISOString(),
      paymentId: details?.paymentId ?? null,
      provider: details?.provider ?? null,
    },
    ...booked.filter((item) => item.id !== property.id),
  ];

  writeJson(userKey(BOOKED_KEY_PREFIX, userId), next);
  notifyChange();
}

export function setPendingBooking(
  userId: string,
  property: PropertySnapshot,
  details?: { provider?: string | null },
) {
  writeJson(userKey(PENDING_BOOKING_KEY_PREFIX, userId), {
    property,
    provider: details?.provider ?? null,
  });
  notifyChange();
}

export function getPendingBooking(userId: string): {
  property: PropertySnapshot;
  provider: string | null;
} | null {
  return readJson<{
    property: PropertySnapshot;
    provider: string | null;
  } | null>(userKey(PENDING_BOOKING_KEY_PREFIX, userId), null);
}

export function clearPendingBooking(userId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(userKey(PENDING_BOOKING_KEY_PREFIX, userId));
  notifyChange();
}
