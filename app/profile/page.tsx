'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, CalendarCheck2, LogOut, MapPin, Sparkles, type LucideIcon } from 'lucide-react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import {
  toggleSavedProperty,
  useAccountStore,
  EMPTY_BOOKED_PROPERTIES,
  EMPTY_SAVED_PROPERTIES,
} from '@/lib/account-store';
import {
  formatCurrency,
  getListingTypeLabel,
  getPropertyCategoryLabel,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type { BookedPropertySnapshot, PropertySnapshot } from '@/lib/account-store';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuthSession();
  const hydrated = useAccountStore((state) => state.hydrated);
  const saved = useAccountStore((state) =>
    user ? state.accounts[user.id]?.saved ?? EMPTY_SAVED_PROPERTIES : EMPTY_SAVED_PROPERTIES,
  );
  const booked = useAccountStore((state) =>
    user ? state.accounts[user.id]?.booked ?? EMPTY_BOOKED_PROPERTIES : EMPTY_BOOKED_PROPERTIES,
  );

  if (loading || (user && !hydrated)) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-stone-200 bg-white px-8 py-10 text-center shadow-brand-sm">
            <p className="text-sm font-medium text-slate-500">Loading your account…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-[32px] border border-stone-200 bg-white p-8 text-center shadow-brand-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
              My profile
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-midnight">Sign in to view your account</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Save properties, track bookings, and manage your Sunrise Realestate account in one
              place.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-midnight px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="overflow-hidden rounded-[34px] border border-stone-200 bg-white shadow-brand-sm">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
                <Sparkles className="h-4 w-4" />
                Account overview
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-midnight sm:text-5xl">
                Welcome back, {user.fullName.split(' ')[0] || 'there'}.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                This is your saved and booked property hub. What you save here follows your
                account on this browser until the backend profile endpoints are connected.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Stat label="Saved" value={saved.length} />
                <Stat label="Booked" value={booked.length} />
                <Stat label="Role" value={user.role} />
              </div>
            </div>

            <aside className="border-t border-stone-200 bg-stone-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-midnight text-lg font-semibold text-white">
                  {user.fullName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-midnight">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              <dl className="mt-8 space-y-4">
                <Row label="Account ID" value={user.id} />
                <Row label="Email" value={user.email} />
                <Row label="Role" value={user.role} />
              </dl>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Browse properties
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-2">
          <PropertyShelf
            title="Saved properties"
            description="Listings you bookmarked for later."
            emptyText="You have not saved any properties yet."
            items={saved}
            onRemove={(item) => {
              if (!user) return;
              toggleSavedProperty(user.id, snapshotPropertyFromStored(item));
            }}
            actionLabel="Remove"
            actionIcon={Bookmark}
          />

          <PropertyShelf
            title="Booked properties"
            description="Properties that were booked from this browser."
            emptyText="You have not completed a booking yet."
            items={booked}
            actionLabel="Booked"
            actionIcon={CalendarCheck2}
            readOnly
          />
        </section>
      </div>
    </main>
  );
}

function PropertyShelf({
  title,
  description,
  emptyText,
  items,
  actionLabel,
  actionIcon: ActionIcon,
  onRemove,
  readOnly = false,
}: {
  title: string;
  description: string;
  emptyText: string;
  items: Array<PropertySnapshot | BookedPropertySnapshot>;
  actionLabel: string;
  actionIcon: LucideIcon;
  onRemove?: (item: PropertySnapshot | BookedPropertySnapshot) => void;
  readOnly?: boolean;
}) {
  return (
    <section className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-primary">
            {title}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.length > 0 ? (
          items.map((item) => {
            const imageUrl = item.imageUrl || '/images/sunrise.png';
            const isBooked = 'bookedAt' in item;

            return (
              <article key={item.id} className="overflow-hidden rounded-[28px] border border-stone-200 bg-white">
                <div className="grid gap-0 sm:grid-cols-[120px_1fr]">
                  <div className="relative min-h-[120px] bg-stone-100">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {getPropertyCategoryLabel(item.category)}
                        </p>
                        <h3 className="mt-1 truncate text-lg font-semibold text-midnight">
                          {item.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {item.location || 'Location not specified'}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-semibold text-gold-primary">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                        {getListingTypeLabel(item.listingType)}
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                        {getPropertyStatusLabel(item.status)}
                      </span>
                      {isBooked ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          Booked
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        {isBooked
                          ? `Booked ${new Date(item.bookedAt).toLocaleDateString()}`
                          : item.savedAt
                            ? `Saved ${new Date(item.savedAt).toLocaleDateString()}`
                            : 'Saved recently'}
                      </p>

                      {onRemove && !readOnly ? (
                        <button
                          type="button"
                          onClick={() => onRemove(item)}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                        >
                          <ActionIcon className="h-4 w-4" />
                          {actionLabel}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          <ActionIcon className="h-4 w-4" />
                          {actionLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[28px] border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-600">{emptyText}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-midnight">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm font-medium text-midnight">{value}</span>
    </div>
  );
}

function snapshotPropertyFromStored(item: PropertySnapshot | BookedPropertySnapshot): PropertySnapshot {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    listingType: item.listingType,
    category: item.category,
    status: item.status,
    areaSize: item.areaSize,
    areaUnit: item.areaUnit,
    location: item.location,
    imageUrl: item.imageUrl,
  };
}
