'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { formatLocation, getPrimaryImage } from '@/lib/properties';
import type { PropertyResponseDto } from '@/types';

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

interface PendingBookingSnapshot {
  property: PropertySnapshot;
  provider: string | null;
}

interface UserAccountState {
  saved: PropertySnapshot[];
  booked: BookedPropertySnapshot[];
  pendingBooking: PendingBookingSnapshot | null;
}

interface AccountStoreState {
  hydrated: boolean;
  accounts: Record<string, UserAccountState>;
  setHydrated: () => void;
  getSavedProperties: (userId: string) => PropertySnapshot[];
  isPropertySaved: (userId: string, propertyId: string) => boolean;
  toggleSavedProperty: (userId: string, property: PropertySnapshot) => boolean;
  getBookedProperties: (userId: string) => BookedPropertySnapshot[];
  addBookedProperty: (
    userId: string,
    property: PropertySnapshot,
    details?: { paymentId?: string | null; provider?: string | null },
  ) => void;
  setPendingBooking: (
    userId: string,
    property: PropertySnapshot,
    details?: { provider?: string | null },
  ) => void;
  getPendingBooking: (userId: string) => PendingBookingSnapshot | null;
  clearPendingBooking: (userId: string) => void;
}

const EMPTY_PROPERTY_LIST: PropertySnapshot[] = [];
const EMPTY_BOOKED_LIST: BookedPropertySnapshot[] = [];
const EMPTY_ACCOUNT: UserAccountState = {
  saved: EMPTY_PROPERTY_LIST,
  booked: EMPTY_BOOKED_LIST,
  pendingBooking: null,
};

function getAccount(accounts: Record<string, UserAccountState>, userId: string): UserAccountState {
  return accounts[userId] ?? EMPTY_ACCOUNT;
}

function patchAccount(
  accounts: Record<string, UserAccountState>,
  userId: string,
  updater: (account: UserAccountState) => UserAccountState,
): Record<string, UserAccountState> {
  return {
    ...accounts,
    [userId]: updater(getAccount(accounts, userId)),
  };
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

export const useAccountStore = create<AccountStoreState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      accounts: {},
      setHydrated: () => set({ hydrated: true }),
      getSavedProperties: (userId) => getAccount(get().accounts, userId).saved,
      isPropertySaved: (userId, propertyId) =>
        getAccount(get().accounts, userId).saved.some((item) => item.id === propertyId),
      toggleSavedProperty: (userId, property) => {
        let nextSaved = false;

        set((state) => {
          const account = getAccount(state.accounts, userId);
          const exists = account.saved.some((item) => item.id === property.id);
          nextSaved = !exists;

          return {
            accounts: patchAccount(state.accounts, userId, (current) =>
              exists
                ? {
                    ...current,
                    saved: current.saved.filter((item) => item.id !== property.id),
                  }
                : {
                    ...current,
                    saved: [{ ...property, savedAt: new Date().toISOString() }, ...current.saved],
                  },
            ),
          };
        });

        return nextSaved;
      },
      getBookedProperties: (userId) => getAccount(get().accounts, userId).booked,
      addBookedProperty: (userId, property, details) => {
        set((state) => {
          const account = getAccount(state.accounts, userId);
          const nextBooked: BookedPropertySnapshot[] = [
            {
              ...property,
              bookedAt: new Date().toISOString(),
              paymentId: details?.paymentId ?? null,
              provider: details?.provider ?? null,
            },
            ...account.booked.filter((item) => item.id !== property.id),
          ];

          return {
            accounts: patchAccount(state.accounts, userId, (current) => ({
              ...current,
              booked: nextBooked,
            })),
          };
        });
      },
      setPendingBooking: (userId, property, details) => {
        set((state) => ({
          accounts: patchAccount(state.accounts, userId, (current) => ({
            ...current,
            pendingBooking: {
              property,
              provider: details?.provider ?? null,
            },
          })),
        }));
      },
      getPendingBooking: (userId) => getAccount(get().accounts, userId).pendingBooking,
      clearPendingBooking: (userId) => {
        set((state) => ({
          accounts: patchAccount(state.accounts, userId, (current) => ({
            ...current,
            pendingBooking: null,
          })),
        }));
      },
    }),
    {
      name: 'sunrise-account-store',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => window.localStorage)
          : undefined,
      partialize: (state) => ({ accounts: state.accounts }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const getSavedProperties = (userId: string) =>
  useAccountStore.getState().getSavedProperties(userId);

export const isPropertySaved = (userId: string, propertyId: string) =>
  useAccountStore.getState().isPropertySaved(userId, propertyId);

export const toggleSavedProperty = (userId: string, property: PropertySnapshot) =>
  useAccountStore.getState().toggleSavedProperty(userId, property);

export const getBookedProperties = (userId: string) =>
  useAccountStore.getState().getBookedProperties(userId);

export const addBookedProperty = (
  userId: string,
  property: PropertySnapshot,
  details?: { paymentId?: string | null; provider?: string | null },
) => useAccountStore.getState().addBookedProperty(userId, property, details);

export const setPendingBooking = (
  userId: string,
  property: PropertySnapshot,
  details?: { provider?: string | null },
) => useAccountStore.getState().setPendingBooking(userId, property, details);

export const getPendingBooking = (userId: string) =>
  useAccountStore.getState().getPendingBooking(userId);

export const clearPendingBooking = (userId: string) =>
  useAccountStore.getState().clearPendingBooking(userId);

export const EMPTY_SAVED_PROPERTIES = EMPTY_PROPERTY_LIST;
export const EMPTY_BOOKED_PROPERTIES = EMPTY_BOOKED_LIST;
