'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Eye, MapPin, MoreHorizontal, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { resolveImageSrcFromProperty } from '@/lib/image';
import { formatArea, formatLocation, getPropertyCategoryLabel } from '@/lib/properties';
import type { PropertyCategory, PropertyModerationLogDto, PropertyResponseDto, PropertyStatus } from '@/types';
import { card, downloadCsv, formatDay, formatNpr, outlineButton, PageHeader, Pill, primaryButton, relativeTime, StatCard, tableHead, type Tone } from './staff-ui';

const PAGE_SIZE = 10;
const CATEGORIES: Array<PropertyCategory | 'ALL'> = ['ALL', 'HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'];
const SORTS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'price-asc', label: 'Price: low to high' },
];

// Company-listing statuses as the operations designs name them. HIDDEN is an agent hiding their own
// listing; SUSPENDED is an admin moderation action with a reason and an audit log.
export const propertyStatus: Record<PropertyStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Available', tone: 'green' },
  RESERVED: { label: 'Reserved', tone: 'orange' },
  HIDDEN: { label: 'Hidden', tone: 'gray' },
  SUSPENDED: { label: 'Suspended', tone: 'red' },
  DRAFT: { label: 'Draft', tone: 'gray' },
  COMPLETED: { label: 'Completed', tone: 'green' },
};

export function PropertyStatusPill({ status }: { status: PropertyStatus }) {
  const style = propertyStatus[status] ?? { label: status, tone: 'gray' as Tone };
  return <Pill tone={style.tone}>{style.label}</Pill>;
}

export type InventoryActions = {
  busyId: string | null;
  onEdit: (property: PropertyResponseDto) => void;
  onPublish: (property: PropertyResponseDto) => void;
  onHide: (property: PropertyResponseDto) => void;
  onDelete: (property: PropertyResponseDto) => void;
  // Admin-only moderation; agents never receive these.
  onSuspend?: (property: PropertyResponseDto) => void;
  onReactivate?: (property: PropertyResponseDto) => void;
  loadModerationLog?: (propertyId: string) => Promise<PropertyModerationLogDto[]>;
};

// Asks for the reason the moderation endpoints require; resolves null when cancelled.
export function useReasonPrompt() {
  const [request, setRequest] = useState<{ title: string; confirm: string; danger: boolean; resolve: (reason: string | null) => void } | null>(null);
  const [reason, setReason] = useState('');
  const ask = (title: string, confirm: string, danger = false) => new Promise<string | null>((resolve) => { setReason(''); setRequest({ title, confirm, danger, resolve }); });
  const close = (value: string | null) => { request?.resolve(value); setRequest(null); };
  const dialog = request ? (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 px-4" onClick={() => close(null)}>
      <form role="dialog" aria-modal="true" aria-labelledby="reason-title" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (reason.trim()) close(reason.trim()); }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="reason-title" className="text-lg font-semibold">{request.title}</h2>
        <label className="mt-4 block"><span className="text-[13px] font-medium">Reason</span><textarea autoFocus required rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Recorded in the moderation log" className="mt-1.5 w-full rounded-xl border border-[#e3ded6] px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]" /></label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => close(null)} className={outlineButton}>Cancel</button>
          <button type="submit" disabled={!reason.trim()} className={request.danger ? 'inline-flex h-10 items-center rounded-full bg-[#f04438] px-5 text-sm font-semibold text-white hover:bg-[#d92d20] disabled:opacity-50' : primaryButton}>{request.confirm}</button>
        </div>
      </form>
    </div>
  ) : null;
  return { ask, dialog };
}

