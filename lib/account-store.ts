'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { formatLocation, getPrimaryImage } from '@/lib/properties';
import type { PropertyResponseDto } from '@/types';

interface PropertySnapshot {
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

interface PendingBookingSnapshot {
  property: PropertySnapshot;
  provider: string | null;
}

// Per-user browser state: saved properties and the booking awaiting payment confirmation.
interface UserAccountState {
  saved: PropertySnapshot[];
  pendingBooking: PendingBookingSnapshot | null;
}

interface AccountStoreState {
  hydrated: boolean;
  accounts: Record<string, UserAccountState>;
  setHydrated: () => void;
}

const EMPTY_ACCOUNT: UserAccountState = { saved: [], pendingBooking: null };

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

export const useAccountStore = create<AccountStoreState>()(
  persist(
    (set) => ({
      hydrated: false,
      accounts: {},
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'sunrise-account-store',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({ accounts: state.accounts }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

const account = (userId: string) => useAccountStore.getState().accounts[userId] ?? EMPTY_ACCOUNT;

function updateAccount(userId: string, update: (current: UserAccountState) => Partial<UserAccountState>) {
  useAccountStore.setState((state) => {
    const current = state.accounts[userId] ?? EMPTY_ACCOUNT;
    return { accounts: { ...state.accounts, [userId]: { ...current, ...update(current) } } };
  });
}

// Returns the new saved state.
export function toggleSavedProperty(userId: string, property: PropertySnapshot): boolean {
  const exists = account(userId).saved.some((item) => item.id === property.id);
  updateAccount(userId, (current) => ({
    saved: exists
      ? current.saved.filter((item) => item.id !== property.id)
      : [{ ...property, savedAt: new Date().toISOString() }, ...current.saved],
  }));
  return !exists;
}

export const setPendingBooking = (userId: string, property: PropertySnapshot, details?: { provider?: string | null }) =>
  updateAccount(userId, () => ({ pendingBooking: { property, provider: details?.provider ?? null } }));

export const getPendingBooking = (userId: string) => account(userId).pendingBooking;

export const clearPendingBooking = (userId: string) => updateAccount(userId, () => ({ pendingBooking: null }));
