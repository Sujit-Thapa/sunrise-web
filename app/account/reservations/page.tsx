'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getRoleHomePath, normalizeUserRole } from '@/lib/auth-routing';
import { ApiError } from '@/lib/api';
import { reservationsApi } from '@/lib/backend';
import { resolveImageSrc } from '@/lib/image';
import { formatCurrency, getListingTypeLabel, getPropertyCategoryLabel } from '@/lib/properties';
import type { MyReservationDto, MyReservationStatus, MyReservationsResponseDto } from '@/types';

const filters = ['ALL', 'ACTIVE', 'CLAIMED', 'COMPLETED', 'CANCELLED'] as const;
type Filter = typeof filters[number];
const labels: Record<Filter, string> = {
  ALL: 'All', ACTIVE: 'Active', CLAIMED: 'Claimed', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};
const statusStyles: Record<MyReservationStatus, string> = {
  ACTIVE: 'bg-amber-50 text-amber-800',
  CLAIMED: 'bg-sky-50 text-sky-800',
  COMPLETED: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-stone-100 text-stone-600',
};
const buttonStyle = 'inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-midnight transition hover:border-gold-primary disabled:cursor-not-allowed disabled:opacity-40';

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MyReservationsPage() {
  const { user, token, loading } = useAuthSession();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);
  const [refreshIndex, setRefreshIndex] = useState(0);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-primary">Your account</p>
        <h1 className="mt-3 text-3xl font-semibold text-midnight sm:text-4xl">My reservations</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Your active property holds and reservation history.</p>
        {loading ? <p role="status" className="mt-8">Checking your account…</p> : !user || !token ? (
          <div className="mt-8 space-y-4">
            <p>Sign in to view your reservations.</p>
            <Link href="/auth/login?next=/account/reservations" className={buttonStyle}>Sign in</Link>
          </div>
        ) : normalizeUserRole(user.role) !== 'user' ? (
          <div className="mt-8 space-y-4">
            <p>My reservations is available to customer accounts.</p>
            <Link href={getRoleHomePath(user.role)} className={buttonStyle}>Go to dashboard</Link>
          </div>
        ) : (
          <>
            <div className="my-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter reservations by status">
              {filters.map((value) => (
                <button key={value} type="button" aria-pressed={filter === value}
                  onClick={() => { setFilter(value); setPage(1); }}
                  className={`${buttonStyle} ${filter === value ? 'border-midnight bg-midnight! text-white!' : ''}`}>
                  {labels[value]}
                </button>
              ))}
              <button type="button" className={`${buttonStyle} sm:ml-auto`} onClick={() => setRefreshIndex((value) => value + 1)}>Refresh</button>
            </div>
            <ReservationResults key={`${token}:${filter}:${page}:${refreshIndex}`} token={token} filter={filter} page={page}
              onPageChange={setPage} onRetry={() => setRefreshIndex((value) => value + 1)} />
          </>
        )}
      </div>
    </main>
  );
}

function ReservationResults({ token, filter, page, onPageChange, onRetry }: {
  token: string; filter: Filter; page: number; onPageChange: (page: number) => void; onRetry: () => void;
}) {
  const [result, setResult] = useState<MyReservationsResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Let the read finish, but never apply a response after this view is replaced.
    let active = true;
    reservationsApi.findMine(token, { status: filter === 'ALL' ? undefined : filter, page, limit: 20 })
      .then((data) => { if (active) setResult(data); })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof ApiError && reason.status === 401
          ? 'Your session has expired. Please sign in again.'
          : reason instanceof Error ? reason.message : 'Unable to load reservations. Please try again.');
      });
    return () => { active = false; };
  }, [filter, page, token]);

  if (error) return (
    <div role="alert" className="rounded-3xl border border-rose-200 bg-white p-8">
      <p className="text-rose-700">{error}</p>
      <button type="button" onClick={onRetry} className={`${buttonStyle} mt-5`}>Try again</button>
    </div>
  );
  if (!result) return <p role="status" className="rounded-3xl border border-stone-200 bg-white p-8">Loading reservations…</p>;

  const pageCount = Math.max(1, Math.ceil(result.total / result.limit));
  return (
    <div aria-live="polite">
      {result.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-midnight">{result.total === 0 && filter === 'ALL' ? 'No reservations yet' : 'No reservations found'}</h2>
          <p className="mt-3 text-sm text-slate-500">{filter === 'ALL' ? 'Browse available properties to find your next home.' : `You have no ${labels[filter].toLowerCase()} reservations on this page.`}</p>
          <Link href="/properties" className={`${buttonStyle} mt-6`}>Browse properties</Link>
        </div>
      ) : (
        <ul className="space-y-5">
          {result.items.map((item) => <li key={item.id}><ReservationCard item={item} /></li>)}
        </ul>
      )}
      {(result.total > 0 || result.page > 1) && (
        <nav aria-label="Reservations pagination" className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button type="button" disabled={result.page <= 1} onClick={() => onPageChange(result.page - 1)} className={buttonStyle}>Previous</button>
          <p className="text-sm text-slate-500">Page {result.page} of {pageCount} · {result.total} reservations</p>
          <button type="button" disabled={result.page >= pageCount} onClick={() => onPageChange(result.page + 1)} className={buttonStyle}>Next</button>
        </nav>
      )}
    </div>
  );
}

function ReservationCard({ item }: { item: MyReservationDto }) {
  const { property } = item;
  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white sm:flex">
      <div className="relative min-h-52 bg-stone-100 sm:w-64 sm:shrink-0">
        <Image src={resolveImageSrc(property.primaryImageUrl)} alt={property.title} fill sizes="(min-width: 640px) 256px, 100vw" className={property.primaryImageUrl ? 'object-cover' : 'object-contain p-8'} />
      </div>
      <div className="min-w-0 flex-1 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{getListingTypeLabel(property.listingType)} · {getPropertyCategoryLabel(property.category)}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>{labels[item.status]}</span>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-midnight">{property.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{[property.city, property.state, property.country].filter(Boolean).join(', ')}</p>
        <p className="mt-4 text-xl font-semibold text-gold-deep">{formatCurrency(property.price)}</p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-slate-500">Reservation fee</dt><dd className="mt-1 font-semibold">{formatCurrency(item.reservationFeeAmount)}</dd></div>
          <div><dt className="text-slate-500">Reserved on</dt><dd className="mt-1"><time dateTime={item.createdAt}>{dateLabel(item.createdAt)}</time></dd></div>
        </dl>
        <details className="mt-5 border-t border-stone-100 pt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-midnight">Reservation details</summary>
          <dl className="mt-3 space-y-2 break-words text-slate-600">
            <div><dt className="inline font-medium">Reference: </dt><dd className="inline">{item.id}</dd></div>
            {item.claimedAgentNameSnapshot && <div><dt className="inline font-medium">Assigned agent: </dt><dd className="inline">{item.claimedAgentNameSnapshot}</dd></div>}
            {(['claimedAt', 'completedAt', 'cancelledAt'] as const).map((field) => item[field] && <div key={field}><dt className="inline font-medium">{field === 'claimedAt' ? 'Claimed' : field === 'completedAt' ? 'Completed' : 'Cancelled'}: </dt><dd className="inline">{dateLabel(item[field])}</dd></div>)}
            {item.cancellationReason && <div><dt className="inline font-medium">Cancellation reason: </dt><dd className="inline">{item.cancellationReason}</dd></div>}
          </dl>
        </details>
      </div>
    </article>
  );
}
