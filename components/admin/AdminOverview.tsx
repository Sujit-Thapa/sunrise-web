'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, CircleCheck, Download, Home, Inbox, Plus, Store, Ticket } from 'lucide-react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { resolveImageSrcFromProperty } from '@/lib/image';
import { formatCurrency, formatLocation } from '@/lib/properties';
import type { FinancePaymentResponseDto, FinanceSummaryResponseDto, PropertyResponseDto, ReservationResponseDto, UserPropertyResponseDto } from '@/types';
import { AddPropertyButton, ADMIN_ADD_BLOCKED, PropertyDrawer, PropertyTable, propertyStatus, type InventoryActions } from './PropertyInventory';
import { Avatar, card, downloadCsv, outlineButton, PageHeader, primaryButton, relativeTime, SectionCard, StatCard, StatusPill, TextAction } from './staff-ui';

type Counts = { all: number; PENDING_REVIEW: number; APPROVED: number; REJECTED: number; HIDDEN: number } | null;

const PAYMENT_SEGMENTS = [
  { status: 'SUCCEEDED', label: 'Succeeded', color: '#00d293' },
  { status: 'PENDING', label: 'Pending', color: '#fdb515' },
  { status: 'FAILED', label: 'Failed', color: '#fc6584' },
  { status: 'REFUNDED', label: 'Refunded', color: '#111111' },
];

