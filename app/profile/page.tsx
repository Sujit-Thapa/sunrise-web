'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CalendarCheck2,
  Clock3,
  House,
  LogOut,
  MapPin,
  PencilLine,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import {
  toggleSavedProperty,
  useAccountStore,
  EMPTY_BOOKED_PROPERTIES,
  EMPTY_SAVED_PROPERTIES,
} from '@/lib/account-store';
import { getAuthToken } from '@/lib/auth';
import { userPropertiesApi } from '@/lib/backend';
import type { BookedPropertySnapshot, PropertySnapshot } from '@/lib/account-store';
import { resolveImageSrc } from '@/lib/image';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
  getPropertyCategoryLabel,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type { UserPropertyResponseDto } from '@/types';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuthSession();
  const hydrated = useAccountStore((state) => state.hydrated);
  const saved = useAccountStore((state) =>
    user ? state.accounts[user.id]?.saved ?? EMPTY_SAVED_PROPERTIES : EMPTY_SAVED_PROPERTIES,
  );
  const booked = useAccountStore((state) =>
    user ? state.accounts[user.id]?.booked ?? EMPTY_BOOKED_PROPERTIES : EMPTY_BOOKED_PROPERTIES,
  );
  const [mySubmissions, setMySubmissions] = useState<UserPropertyResponseDto[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMySubmissions = async () => {
      if (!user) {
        setMySubmissions([]);
        setSubmissionsLoading(false);
        setSubmissionsError(null);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setMySubmissions([]);
        setSubmissionsError('Sign in again to load your submissions.');
        setSubmissionsLoading(false);
        return;
      }

      setSubmissionsLoading(true);
      setSubmissionsError(null);

      try {
        const response = await userPropertiesApi.findMine(token, { page: 1, limit: 20 });
        if (!active) return;
        setMySubmissions(response.items ?? []);
      } catch (error) {
        if (!active) return;
        setSubmissionsError((error as Error).message || 'Unable to load your submissions.');
      } finally {
        if (active) setSubmissionsLoading(false);
      }
    };

    void loadMySubmissions();

    return () => {
      active = false;
    };
  }, [user]);

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8f5ee_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-[32px] border border-stone-200 bg-white shadow-brand-sm">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
                <Sparkles className="h-4 w-4" />
                Account
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-midnight text-lg font-semibold text-white">
                  {user.fullName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('')}
                </div>

                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
                    {user.fullName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Pill>{user.role}</Pill>
                <Pill>{saved.length} saved</Pill>
                <Pill>{booked.length} booked</Pill>
                <Pill>{mySubmissions.length} submissions</Pill>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500">
                A compact overview of your account, saved properties, and booking history. Reset
                your password or jump to the dashboard from here.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat label="Saved" value={saved.length} />
                <MiniStat label="Booked" value={booked.length} />
                <MiniStat label="Submissions" value={mySubmissions.length} />
                <MiniStat label="Role" value={user.role} />
                <MiniStat label="Account" value={user.id.slice(0, 8)} />
              </div>
            </div>

            <aside className="border-t border-stone-200 bg-stone-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                Quick actions
              </div>

              <div className="mt-5 space-y-3">
                {user.role === 'ADMIN' || user.role === 'AGENT' ? (
                  <ActionLink
                    href={user.role === 'ADMIN' ? '/admin' : '/agent'}
                    label={user.role === 'ADMIN' ? 'Open admin dashboard' : 'Open agent studio'}
                    description="Manage listings, reservations, and account tools."
                    icon={House}
                  />
                ) : null}

                <ActionLink
                  href="/auth/forgot-password"
                  label="Reset password"
                  description="Start the password reset flow."
                  icon={ArrowRight}
                />

                <ActionLink
                  href="/properties"
                  label="Browse properties"
                  description="Continue exploring the marketplace."
                  icon={House}
                />

                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-stone-200 bg-white px-4 py-4 text-left transition hover:border-gold-primary"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight text-white">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-midnight">Sign out</span>
                      <span className="block text-xs text-slate-500">End this session on this device.</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <dl className="mt-8 space-y-3">
                <Row label="Account ID" value={user.id} />
                <Row label="Email" value={user.email} />
                <Row label="Role" value={user.role} />
              </dl>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <PropertyShelf
            title="Saved"
            description="Properties you bookmarked."
            emptyText="No saved properties yet."
            items={saved}
            onRemove={(item) => {
              if (!user) return;
              toggleSavedProperty(user.id, snapshotPropertyFromStored(item));
            }}
            actionLabel="Remove"
            actionIcon={Bookmark}
          />

          <PropertyShelf
            title="Booked"
            description="Properties booked from this browser."
            emptyText="No bookings yet."
            items={booked}
            actionLabel="Booked"
            actionIcon={CalendarCheck2}
            readOnly
          />
        </section>

        <section className="mt-8 rounded-[32px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-primary">
                My submissions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-midnight">Properties you added</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                These come from the `GET /v1/user-properties/mine` endpoint. New submissions wait for
                admin review, approved listings can appear in the marketplace, and rejected items
                show the reason here.
              </p>
            </div>
            <Link
              href="/marketplace#my-submissions"
              className="inline-flex items-center justify-center rounded-full border border-midnight px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-midnight transition hover:bg-midnight hover:text-white"
            >
              Manage in marketplace
            </Link>
          </div>

          {submissionsError ? (
            <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submissionsError}
            </p>
          ) : null}

          {submissionsLoading ? (
            <div className="mt-6 rounded-[28px] border border-stone-200 bg-stone-50 p-8 text-center text-slate-500">
              Loading your submissions…
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-slate-500">
              <p className="text-lg font-medium text-slate-700">You have not added any properties yet.</p>
              <p className="mt-2 text-sm">Use the marketplace form to submit a property for admin review.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {mySubmissions.map((property) => {
                const rejectionReason = property.rejectionReason?.trim();
                return (
                  <article
                    key={property.id}
                    className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-brand-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {getPropertyCategoryLabel(property.category)}
                        </p>
                        <h3 className="mt-1 truncate text-xl font-semibold text-midnight">
                          {property.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {formatLocation(property) || 'Location not specified'}
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-semibold text-gold-primary">
                        {formatCurrency(property.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[0.7rem] font-medium">
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                        {getListingTypeLabel(property.listingType)}
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                        {formatArea(property.areaSize, property.areaUnit)}
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                        {getPropertyStatusLabel(property.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Submitted {new Date(property.createdAt).toLocaleDateString()}
                    </p>

                    {rejectionReason ? (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-semibold">Rejection reason</p>
                            <p className="mt-1 leading-6">{rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href="/marketplace#my-submissions"
                        className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                      >
                        <PencilLine className="h-4 w-4" />
                        Manage
                      </Link>
                      <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        Admin review
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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
    <section className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-7">
      <div className="flex items-start justify-between gap-4">
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
            const imageUrl = item.imageUrl || '/images/logo/sunrise.png';
            const isBooked = 'bookedAt' in item;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[26px] border border-stone-200 bg-white"
              >
                <div className="grid gap-0 sm:grid-cols-[120px_1fr]">
                  <div className="relative min-h-[120px] bg-stone-100">
                    <Image
                      src={resolveImageSrc(imageUrl)}
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
                        <h3 className="mt-1 truncate text-base font-semibold text-midnight">
                          {item.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {item.location || 'Location not specified'}
                        </p>
                      </div>

                      <p className="shrink-0 text-base font-semibold text-gold-primary">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[0.7rem] font-medium">
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-midnight">{value}</p>
    </div>
  );
}

function ActionLink({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-[24px] border border-stone-200 bg-white px-4 py-4 transition hover:border-gold-primary"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight text-white">
          <Icon className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-midnight">{label}</span>
          <span className="block text-xs text-slate-500">{description}</span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-slate-400" />
    </Link>
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
