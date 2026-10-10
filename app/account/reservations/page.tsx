'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getRoleHomePath, normalizeUserRole } from '@/lib/auth-routing';
import { ApiError } from '@/lib/api';
import { reservationsApi } from '@/lib/backend';
import { resolveImageSrc } from '@/lib/image';
import { formatCurrency } from '@/lib/properties';
import type { MyReservationDto, MyReservationStatus, MyReservationsResponseDto } from '@/types';
import { RowsSkeleton, Skeleton } from '@/components/ui/Skeleton';

type ReservationView = 'reserved' | 'history';

const viewCopy: Record<ReservationView, { tab: string; heading: string; description: string }> = {
  reserved: { tab: 'Reserved Properties', heading: 'Reserved Properties', description: 'Review your reserved properties and their status.' },
  history: { tab: 'History', heading: 'History', description: 'Review previously reserved properties and their final status.' },
};
const buttonStyle = 'inline-flex items-center justify-center rounded-full text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_COPY: Record<MyReservationStatus, { label: string; date: string }> = {
  ACTIVE: { label: 'Reserved', date: 'Reserved on' },
  CLAIMED: { label: 'Agent assigned', date: 'Reserved on' },
  COMPLETED: { label: 'Completed', date: 'Completed on' },
  CANCELLED: { label: 'Canceled', date: 'Canceled on' },
};

export default function MyReservationsPage() {
  const { user, token, loading } = useAuthSession();
  const [view, setView] = useState<ReservationView>('reserved');
  const [refreshIndex, setRefreshIndex] = useState(0);

  return (
    <main className="bg-[#f7f5f1] px-4 pb-16 pt-2 sm:px-8 sm:pt-6">
      <div className="mx-auto max-w-[1300px]">
        <section className="flex flex-col gap-5 rounded-[20px] border-[1.5px] border-[#e2a083] bg-white px-6 py-7 sm:flex-row sm:items-center sm:px-8" aria-labelledby="reservations-intro">
          <span aria-hidden="true" className="grid size-[62px] shrink-0 place-items-center rounded-[14px] bg-[#fdf1ec] text-[#cc7654]"><CircleX className="h-7 w-7" strokeWidth={1.5} /></span>
          <div className="min-w-0">
            <h1 id="reservations-intro" className="text-2xl font-bold text-[#2a2723]">Your Reserved Properties</h1>
            <p className="mt-1.5 text-[15px] text-[#6b665f]">You&apos;ve successfully reserved the following properties. Sunrise agents will contact you shortly for further procedures including site visits, documentation, and more.</p>
            <p className="mt-2.5 inline-block rounded-md bg-[#f9e7e0] px-3 py-1.5 text-[13px] font-medium text-[#b5583a]">Priority Status: Your reserved properties are locked exclusively for you. Other users cannot contact Sunrise agents for these properties, placing you at the top of our priority list.</p>
          </div>
        </section>

        {loading ? <div className="mt-8"><RowsSkeleton label="Checking your account" /></div> : !user || !token ? (
          <AccountMessage message="Sign in to view your reservations." action="Sign in" href="/auth/login?next=/account/reservations" />
        ) : normalizeUserRole(user.role) !== 'user' ? (
          <AccountMessage message="Reserved properties are available to customer accounts." action="Go to dashboard" href={getRoleHomePath(user.role)} />
        ) : <>
          <div className="mt-8 flex items-center gap-3 border-b border-[#e6e1d8] pb-4" role="tablist" aria-label="Reservation views">
            {(Object.keys(viewCopy) as ReservationView[]).map((value) => <button key={value} type="button" role="tab" aria-selected={view === value} onClick={() => setView(value)} className={`${buttonStyle} h-[42px] px-5 ${view === value ? 'bg-[#3e4a3d] text-white' : 'border border-[#ebe7e0] bg-white font-medium text-[#2a2723] hover:border-[#3e4a3d]'}`}>{viewCopy[value].tab}</button>)}
          </div>
          <ReservationResults key={`${token}:${refreshIndex}`} token={token} view={view} onRetry={() => setRefreshIndex((value) => value + 1)} />
        </>}

        <section className="mt-8 rounded-[20px] border border-[#ebe7e0] bg-white px-6 py-8 text-center">
          <h2 className="text-base font-bold text-[#2a2723]">Have any questions?</h2>
          <p className="mt-2 text-[13px] text-[#6b665f]">Our team can help with site visits, documents and payments for your reservations.</p>
          <Link href="/contact" className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#3e4a3d] px-10 text-sm font-semibold text-white hover:bg-[#303c2f]">Contact Support Desk</Link>
        </section>
      </div>
    </main>
  );
}