function PaymentsDonut({ summary }: { summary: FinanceSummaryResponseDto | null }) {
  if (!summary) return <div className="flex items-center gap-8 px-5 py-8"><Skeleton className="size-[208px] rounded-full" /><div className="space-y-3">{PAYMENT_SEGMENTS.map((segment) => <Skeleton key={segment.status} className="h-3 w-24" />)}</div></div>;
  const rows = PAYMENT_SEGMENTS.map((segment) => ({ ...segment, value: summary.paymentsByStatus.find((item) => item.status.toUpperCase() === segment.status)?.count ?? 0 }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const gap = total > 1 ? 4 : 0;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-8 px-5 pb-6 pt-8">
      <svg viewBox="0 0 220 220" className="size-[208px] -rotate-90" role="img" aria-label={`Payments by status: ${rows.map((row) => `${row.label} ${row.value}`).join(', ')}`}>
        <circle cx="110" cy="110" r={radius} fill="none" stroke="#efece7" strokeWidth="24" />
        {total > 0 ? rows.filter((row) => row.value > 0).map((row) => {
          const length = (row.value / total) * circumference;
          const dash = `${Math.max(length - gap, 0)} ${circumference}`;
          const element = <circle key={row.status} cx="110" cy="110" r={radius} fill="none" stroke={row.color} strokeWidth="24" strokeDasharray={dash} strokeDashoffset={-offset} />;
          offset += length;
          return element;
        }) : null}
      </svg>
      <ul className="space-y-2.5 text-xs">
        {rows.map((row) => <li key={row.status} className="flex items-center gap-2"><span aria-hidden="true" className="h-[3px] w-5 rounded-full" style={{ backgroundColor: row.color }} /><span className="text-[#6b665f]">{row.label}</span><strong className="text-[#2a2723]">{row.value}</strong></li>)}
      </ul>
    </div>
  );
}

type ActivityItem = { id: string; title: string; detail: string; role: string; at: string; icon: typeof Plus; tone: string };

export default function AdminOverview({
  companyProperties, reservations, reservationsTotal, summary, payments, counts, pendingQueue,
  actions, onNavigate, onReview, onAddProperty,
}: {
  companyProperties: PropertyResponseDto[] | null;
  reservations: ReservationResponseDto[];
  reservationsTotal: number;
  summary: FinanceSummaryResponseDto | null;
  payments: FinancePaymentResponseDto[];
  counts: Counts;
  pendingQueue: UserPropertyResponseDto[] | null;
  actions: InventoryActions;
  onNavigate: (section: 'properties' | 'reservations' | 'users' | 'finance' | 'agents' | 'settings') => void;
  onReview: (listing: UserPropertyResponseDto) => void;
  onAddProperty: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const properties = useMemo(() => companyProperties ?? [], [companyProperties]);
  const live = properties.filter((property) => property.status === 'ACTIVE').length;
  const inProgress = summary?.reservationsByStatus.filter((item) => ['PENDING', 'ACTIVE', 'CLAIMED'].includes(item.status.toUpperCase())).reduce((sum, item) => sum + item.count, 0);
  const tableRows = [...properties]
    .filter((property) => statusFilter === 'ALL' || property.status === statusFilter)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);
  const viewing = properties.find((property) => property.id === viewingId) ?? null;

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...properties.map((property) => ({ id: `p-${property.id}`, title: 'Property added', detail: `${property.title} was added to the inventory.`, role: 'Agent', at: property.createdAt, icon: Plus, tone: 'bg-[#eef3ee] text-[#3e6b4a]' })),
      ...payments.map((payment) => ({ id: `pay-${payment.id}`, title: `Payment ${payment.status.toLowerCase()}`, detail: `${formatCurrency(payment.amount)} from ${payment.user?.fullName ?? 'a customer'} for ${payment.property?.title ?? 'a property'}.`, role: 'Finance', at: payment.succeededAt ?? payment.createdAt, icon: CircleCheck, tone: 'bg-[#fbe9e1] text-[#cc7654]' })),
      ...reservations.map((reservation) => ({ id: `r-${reservation.id}`, title: 'Reservation made', detail: `${reservation.userNameSnapshot} reserved ${reservation.property.title}.`, role: 'Customer', at: reservation.createdAt, icon: Ticket, tone: 'bg-[#f4f1ec] text-[#6b665f]' })),
      ...(pendingQueue ?? []).map((listing) => ({ id: `m-${listing.id}`, title: 'Submission received', detail: `${listing.submittedBy.fullName} submitted ${listing.title} for review.`, role: 'Marketplace', at: listing.createdAt, icon: Store, tone: 'bg-[#fdf1d6] text-[#a8740f]' })),
    ];
    return items.filter((item) => item.at).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 4);
  }, [properties, payments, reservations, pendingQueue]);

  const exportReport = () => downloadCsv('sunrise-operations.csv', [
    { Metric: 'Live listings', Value: live },
    { Metric: 'Reservations', Value: reservationsTotal },
    { Metric: 'Awaiting review', Value: counts?.PENDING_REVIEW ?? 0 },
    { Metric: 'Marketplace submissions', Value: counts?.all ?? 0 },
    { Metric: 'Collected (NPR)', Value: summary?.totalCollectedAmount ?? 0 },
    { Metric: 'Refunded (NPR)', Value: summary?.totalRefundedAmount ?? 0 },
    { Metric: 'Pending (NPR)', Value: summary?.pendingAmount ?? 0 },
    ...PAYMENT_SEGMENTS.map((segment) => ({ Metric: `${segment.label} payments`, Value: summary?.paymentsByStatus.find((item) => item.status.toUpperCase() === segment.status)?.count ?? 0 })),
  ]);

  const loading = <Skeleton className="h-8 w-14" />;

  return (
    <>
      <PageHeader title="Operations overview" subtitle="Property reviews, payments and reservations across Nepal." actions={<>
        <button type="button" onClick={exportReport} className={outlineButton}><Download aria-hidden="true" className="h-4 w-4" />Export report</button>
        <AddPropertyButton onAdd={onAddProperty} blockedReason={ADMIN_ADD_BLOCKED} />
      </>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Live listings" value={companyProperties ? live : loading} detail={companyProperties ? `${properties.length} in inventory` : undefined} onClick={() => onNavigate('properties')} />
        <StatCard label="Reservations" value={reservationsTotal} detail={inProgress != null ? `${inProgress} in progress` : undefined} onClick={() => onNavigate('reservations')} />
        <StatCard label="Awaiting review" value={counts ? counts.PENDING_REVIEW : loading} detail="Admin review required" onClick={() => onNavigate('users')} />
        <StatCard label="Marketplace" value={counts ? counts.all : loading} detail={counts ? `${counts.APPROVED} live in the marketplace` : undefined} onClick={() => onNavigate('users')} />
        <StatCard label="Collected" value={summary ? formatCurrency(summary.totalCollectedAmount) : loading} detail={summary ? `${summary.successfulPaymentCount} successful payments` : undefined} onClick={() => onNavigate('finance')} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <SectionCard title="Payments by status" subtitle="Count of payments to date." action={<TextAction onClick={() => onNavigate('finance')}>View all</TextAction>}>
          <PaymentsDonut summary={summary} />
        </SectionCard>
        <SectionCard title="Recent reservations" subtitle="Latest buyer commitments" action={<TextAction onClick={() => onNavigate('reservations')}>View all</TextAction>}>
          <ul className="mt-3 divide-y divide-[#ebe7e0] px-5 pb-3">
            {reservations.slice(0, 3).map((reservation) => (
              <li key={reservation.id} className="flex items-center gap-3 py-3.5">
                <Avatar name={reservation.userNameSnapshot} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{reservation.userNameSnapshot}</p><p className="truncate text-[11px] text-[#77726b]">{reservation.property.title}</p><div className="mt-1.5"><StatusPill status={reservation.status} upper={false} /></div></div>
                <p className="shrink-0 text-xs font-semibold">{formatCurrency(reservation.reservationFeeAmount)}</p>
              </li>
            ))}
            {!reservations.length ? <li className="py-10 text-center text-sm text-[#77726b]">No reservations yet.</li> : null}
          </ul>
        </SectionCard>
        <SectionCard title="Quick actions" subtitle="Common administration tasks" className="self-start">
          <div className="flex flex-wrap gap-2.5 px-5 pb-6 pt-5">
            <button type="button" onClick={() => onNavigate('agents')} className={primaryButton}><Plus aria-hidden="true" className="h-4 w-4" />Create agent</button>
            <button type="button" onClick={() => onNavigate('agents')} className={outlineButton}><ArrowUpRight aria-hidden="true" className="h-4 w-4" />Manage agents</button>
            <button type="button" onClick={() => onNavigate('users')} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2a2723] px-5 text-sm font-semibold text-white hover:bg-black"><Plus aria-hidden="true" className="h-4 w-4" />Review queue</button>
            <button type="button" onClick={() => onNavigate('settings')} className={outlineButton}><ArrowUpRight aria-hidden="true" className="h-4 w-4" />Settings</button>
          </div>
        </SectionCard>
      </div>

      <section className={`${card} mt-6 overflow-hidden`}>
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5">
          <div><h2 className="text-[22px] font-semibold">Sunrise properties</h2><p className="mt-1 text-[13px] text-[#6b665f]">{properties.length} listings · availability and reservation controls</p></div>
          <div className="flex items-center gap-3">
            <label className="relative"><span className="sr-only">Filter by status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-[34px] appearance-none rounded-full border border-[#e3ded6] bg-white px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]">
                <option value="ALL">All statuses</option>
                {Object.entries(propertyStatus).map(([value, style]) => <option key={value} value={value}>{style.label}</option>)}
              </select>
            </label>
            <TextAction onClick={() => onNavigate('properties')}>View all {properties.length}</TextAction>
          </div>
        </div>
        {companyProperties ? <PropertyTable rows={tableRows} actions={actions} onView={setViewingId} empty="No company properties yet." /> : <div className="px-5 pb-5"><TableSkeleton label="Loading properties" rows={4} /></div>}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Marketplace review queue" subtitle="Public submissions awaiting listing review" action={<TextAction onClick={() => onNavigate('users')}>Open marketplace</TextAction>} className="self-start">
          <div className="px-5 pb-3">
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#fbefe9] px-3 py-2.5 text-xs text-[#6b665f]"><Inbox aria-hidden="true" className="h-4 w-4 text-[#cc7654]" /><strong className="text-sm text-[#2a2723]">{counts?.PENDING_REVIEW ?? '…'}</strong>pending review</p>
            <ul className="mt-3 divide-y divide-[#ebe7e0]">
              {(pendingQueue ?? []).map((listing) => (
                <li key={listing.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-11 w-[52px] shrink-0 overflow-hidden rounded-lg bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(listing)} alt="" fill sizes="52px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold first-letter:uppercase">{listing.title}</p><p className="truncate text-[11px] text-[#77726b]">{listing.submittedBy.fullName} · {formatLocation(listing)}</p></div>
                  <p className="hidden shrink-0 whitespace-nowrap text-sm font-semibold sm:block">{formatCurrency(listing.price)}</p>
                  <p className="hidden w-16 shrink-0 text-[11px] text-[#77726b] md:block">{relativeTime(listing.createdAt)}</p>
                  <button type="button" onClick={() => onReview(listing)} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#2a2723] px-3.5 text-xs font-semibold text-white hover:bg-black">Review<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
                </li>
              ))}
              {pendingQueue && !pendingQueue.length ? <li className="py-10 text-center text-sm text-[#77726b]">No listings are waiting for review.</li> : null}
              {!pendingQueue ? <li className="py-4"><TableSkeleton label="Loading review queue" rows={3} columns={3} /></li> : null}
            </ul>
          </div>
        </SectionCard>
        <SectionCard title="Operational activity" subtitle="Latest portfolio and team updates" className="self-start">
          <ul className="mt-3 divide-y divide-[#ebe7e0] px-5 pb-4">
            {activity.map((item) => (
              <li key={item.id} className="flex gap-3 py-3.5">
                <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full ${item.tone}`}><item.icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{item.title}</p><p className="shrink-0 text-[11px] text-[#9a958e]">{relativeTime(item.at)}</p></div><p className="mt-0.5 text-xs text-[#6b665f]">{item.detail}</p><p className="mt-1 text-[10px] font-semibold uppercase text-[#cc7654]">{item.role}</p></div>
              </li>
            ))}
            {!activity.length ? <li className="flex flex-col items-center py-10 text-sm text-[#77726b]"><Home aria-hidden="true" className="mb-2 h-5 w-5" />No activity yet.</li> : null}
          </ul>
        </SectionCard>
      </div>

      {viewing ? <PropertyDrawer property={viewing} actions={actions} onClose={() => setViewingId(null)} /> : null}
    </>
  );
}
