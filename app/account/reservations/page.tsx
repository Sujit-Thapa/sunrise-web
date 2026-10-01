'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CircleAlert, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getRoleHomePath, normalizeUserRole } from '@/lib/auth-routing';
import { ApiError } from '@/lib/api';
import { reservationsApi } from '@/lib/backend';
import { resolveImageSrc } from '@/lib/image';
import { formatCurrency } from '@/lib/properties';
import type { MyReservationDto, MyReservationStatus, MyReservationsResponseDto } from '@/types';

type ReservationView = 'reserved' | 'history';

const viewCopy: Record<ReservationView, { tab: string; heading: string; description: string }> = {
  reserved: { tab: 'Reserved Properties', heading: 'Reserved Properties', description: 'Review your reserved properties and their status.' },
  history: { tab: 'History', heading: 'History', description: 'Review previously reserved properties and their final status.' },
};
const buttonStyle = 'inline-flex items-center justify-center rounded-md text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusLabel(status: MyReservationStatus) {
  return status === 'ACTIVE' ? 'Reserved' : status.charAt(0) + status.slice(1).toLowerCase();
}

function statusStyle(status: MyReservationStatus) {
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700';
  if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700';
  if (status === 'CLAIMED') return 'bg-sky-50 text-sky-700';
  return 'bg-[#fff2ea] text-[#c9704e]';
}

export default function MyReservationsPage() {
  const { user, token, loading } = useAuthSession();
  const [view, setView] = useState<ReservationView>('reserved');
  const [refreshIndex, setRefreshIndex] = useState(0);

  return (
    <main className="bg-[#f8f6f1] px-4 pb-8 pt-5 sm:px-8 sm:pb-12 sm:pt-9">
      <div className="mx-auto max-w-[1088px]">
        <section className="rounded-xl border border-[#e5a28a] bg-[#fffcfa] px-4 py-3 sm:px-5" aria-labelledby="reservations-intro">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0ea] text-[#d98462]"><CircleAlert className="h-3.5 w-3.5" aria-hidden="true" /></span>
            <div>
              <h1 id="reservations-intro" className="text-sm font-bold text-[#2d2b29]">Your Reserved Properties</h1>
              <p className="mt-0.5 text-xs leading-5 text-stone-500">You&apos;ve successfully reserved the following properties. Sunrise agents will contact you shortly for further procedures including visits, documentation, and more.</p>
              <p className="mt-1 border-t border-[#efc9ba] pt-1 text-xs leading-4 text-[#ca7655]">Priority Status: Your reserved properties are included exclusively for you. Other interested customers cannot purchase these properties, giving you all the priority.</p>
            </div>
          </div>
        </section>

        {loading ? <p role="status" className="py-10 text-sm text-stone-500">Checking your account…</p> : !user || !token ? (
          <AccountMessage message="Sign in to view your reservations." action="Sign in" href="/auth/login?next=/account/reservations" />
        ) : normalizeUserRole(user.role) !== 'user' ? (
          <AccountMessage message="Reserved properties are available to customer accounts." action="Go to dashboard" href={getRoleHomePath(user.role)} />
        ) : <>
          <div className="mt-7 flex items-center gap-2 border-b border-stone-200 pb-3" role="tablist" aria-label="Reservation views">
            {(Object.keys(viewCopy) as ReservationView[]).map((value) => <button key={value} type="button" role="tab" aria-selected={view === value} onClick={() => setView(value)} className={`${buttonStyle} px-4 py-1.5 ${view === value ? 'bg-[#3e4a3d] text-white' : 'border border-stone-200 bg-white text-stone-600 hover:border-[#3e4a3d]'}`}>{viewCopy[value].tab}</button>)}
          </div>
          <ReservationResults key={`${token}:${refreshIndex}`} token={token} view={view} onRetry={() => setRefreshIndex((value) => value + 1)} />
        </>}
      </div>
    </main>
  );
}

function AccountMessage({ message, action, href }: { message: string; action: string; href: string }) {
  return <div className="py-10 text-sm text-stone-600"><p>{message}</p><Link href={href} className={`${buttonStyle} mt-4 bg-[#3e4a3d] px-4 py-2 text-white`}>{action}</Link></div>;
}