export default function PropertyInventory({ title, subtitle, tableTitle, properties, loading, onAdd, actions, addBlockedReason }: {
  title: string;
  subtitle: string;
  tableTitle: string;
  properties: PropertyResponseDto[];
  loading: boolean;
  onAdd: () => void;
  actions: InventoryActions;
  // Set when the viewer can't create listings (admins); the button stays visible with the reason.
  addBlockedReason?: string;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<PropertyCategory | 'ALL'>('ALL');
  const [status, setStatus] = useState<PropertyStatus | 'ALL'>('ALL');
  const [sort, setSort] = useState('updated');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ id: string; tab: DrawerTab } | null>(null);

  const counts = useMemo(() => {
    const result = { total: properties.length, ACTIVE: 0, RESERVED: 0, HIDDEN: 0, SUSPENDED: 0, DRAFT: 0, COMPLETED: 0 };
    properties.forEach((property) => { result[property.status] += 1; });
    return result;
  }, [properties]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = properties.filter((property) =>
      (category === 'ALL' || property.category === category)
      && (status === 'ALL' || property.status === status)
      && (!term || `${property.title} ${formatLocation(property)}`.toLowerCase().includes(term)));
    const time = (value: string) => Date.parse(value) || 0;
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return Number(a.price) - Number(b.price);
      if (sort === 'price-desc') return Number(b.price) - Number(a.price);
      if (sort === 'newest') return time(b.createdAt) - time(a.createdAt);
      if (sort === 'oldest') return time(a.createdAt) - time(b.createdAt);
      return time(b.updatedAt) - time(a.updatedAt);
    });
  }, [properties, search, category, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedProperty = selected ? properties.find((property) => property.id === selected.id) ?? null : null;
  const filterBy = (next: PropertyStatus | 'ALL') => { setStatus(next); setPage(1); };

  const exportReport = () => downloadCsv('sunrise-properties.csv', filtered.map((property) => ({
    Title: property.title,
    Status: propertyStatus[property.status]?.label ?? property.status,
    Type: property.listingType,
    Category: property.category,
    Price: Number(property.price),
    Location: formatLocation(property),
    Updated: property.updatedAt,
  })));

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={<>
        <button type="button" onClick={exportReport} disabled={!filtered.length} className={outlineButton}><Download aria-hidden="true" className="h-4 w-4" />Export report</button>
        <AddPropertyButton onAdd={onAdd} blockedReason={addBlockedReason} />
      </>} />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total" value={counts.total} onClick={() => filterBy('ALL')} />
        <StatCard label="Active" value={counts.ACTIVE} onClick={() => filterBy('ACTIVE')} active={status === 'ACTIVE'} />
        <StatCard label="Reserved" value={counts.RESERVED} onClick={() => filterBy('RESERVED')} active={status === 'RESERVED'} />
        <StatCard label="Suspended" value={counts.SUSPENDED} onClick={() => filterBy('SUSPENDED')} active={status === 'SUSPENDED'} />
        <StatCard label="Drafts" value={counts.DRAFT} onClick={() => filterBy('DRAFT')} active={status === 'DRAFT'} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <label className="relative">
          <span className="sr-only">Search properties</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search property or location" className="h-10 w-[250px] rounded-full border border-[#e3ded6] bg-white pl-10 pr-4 text-sm outline-none placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-[#cc7654]" />
        </label>
        {CATEGORIES.map((value) => (
          <button key={value} type="button" aria-pressed={category === value} onClick={() => { setCategory(value); setPage(1); }} className={`h-10 rounded-full px-4 text-sm font-medium transition ${category === value ? 'bg-[#cc7654] text-white' : 'bg-[#efeae2] text-[#2a2723] hover:bg-[#e6e0d6]'}`}>{value === 'ALL' ? 'All' : getPropertyCategoryLabel(value)}</button>
        ))}
        <label className="relative ml-auto">
          <span className="sr-only">Sort properties</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 appearance-none rounded-full bg-[#efeae2] pl-4 pr-9 text-sm font-medium text-[#2a2723] outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]">
            {SORTS.map((option) => <option key={option.value} value={option.value}>{option.value === 'updated' ? 'Sort by' : option.label}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        </label>
      </div>

      <section className={`${card} mt-6 overflow-hidden`}>
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5">
          <div><h2 className="text-[22px] font-semibold">{tableTitle}</h2><p className="mt-1 text-[13px] text-[#6b665f]">{filtered.length} listing{filtered.length === 1 ? '' : 's'} · availability and reservation controls</p></div>
          <label className="relative">
            <span className="sr-only">Filter by status</span>
            <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <select value={status} onChange={(event) => filterBy(event.target.value as PropertyStatus | 'ALL')} className="h-[34px] appearance-none rounded-full border border-[#e3ded6] bg-white pl-9 pr-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]">
              <option value="ALL">All statuses</option>
              {(Object.keys(propertyStatus) as PropertyStatus[]).map((value) => <option key={value} value={value}>{propertyStatus[value].label}</option>)}
            </select>
          </label>
        </div>
        {loading ? <div className="px-5 pb-5"><TableSkeleton label="Loading properties" columns={6} /></div> : (
          <PropertyTable rows={rows} actions={actions} onView={(id, tab = 'overview') => setSelected({ id, tab })} empty={properties.length ? 'No properties match these filters.' : 'No properties yet. Add your first listing to get started.'} />
        )}
        {filtered.length > PAGE_SIZE ? (
          <div className="flex items-center justify-between border-t border-[#ebe7e0] px-5 py-4 text-sm text-[#6b665f]">
            <p>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="grid size-8 place-items-center rounded-lg border border-[#e3ded6] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)} className={`grid size-8 place-items-center rounded-lg border border-[#e3ded6] ${number === currentPage ? 'bg-[#f4f1ec] font-medium text-[#2a2723]' : ''}`}>{number}</button>)}
              <button type="button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="grid size-8 place-items-center rounded-lg border border-[#e3ded6] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        ) : null}
      </section>

      {selectedProperty && selected ? <PropertyDrawer key={`${selected.id}-${selected.tab}`} property={selectedProperty} initialTab={selected.tab} actions={actions} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

export const ADMIN_ADD_BLOCKED = 'Only agents can create listings. Ask an agent to add it — you can then review and moderate it here.';

export function AddPropertyButton({ onAdd, blockedReason }: { onAdd: () => void; blockedReason?: string }) {
  if (!blockedReason) return <button type="button" onClick={onAdd} className={primaryButton}><Plus aria-hidden="true" className="h-4 w-4" />Add Property</button>;
  return (
    <span className="flex flex-col items-end gap-1">
      <button type="button" disabled aria-describedby="add-property-reason" className={`${primaryButton} cursor-not-allowed`}><Plus aria-hidden="true" className="h-4 w-4" />Add Property</button>
      <span id="add-property-reason" className="max-w-[240px] text-right text-[11px] leading-snug text-[#77726b]">{blockedReason}</span>
    </span>
  );
}

// Table used by All Properties, My Listings and the overview's "Sunrise properties" card.
export function PropertyTable({ rows, actions, onView, empty }: { rows: PropertyResponseDto[]; actions: InventoryActions; onView: (id: string, tab?: DrawerTab) => void; empty: string }) {
  if (!rows.length) return <p className="border-t border-[#ebe7e0] px-5 py-14 text-center text-sm text-[#77726b]">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className={tableHead}><tr><th className="px-5 py-3">Property / Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Last updated</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-[#ebe7e0] border-t border-[#ebe7e0]">
          {rows.map((property) => {
            const suspended = property.status === 'SUSPENDED';
            return (
              <tr key={property.id} className={suspended ? 'bg-[#fdf7f4]' : 'hover:bg-[#fcfbf9]'}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(property)} alt="" fill sizes="56px" className="object-cover" /></div>
                    <div className="min-w-0"><p className="max-w-[280px] truncate font-semibold first-letter:uppercase">{property.title}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#77726b]"><MapPin aria-hidden="true" className="h-3 w-3" />{[property.street, property.city].filter(Boolean).join(', ') || property.country}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3"><PropertyStatusPill status={property.status} /></td>
                <td className="px-4 py-3"><Pill tone="gray">{property.listingType === 'RENT' ? 'Rent' : 'Sale'}</Pill></td>
                <td className="whitespace-nowrap px-4 py-3">{formatNpr(property.price, property.listingType)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[#77726b]">{relativeTime(property.updatedAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {suspended && actions.onReactivate ? <button type="button" disabled={actions.busyId === property.id} onClick={() => actions.onReactivate?.(property)} className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d5ca] bg-white px-3 py-1 text-xs font-medium text-[#b23b2e] disabled:opacity-50"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />Restore</button> : null}
                    <button type="button" aria-label={`View ${property.title}`} onClick={() => onView(property.id)} className="grid size-8 place-items-center rounded-full text-[#6b665f] hover:bg-[#f4f1ec]"><Eye className="h-4 w-4" /></button>
                    <RowMenu property={property} actions={actions} onView={() => onView(property.id)} onLog={() => onView(property.id, 'activity')} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type ActionRule = { key: string; label: string; run: () => void; enabled: boolean; reason?: string; danger?: boolean; primary?: boolean };

// Every action a listing can show, with why it's unavailable when it is. These follow the
// backend rules (see /api/docs): agents create, edit, publish, hide and delete their listings;
// admins only moderate (suspend / restore). Blocked actions stay visible with the reason.
export function listingActions(property: PropertyResponseDto, actions: InventoryActions): ActionRule[] {
  const isAdmin = Boolean(actions.onSuspend);
  const status = property.status;
  const statusName = (propertyStatus[status]?.label ?? status).toLowerCase();
  const agentOnly = (what: string) => `Only the listing’s agent can ${what}. Admins can suspend or restore listings instead.`;
  const rules: ActionRule[] = [];
  const add = (rule: Omit<ActionRule, 'enabled'>, blockedReason: string | null) => rules.push({ ...rule, enabled: !blockedReason, reason: blockedReason ?? undefined });

  const editLocked = status === 'RESERVED' || status === 'COMPLETED';
  add({ key: 'edit', label: 'Edit listing', run: () => actions.onEdit(property) },
    isAdmin ? agentOnly('edit listing details') : editLocked ? `Listings that are ${statusName} can’t be edited.` : null);

  if (status === 'DRAFT') add({ key: 'publish', label: 'Publish', run: () => actions.onPublish(property), primary: true }, isAdmin ? agentOnly('publish a listing') : null);
  if (status === 'HIDDEN') add({ key: 'show', label: 'Show again', run: () => actions.onPublish(property), primary: true }, isAdmin ? agentOnly('make a hidden listing live again') : null);
  if (status === 'ACTIVE') add({ key: 'hide', label: 'Hide', run: () => actions.onHide(property) }, isAdmin ? agentOnly('hide a listing') : null);
  if (status === 'RESERVED') add({ key: 'hide', label: 'Hide', run: () => actions.onHide(property) }, 'A customer has reserved this listing, so it stays visible until the reservation ends.');
  if (status === 'COMPLETED') add({ key: 'hide', label: 'Hide', run: () => actions.onHide(property) }, 'This listing is completed (sold or rented) and can no longer change visibility.');

  if (status === 'SUSPENDED') {
    add({ key: 'restore', label: 'Restore', run: () => actions.onReactivate?.(property), primary: true }, isAdmin ? null : 'An admin suspended this listing. Only an admin can restore it — contact your Sunrise admin.');
  } else if (status !== 'DRAFT' && status !== 'COMPLETED') {
    add({ key: 'suspend', label: 'Suspend', run: () => actions.onSuspend?.(property), danger: true }, isAdmin ? null : 'Only admins can suspend listings.');
  }

  const deletable = status === 'DRAFT' || status === 'HIDDEN';
  add({ key: 'delete', label: 'Delete', run: () => actions.onDelete(property), danger: true },
    isAdmin ? agentOnly('delete a listing') : deletable ? null : `Only drafts or hidden listings can be deleted — this one is ${statusName}.${status === 'ACTIVE' ? ' Hide it first.' : ''}`);
  return rules;
}

function RowMenu({ property, actions, onView, onLog }: { property: PropertyResponseDto; actions: InventoryActions; onView: () => void; onLog: () => void }) {
  // The menu renders in a portal at page level so the table's scroll/overflow box can't clip it.
  const [position, setPosition] = useState<{ top: number; right: number; above: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const open = position !== null;

  const toggle = () => {
    if (open) return setPosition(null);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const above = window.innerHeight - rect.bottom < 280 && rect.top > 280;
    setPosition({ top: above ? rect.top - 8 : rect.bottom + 8, right: window.innerWidth - rect.right, above });
  };

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key !== 'Escape' : event.type === 'mousedown' && (menuRef.current?.contains(event.target as Node) || buttonRef.current?.contains(event.target as Node))) return;
      setPosition(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    // Scrolling or resizing would leave a fixed menu behind, so close it instead.
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const busy = actions.busyId === property.id;
  const item = (label: string, onClick: () => void, danger = false, reason?: string) => (
    <button key={label} type="button" role="menuitem" disabled={busy || Boolean(reason)} aria-describedby={reason ? `${property.id}-${label}-reason` : undefined} onClick={() => { setPosition(null); onClick(); }} className={`w-full rounded-lg px-3 py-2 text-left text-sm enabled:hover:bg-[#f4f1ec] disabled:cursor-not-allowed ${reason ? 'text-[#a19c95]' : danger ? 'text-[#e5484d]' : 'text-[#2a2723]'} ${busy && !reason ? 'opacity-50' : ''}`}>
      {label}
      {reason ? <span id={`${property.id}-${label}-reason`} className="mt-0.5 block text-[11px] leading-snug text-[#77726b]">{reason}</span> : null}
    </button>
  );

  return (
    <>
      <button ref={buttonRef} type="button" aria-label={`More actions for ${property.title}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle} className="grid size-8 place-items-center rounded-full border border-[#ebe7e0] text-[#2a2723] hover:bg-[#f4f1ec]"><MoreHorizontal className="h-4 w-4" /></button>
      {position ? createPortal(
        <div ref={menuRef} role="menu" style={{ top: position.top, right: position.right }} className={`fixed z-[80] w-64 rounded-2xl bg-white p-1.5 shadow-[0_0_25px_rgba(0,0,0,0.15)] ${position.above ? '-translate-y-full' : ''}`}>
          {item('View details', onView)}
          {actions.loadModerationLog ? item('Moderation log', onLog) : null}
          <div className="my-1 h-px bg-[#ebe7e0]" />
          {listingActions(property, actions).map((rule) => item(rule.label, rule.run, rule.danger, rule.enabled ? undefined : rule.reason))}
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl border border-[#ebe7e0] p-3"><dt className="text-xs text-[#77726b]">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>;
}

export type DrawerTab = 'overview' | 'images' | 'activity';

export function PropertyDrawer({ property, actions, onClose, initialTab = 'overview' }: { property: PropertyResponseDto; actions: InventoryActions; onClose: () => void; initialTab?: DrawerTab }) {
  const [tab, setTab] = useState<DrawerTab>(initialTab);
  const { user } = useAuthSession();
  const [log, setLog] = useState<PropertyModerationLogDto[] | null>(null);
  const { loadModerationLog } = actions;

  useEffect(() => {
    if (tab !== 'activity' || !loadModerationLog) return;
    let active = true;
    loadModerationLog(property.id).then((rows) => { if (active) setLog(rows); }).catch(() => { if (active) setLog([]); });
    return () => { active = false; };
  }, [tab, property.id, property.status, loadModerationLog]);
  const busy = actions.busyId === property.id;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rules = listingActions(property, actions);
  const available = rules.filter((rule) => rule.enabled);
  const blocked = rules.filter((rule) => !rule.enabled && rule.reason);
  const images = property.images ?? [];
  const activity = [
    { label: 'Listing created', at: property.createdAt },
    ...(property.updatedAt && property.updatedAt !== property.createdAt ? [{ label: `Last updated · ${propertyStatus[property.status]?.label ?? property.status}`, at: property.updatedAt }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-labelledby="property-drawer-title" onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-[904px] flex-col rounded-l-2xl bg-white shadow-2xl">
        <header className="px-5 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase text-[#6b665f]">ID {property.id.slice(-6).toUpperCase()}</p>
              <h2 id="property-drawer-title" className="mt-1 text-[22px] font-semibold first-letter:uppercase">{property.title}</h2>
              <div className="mt-2.5 flex flex-wrap gap-2"><PropertyStatusPill status={property.status} /><Pill tone="gray" upper>{property.listingType}</Pill><Pill tone="gray" upper>{property.category}</Pill></div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-stone-100"><X className="h-5 w-5" /></button>
          </div>
          <div role="tablist" className="mt-4 flex gap-6">
            {(['overview', 'images', 'activity'] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`pb-3 text-sm capitalize ${tab === value ? 'font-semibold text-[#2a2723]' : 'text-[#9a958e] hover:text-[#2a2723]'}`}>{value}</button>)}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto border-t border-[#ebe7e0] px-5 py-5 sm:px-7">
          {tab === 'overview' ? (
            <>
              <div className="relative aspect-[846/280] overflow-hidden rounded-xl bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(property)} alt={property.title} fill sizes="850px" className="object-cover" /></div>
              <p className="mt-5 text-[22px] font-semibold">{formatNpr(property.price, property.listingType)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6b665f]"><MapPin aria-hidden="true" className="h-4 w-4" />{formatLocation(property) || 'Location not provided'}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Fact label="Type" value={property.listingType === 'RENT' ? 'Rent' : 'Sale'} />
                <Fact label="Category" value={getPropertyCategoryLabel(property.category)} />
                <Fact label="Area" value={property.areaSize != null ? formatArea(property.areaSize, property.areaUnit) : '—'} />
                <Fact label="Reservation fee" value={property.reservationFeeOverride != null ? formatNpr(property.reservationFeeOverride) : 'Default'} />
              </dl>
              <p className="mt-4 text-sm text-[#6b665f]">Listed by <strong className="font-semibold text-[#2a2723]">{user?.id && user.id === property.createdByAgentId ? 'you' : property.createdByAgentId ? `agent ${property.createdByAgentId.slice(-6).toUpperCase()}` : 'an agent'}</strong></p>
              <h3 className="mt-6 font-semibold">Description</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4b4740]">{property.description || 'No description provided.'}</p>
              <Link href={`/properties/${property.id}`} target="_blank" className="mt-4 inline-flex text-sm font-medium text-[#cc7654] hover:underline">View public page</Link>
            </>
          ) : tab === 'images' ? (
            images.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image) => <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(image.url)} alt="" fill sizes="280px" className="object-cover" /></div>)}</div> : <p className="py-14 text-center text-sm text-[#77726b]">No photos uploaded yet.</p>
          ) : (
            <>
              <ol className="space-y-4">
                {activity.map((entry) => <li key={entry.label} className="flex items-start justify-between gap-4 border-b border-[#ebe7e0] pb-4"><span className="text-sm font-medium">{entry.label}</span><span className="text-xs text-[#77726b]">{formatDay(entry.at, true)}</span></li>)}
              </ol>
              {loadModerationLog ? (
                <section className="mt-8">
                  <h3 className="font-semibold">Moderation log</h3>
                  {log === null ? <div className="mt-3"><TableSkeleton label="Loading moderation log" rows={2} columns={3} /></div> : log.length ? (
                    <ol className="mt-3 space-y-3">
                      {log.map((entry) => (
                        <li key={entry.id} className="rounded-xl border border-[#ebe7e0] p-4">
                          <div className="flex items-start justify-between gap-3"><Pill tone={entry.action.toUpperCase().includes('SUSPEND') ? 'red' : 'green'} upper>{entry.action.replace(/_/g, ' ')}</Pill><span className="text-xs text-[#77726b]">{formatDay(entry.createdAt, true)}</span></div>
                          {entry.reason ? <p className="mt-2 text-sm text-[#4b4740]">{entry.reason}</p> : null}
                          <p className="mt-2 text-xs text-[#77726b]">By {entry.admin?.fullName ?? 'an administrator'}</p>
                        </li>
                      ))}
                    </ol>
                  ) : <div className="mt-6 text-center"><p className="font-semibold">No moderation actions yet</p><p className="mt-1 text-xs text-[#9a958e]">This property has no suspension or reactivation history.</p></div>}
                </section>
              ) : null}
            </>
          )}
        </div>
        <footer className="border-t border-[#ebe7e0] px-5 py-4 sm:px-7">
          {blocked.length ? (
            <ul className="mb-3 space-y-1 rounded-xl bg-[#f4f1ec] px-4 py-3 text-xs text-[#4b4740]">
              {blocked.map((rule) => <li key={rule.key}><strong className="font-semibold">{rule.label}:</strong> {rule.reason}</li>)}
            </ul>
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {available.filter((rule) => rule.key === 'delete').map((rule) => <button key={rule.key} type="button" disabled={busy} onClick={rule.run} className="mr-auto text-sm text-[#77726b] hover:text-[#b23b2e] disabled:opacity-50">Delete listing</button>)}
            {available.filter((rule) => rule.key !== 'delete').map((rule) => (
              <button key={rule.key} type="button" disabled={busy} onClick={rule.run} className={rule.danger ? 'inline-flex h-10 items-center rounded-lg bg-[#f04438] px-5 text-sm font-semibold text-white hover:bg-[#d92d20] disabled:opacity-50' : rule.primary ? primaryButton : outlineButton}>
                {rule.key === 'restore' ? <RotateCcw aria-hidden="true" className="h-4 w-4" /> : null}{rule.key === 'restore' ? 'Restore listing' : rule.key === 'hide' ? 'Hide listing' : rule.label}
              </button>
            ))}
          </div>
        </footer>
      </aside>
    </div>
  );
}
