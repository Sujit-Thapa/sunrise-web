'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowUp, Plus } from 'lucide-react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { financeApi, reservationsApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
import type { FinancePaymentResponseDto, FinanceSummaryResponseDto, PropertyResponseDto, ReservationResponseDto } from '@/types';
import { PaymentsTable, ReservationsTable } from './StaffTables';
import { card, formatNpr, outlineButton, Pill, primaryButton, StatCard } from './staff-ui';

export type AgentActivity = {
  reservations: ReservationResponseDto[] | null;
  payments: FinancePaymentResponseDto[] | null;
  summary: FinanceSummaryResponseDto | null;
};

// Loads the reservations and payments an agent can see; each part fails independently.
export function useAgentActivity(token: string, limit: number): AgentActivity {
  const [reservations, setReservations] = useState<ReservationResponseDto[] | null>(null);
  const [payments, setPayments] = useState<FinancePaymentResponseDto[] | null>(null);
  const [summary, setSummary] = useState<FinanceSummaryResponseDto | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    reservationsApi.findAll({ page: 1, limit }, token).then((result) => { if (active) setReservations(result.items ?? []); }).catch(() => { if (active) setReservations([]); });
    financeApi.findPayments({ page: 1, limit }, token).then((result) => { if (active) setPayments(result.items ?? []); }).catch(() => { if (active) setPayments([]); });
    financeApi.getSummary(token).then((result) => { if (active) setSummary(result); }).catch(() => undefined);
    return () => { active = false; };
  }, [token, limit]);

  return { reservations, payments, summary };
}

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function AgentDashboard({ name, token, properties, busyId, onAdd, onEdit, onPublish, onOpen }: {
  name: string;
  token: string;
  properties: PropertyResponseDto[];
  busyId: string | null;
  onAdd: () => void;
  onEdit: (property: PropertyResponseDto) => void;
  onPublish: (property: PropertyResponseDto) => void;
  onOpen: (view: 'inventory' | 'reservations' | 'payments') => void;
}) {
  const { reservations, payments, summary } = useAgentActivity(token, 5);
  const live = properties.filter((property) => property.status === 'ACTIVE').length;
  const drafts = properties.filter((property) => property.status === 'DRAFT');
  const draftsWithoutPhoto = drafts.filter((property) => !property.images?.length).length;
  const activeReservations = reservations?.filter((item) => !['COMPLETED', 'CANCELLED'].includes(String(item.status).toUpperCase())).length;
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight">{greeting()}, {name.split(' ')[0] || 'there'}</h1>
          <p className="mt-1 text-sm text-[#6b665f]">Your listings and reservations · {today}</p>
        </div>
        <button type="button" onClick={onAdd} className={primaryButton}><Plus aria-hidden="true" className="h-4 w-4" />New listing</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live listings" value={live} detail={`${properties.length} listing${properties.length === 1 ? '' : 's'} in total`} onClick={() => onOpen('inventory')} />
        <StatCard label="Drafts" value={drafts.length} detail={draftsWithoutPhoto ? `${draftsWithoutPhoto} need${draftsWithoutPhoto === 1 ? 's' : ''} a cover photo` : 'All drafts have photos'} onClick={() => onOpen('inventory')} />
        <StatCard label="Active reservations" value={activeReservations ?? <Skeleton className="h-8 w-10" />} detail="Pending and claimed holds" onClick={() => onOpen('reservations')} />
        <StatCard label="Collected" value={summary ? formatNpr(summary.totalCollectedAmount) : <Skeleton className="h-8 w-28" />} detail="Settled payments" onClick={() => onOpen('payments')} />
      </div>

      {drafts.length ? (
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div><h2 className="text-[22px] font-semibold">Continue drafting</h2><p className="mt-1 text-sm text-[#6b665f]">Pick up where you left off on your property listings.</p></div>
            <p className="text-sm text-[#6b665f]">{drafts.length} saved</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {drafts.slice(0, 3).map((property) => (
              <article key={property.id} className={`${card} p-4`}>
                <div className="flex items-center justify-between"><p className="text-[11px] uppercase text-[#9a958e]">ID {property.id.slice(-6).toUpperCase()}</p><Pill tone="gray" upper>● Draft</Pill></div>
                <div className="relative mt-2.5 aspect-[389/100] overflow-hidden rounded-lg bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(property)} alt="" fill sizes="400px" className="object-cover" /></div>
                <h3 className="mt-3 truncate text-sm font-semibold first-letter:uppercase">{property.title}</h3>
                <p className="mt-0.5 text-[11px] text-[#77726b]">{[property.street, property.city].filter(Boolean).join(', ') || property.country}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div><p className="text-[10px] text-[#9a958e]">Asking price</p><p className="font-semibold">{formatNpr(property.price, property.listingType)}</p></div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit(property)} className={`${outlineButton} h-8 px-3 text-xs`}>Edit</button>
                    <button type="button" disabled={busyId === property.id} onClick={() => onPublish(property)} className={`${primaryButton} h-8 gap-1 px-3 text-xs`}><ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />Publish</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-start justify-between gap-3 px-5 py-5"><div><h2 className="text-lg font-semibold">Latest reservations</h2><p className="mt-1 text-[13px] text-[#6b665f]">Most recent activity on your properties</p></div><button type="button" onClick={() => onOpen('reservations')} className="text-sm font-semibold text-[#c56847] hover:underline">View all</button></div>
          {reservations ? <ReservationsTable reservations={reservations} properties={properties} /> : <div className="px-5 pb-5"><TableSkeleton label="Loading reservations" rows={4} /></div>}
        </section>
        <section className={`${card} overflow-hidden self-start`}>
          <div className="flex items-start justify-between gap-3 px-5 py-5"><div><h2 className="text-lg font-semibold">Latest payments</h2><p className="mt-1 text-[13px] text-[#6b665f]">Recent payments linked to your reservations</p></div><button type="button" onClick={() => onOpen('payments')} className="text-sm font-semibold text-[#c56847] hover:underline">View all</button></div>
          {payments ? <PaymentsTable payments={payments} /> : <div className="px-5 pb-5"><TableSkeleton label="Loading payments" rows={4} /></div>}
        </section>
      </div>
    </>
  );
}

export function AgentActivityPage({ kind, token, properties }: { kind: 'reservations' | 'payments'; token: string; properties: PropertyResponseDto[] }) {
  const { reservations, payments } = useAgentActivity(token, 50);
  const ready = kind === 'reservations' ? reservations : payments;
  return (
    <>
      <div className="mb-6">
        <h1 className="text-[32px] font-bold leading-tight">{kind === 'reservations' ? 'Reservations' : 'Payments'}</h1>
        <p className="mt-1 text-sm text-[#6b665f]">{kind === 'reservations' ? 'Buyer holds on your properties' : 'Payments linked to your reservations'}</p>
      </div>
      <section className={`${card} overflow-hidden`}>
        {ready === null ? <div className="p-5"><TableSkeleton label={`Loading ${kind}`} /></div> : kind === 'reservations' ? <ReservationsTable reservations={reservations ?? []} properties={properties} /> : <PaymentsTable payments={payments ?? []} />}
      </section>
    </>
  );
}