function ReservationResults({ token, view, onRetry }: { token: string; view: ReservationView; onRetry: () => void }) {
  const [result, setResult] = useState<MyReservationsResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    reservationsApi.findMine(token, { page: 1, limit: 100 }).then((data) => { if (active) setResult(data); }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof ApiError && reason.status === 401 ? 'Your session has expired. Please sign in again.' : reason instanceof Error ? reason.message : 'Unable to load reservations. Please try again.');
    });
    return () => { active = false; };
  }, [token]);
  if (error) return <div role="alert" className="mt-7 rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"><p>{error}</p><button type="button" onClick={onRetry} className={`${buttonStyle} mt-4 bg-[#3e4a3d] px-4 py-2 text-white`}>Try again</button></div>;
  if (!result) return <p role="status" className="py-10 text-sm text-stone-500">Loading reservations…</p>;
  const items = result.items.filter((item) => view === 'reserved' ? item.status === 'ACTIVE' || item.status === 'CLAIMED' : item.status === 'COMPLETED' || item.status === 'CANCELLED');
  const copy = viewCopy[view];
  return <section className="mt-5" aria-live="polite">
    <h2 className="text-base font-bold text-[#2d2b29]">{copy.heading}</h2><p className="mt-1 text-xs text-stone-500">{copy.description}</p>
    {items.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center"><p className="text-sm font-semibold text-[#2d2b29]">No {view === 'reserved' ? 'reserved properties' : 'history'} yet</p><p className="mt-1 text-xs text-stone-500">{view === 'reserved' ? 'Browse available properties to find your next home.' : 'Completed and cancelled reservations will appear here.'}</p>{view === 'reserved' && <Link href="/properties" className={`${buttonStyle} mt-4 bg-[#3e4a3d] px-4 py-2 text-white`}>Browse properties</Link>}</div> : <ul className="mt-4 space-y-3">{items.map((item) => <li key={item.id}><ReservationCard item={item} token={token} onCancelled={onRetry} /></li>)}</ul>}
  </section>;
}

function ReservationCard({ item, token, onCancelled }: { item: MyReservationDto; token: string; onCancelled: () => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const { property } = item;
  const canCancel = item.status === 'ACTIVE' || item.status === 'CLAIMED';
  const cancel = async () => {
    if (!window.confirm('Cancel this reservation?')) return;
    setCancelling(true); setCancelError(null);
    try { await reservationsApi.cancel(item.id, {}, token); onCancelled(); }
    catch (reason) { setCancelError(reason instanceof Error ? reason.message : 'Unable to cancel this reservation.'); }
    finally { setCancelling(false); }
  };
  return <article className="overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(50,43,34,0.05)] sm:flex sm:min-h-[150px]">
    <div className="relative h-40 bg-stone-100 sm:h-auto sm:w-[190px] sm:shrink-0"><Image src={resolveImageSrc(property.primaryImageUrl)} alt={property.title} fill sizes="(min-width: 640px) 190px, 100vw" className={property.primaryImageUrl ? 'object-cover' : 'object-contain p-7'} /></div>
    <div className="min-w-0 flex-1 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2"><span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${statusStyle(item.status)}`}>{statusLabel(item.status)}</span><time dateTime={item.createdAt} className="text-xs text-stone-400">{item.status === 'COMPLETED' ? 'Completed' : item.status === 'CANCELLED' ? 'Cancelled' : 'Reserved'} on {dateLabel(item.completedAt ?? item.cancelledAt ?? item.createdAt)}</time></div>
      <h3 className="mt-2 text-sm font-bold text-[#2d2b29]">{property.title}</h3><p className="mt-0.5 text-xs text-stone-500">{[property.city, property.state].filter(Boolean).join(', ')}</p><p className="mt-1.5 text-lg font-bold text-[#c96f4f]">{formatCurrency(property.price)}</p>
      <p className="mt-1 text-xs text-stone-600">Reservation access: {formatCurrency(item.reservationFeeAmount)}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5"><p className="flex items-center gap-1.5 text-xs text-stone-600"><UserRound className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />{item.claimedAgentNameSnapshot ? `${item.claimedAgentNameSnapshot} assigned` : 'Sunrise agent will be assigned shortly'}</p><div className="flex items-center gap-2">{canCancel && <button type="button" onClick={cancel} disabled={cancelling} className={`${buttonStyle} border border-stone-200 px-3 py-1.5 text-stone-600 hover:border-rose-300 hover:text-rose-700`}>{cancelling ? 'Cancelling…' : 'Cancel'}</button>}<Link href={`/properties/${property.id}`} className={`${buttonStyle} bg-[#cf7654] px-3 py-1.5 text-white hover:bg-[#b96445]`}>View Details</Link></div></div>
      {cancelError && <p role="alert" className="mt-2 text-xs text-rose-700">{cancelError}</p>}
    </div>
  </article>;
}