function AccountMessage({ message, action, href }: { message: string; action: string; href: string }) {
  return <div className="py-10 text-sm text-[#6b665f]"><p>{message}</p><Link href={href} className={`${buttonStyle} mt-4 h-10 bg-[#3e4a3d] px-5 text-white`}>{action}</Link></div>;
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
  if (!result) return <div className="mt-8"><Skeleton className="h-7 w-56" /><Skeleton className="mb-6 mt-2 h-4 w-72" /><RowsSkeleton label="Loading reservations" rows={3} /></div>;
  const items = result.items.filter((item) => view === 'reserved' ? item.status === 'ACTIVE' || item.status === 'CLAIMED' : item.status === 'COMPLETED' || item.status === 'CANCELLED');
  const copy = viewCopy[view];
  return <section className="mt-8" aria-live="polite">
    <h2 className="text-2xl font-bold text-[#2a2723]">{copy.heading}</h2><p className="mt-1.5 text-sm text-[#6b665f]">{copy.description}</p>
    {items.length === 0 ? <div className="mt-6 rounded-[20px] border border-dashed border-[#d9d3c9] bg-white px-6 py-12 text-center"><p className="font-semibold text-[#2a2723]">No {view === 'reserved' ? 'reserved properties' : 'history'} yet</p><p className="mt-1 text-sm text-[#6b665f]">{view === 'reserved' ? 'Browse available properties to find your next home.' : 'Completed and canceled reservations will appear here.'}</p>{view === 'reserved' && <Link href="/properties" className={`${buttonStyle} mt-5 h-10 bg-[#3e4a3d] px-5 text-white`}>Browse properties</Link>}</div> : <ul className={`mt-6 space-y-6 ${view === 'reserved' ? 'max-w-[862px]' : ''}`}>{items.map((item) => <li key={item.id}><ReservationCard item={item} token={token} onCancelled={onRetry} /></li>)}</ul>}
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
  const copy = STATUS_COPY[item.status] ?? { label: item.status, date: 'Updated on' };
  const agent = item.claimedAgentNameSnapshot;
  return <article className="overflow-hidden rounded-[24px] border border-[#ebe7e0] bg-white sm:flex">
    <div className="relative h-52 bg-[#e8e4db] sm:h-auto sm:min-h-[235px] sm:w-[353px] sm:shrink-0"><Image src={resolveImageSrc(property.primaryImageUrl)} alt={property.title} fill sizes="(min-width: 640px) 353px, 100vw" className={property.primaryImageUrl ? 'object-cover' : 'object-contain p-10'} /></div>
    <div className="flex min-w-0 flex-1 flex-col px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-2"><span className="rounded-md bg-[#fbe9e1] px-2.5 py-1 text-xs font-bold uppercase text-[#b5583a]">{copy.label}</span><time dateTime={item.completedAt ?? item.cancelledAt ?? item.createdAt} className="text-sm text-[#77726b]">{copy.date}: {dateLabel(item.completedAt ?? item.cancelledAt ?? item.createdAt)}</time></div>
      <h3 className="mt-3 text-xl font-semibold text-[#2a2723] first-letter:uppercase">{property.title}</h3>
      <p className="mt-0.5 text-sm text-[#77726b]">{[property.city, property.state].filter(Boolean).join(', ')}</p>
      <p className="mt-1.5 text-[22px] font-bold tracking-[0.02em] text-[#cc7654]">{formatCurrency(property.price)}</p>
      <p className="mb-4 mt-2.5 text-sm text-[#77726b]"><strong className="font-semibold text-[#2a2723]">Reservation fee:</strong> {formatCurrency(item.reservationFeeAmount)}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#ebe7e0] pt-4">
        <p className="flex items-center gap-2 text-[13px] font-medium text-[#2a2723]"><span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[#efece7] text-[10px] font-bold">{agent ? agent.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'S'}</span>{agent ? `Sunrise Agent Assigned (${agent})` : 'Agent assignment pending'}</p>
        <div className="flex items-center gap-2">{canCancel && <button type="button" onClick={cancel} disabled={cancelling} className={`${buttonStyle} h-[34px] border border-[#e3ded6] px-4 font-medium text-[#6b665f] hover:border-[#b23b2e] hover:text-[#b23b2e]`}>{cancelling ? 'Canceling…' : 'Cancel'}</button>}<Link href={`/properties/${property.id}`} className={`${buttonStyle} h-[34px] bg-[#cc7654] px-4 text-white hover:bg-[#b66545]`}>View Details</Link></div>
      </div>
      {cancelError && <p role="alert" className="mt-2 text-xs text-[#b23b2e]">{cancelError}</p>}
    </div>
  </article>;
}
