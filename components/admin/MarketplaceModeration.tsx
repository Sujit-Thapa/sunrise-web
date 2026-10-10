'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, LayoutGrid, List, Mail, MapPin, MessageSquare, Ruler, RotateCcw, Search, Store, Tag, Trash2, X, XCircle } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { describeActionError, formatNpr, type StaffNotice } from './staff-ui';
import { userPropertiesApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
import { formatArea, formatLocation, getPropertyCategoryLabel } from '@/lib/properties';
import type { ListingType, PropertyCategory, UserPropertyResponseDto, UserPropertyStatus } from '@/types';

type StatusFilter = 'all' | UserPropertyStatus;
type Counts = Record<StatusFilter, number>;

const PAGE_SIZE = 8;
const STATUSES: UserPropertyStatus[] = ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'HIDDEN'];
const TYPES: ListingType[] = ['SALE', 'RENT'];
const CATEGORIES: PropertyCategory[] = ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'];

const statusStyle: Record<UserPropertyStatus, { label: string; pill: string; dot: string; count: string }> = {
  PENDING_REVIEW: { label: 'Pending review', pill: 'bg-[#fdf1d6] text-[#a8740f]', dot: 'bg-[#e8a33d]', count: 'bg-[#e8a33d]' },
  APPROVED: { label: 'Approved', pill: 'bg-[#e6efe7] text-[#3e6b4a]', dot: 'bg-[#3e6b4a]', count: 'bg-[#3e6b4a]' },
  REJECTED: { label: 'Rejected', pill: 'bg-[#f9e1de] text-[#b23b2e]', dot: 'bg-[#b23b2e]', count: 'bg-[#b23b2e]' },
  HIDDEN: { label: 'Hidden', pill: 'bg-[#efedea] text-[#77726b]', dot: 'bg-[#a19c95]', count: 'bg-[#a19c95]' },
};


// Totals per status for the tabs and the sidebar badge; one lightweight request per status.
export async function fetchMarketplaceCounts(token: string): Promise<Counts> {
  const results = await Promise.all(STATUSES.map((status) => userPropertiesApi.admin.findAll({ status, page: 1, limit: 1 }, token)));
  const counts = { all: 0 } as Counts;
  STATUSES.forEach((status, index) => {
    counts[status] = results[index].pagination?.total ?? 0;
    counts.all += counts[status];
  });
  return counts;
}

function StatusPill({ status }: { status: UserPropertyStatus }) {
  const style = statusStyle[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${style.pill}`}><span className={`size-1.5 rounded-full ${style.dot}`} />{style.label}</span>;
}

function FilterSelect<T extends string>({ label, value, options, onChange, format }: { label: string; value: T | ''; options: T[]; onChange: (value: T | '') => void; format: (value: T) => string }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T | '')} className="h-[34px] appearance-none rounded-[10px] border border-[#e3ded6] bg-white pl-3.5 pr-9 text-sm text-[#2a2723] outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]">
        <option value="">{label}</option>
        {options.map((option) => <option key={option} value={option}>{format(option)}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
    </label>
  );
}

export default function MarketplaceModeration({ token, onNotice, onCountsChange, initialListing = null }: {
  token: string;
  initialListing?: UserPropertyResponseDto | null;
  onNotice: (notice: StaffNotice) => void;
  onCountsChange?: (counts: Counts) => void;
}) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [listingType, setListingType] = useState<ListingType | ''>('');
  const [category, setCategory] = useState<PropertyCategory | ''>('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [items, setItems] = useState<UserPropertyResponseDto[] | null>(null);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [selected, setSelected] = useState<UserPropertyResponseDto | null>(initialListing);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    userPropertiesApi.admin.findAll({ status: status === 'all' ? undefined : status, listingType: listingType || undefined, category: category || undefined, city: city || undefined, page, limit: PAGE_SIZE }, token)
      .then((result) => {
        if (!active) return;
        const list = result.items ?? [];
        setItems(list);
        setTotal(result.pagination?.total ?? list.length);
        setCities((current) => [...new Set([...current, ...list.map((item) => item.city).filter(Boolean)])].sort());
      })
      .catch((error: unknown) => {
        if (!active) return;
        setItems([]);
        onNotice(describeActionError(error, 'load marketplace submissions', 'admin'));
      });
    return () => { active = false; };
  }, [token, status, listingType, category, city, page, refreshKey, onNotice]);

  useEffect(() => {
    let active = true;
    fetchMarketplaceCounts(token).then((next) => {
      if (!active) return;
      setCounts(next);
      onCountsChange?.(next);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [token, refreshKey, onCountsChange]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!items || !query) return items ?? [];
    return items.filter((item) => `${item.title} ${item.city} ${item.street ?? ''}`.toLowerCase().includes(query));
  }, [items, search]);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setPage(1); setItems(null); };
  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, total);
  const tabs: StatusFilter[] = ['all', ...STATUSES];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-[#6b665f]">User submitted listing moderation</p>
        </div>
        {counts?.PENDING_REVIEW ? <button type="button" onClick={() => resetPage(setStatus)('PENDING_REVIEW')} className="rounded-full bg-[#e8a33d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d8932d]">{counts.PENDING_REVIEW} awaiting review</button> : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#ebe7e0] bg-white">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <label className="relative">
            <span className="sr-only">Search title or city</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or city" className="h-[34px] w-[200px] rounded-full bg-[#f4f1ec] pl-9 pr-3 text-sm outline-none placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-[#cc7654]" />
          </label>
          <FilterSelect label="All types" value={listingType} options={TYPES} onChange={resetPage(setListingType)} format={(value) => (value === 'SALE' ? 'Sale' : 'Rent')} />
          <FilterSelect label="All categories" value={category} options={CATEGORIES} onChange={resetPage(setCategory)} format={getPropertyCategoryLabel} />
          <FilterSelect label="All cities" value={city} options={cities} onChange={resetPage(setCity)} format={(value) => value} />
          <div className="ml-auto flex gap-2" role="group" aria-label="Layout">
            <button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')} className={`grid size-[34px] place-items-center rounded-lg ${view === 'grid' ? 'bg-[#cc7654] text-white' : 'border border-[#e3ded6] text-[#2a2723]'}`}><LayoutGrid className="h-[18px] w-[18px]" /></button>
            <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')} className={`grid size-[34px] place-items-center rounded-lg ${view === 'list' ? 'bg-[#cc7654] text-white' : 'border border-[#e3ded6] text-[#2a2723]'}`}><List className="h-[18px] w-[18px]" /></button>
          </div>
        </div>

        <div role="tablist" aria-label="Submission status" className="flex gap-1 overflow-x-auto border-y border-[#ebe7e0] px-5">
          {tabs.map((tab) => {
            const selectedTab = status === tab;
            const count = counts?.[tab];
            return (
              <button key={tab} type="button" role="tab" aria-selected={selectedTab} onClick={() => resetPage(setStatus)(tab)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm ${selectedTab ? 'border-[#2a2723] font-semibold text-[#2a2723]' : 'border-transparent uppercase text-[#77726b] hover:text-[#2a2723]'}`}>
                {tab === 'all' ? 'All' : statusStyle[tab].label}
                {count != null ? <span className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold text-white ${tab === 'all' ? 'bg-[#2a2723]' : statusStyle[tab].count}`}>{count}</span> : null}
              </button>
            );
          })}
        </div>

        {items === null ? (
          <div className="p-5"><TableSkeleton label="Loading marketplace submissions" columns={6} /></div>
        ) : visible.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-[#77726b]">No submissions match these filters.</p>
        ) : view === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#faf9f7] text-[11px] font-semibold uppercase text-[#6b665f]">
                <tr>
                  <th className="px-5 py-3">Owner listing</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Submitted by</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe7e0] border-t border-[#ebe7e0]">
                {visible.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fcfbf9]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-[52px] shrink-0 overflow-hidden rounded-lg bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(item)} alt="" fill sizes="52px" className="object-cover" /></div>
                        <div className="min-w-0"><p className="truncate font-semibold first-letter:uppercase">{item.title}</p><p className="mt-0.5 text-[11px] text-[#77726b]">{item.city} · {item.category}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.listingType === 'RENT' ? 'Rent' : 'Sale'}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatNpr(item.price, item.listingType)}</td>
                    <td className="px-4 py-3">{item.submittedBy.fullName.split(' ')[0]}</td>
                    <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                    <td className="px-5 py-3 text-right"><button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#cc7654] hover:underline"><Eye aria-hidden="true" className="h-4 w-4" />View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelected(item)} className="overflow-hidden rounded-xl border border-[#ebe7e0] text-left transition hover:shadow-md">
                <div className="relative aspect-[4/3] bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(item)} alt="" fill sizes="(min-width: 1280px) 25vw, 50vw" className="object-cover" /></div>
                <div className="p-3.5"><StatusPill status={item.status} /><p className="mt-2 truncate font-semibold first-letter:uppercase">{item.title}</p><p className="mt-0.5 text-[11px] text-[#77726b]">{item.city} · {item.category}</p><p className="mt-2 text-sm font-semibold">{formatNpr(item.price, item.listingType)}</p></div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#ebe7e0] px-5 py-4 text-sm text-[#6b665f]">
          <p>Showing {firstShown}–{lastShown} of {total}</p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => { setPage(page - 1); setItems(null); }} className="grid size-8 place-items-center rounded-lg border border-[#e3ded6] text-[#2a2723] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span className="grid size-8 place-items-center rounded-lg border border-[#e3ded6] bg-[#f4f1ec] font-medium text-[#2a2723]" aria-current="page">{page}</span>
            <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => { setPage(page + 1); setItems(null); }} className="grid size-8 place-items-center rounded-lg border border-[#e3ded6] text-[#2a2723] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {selected ? <ListingDrawer listing={selected} token={token} onClose={() => setSelected(null)} onNotice={onNotice} onChanged={(next) => { setSelected(next); refresh(); }} /> : null}
    </>
  );
}

function ListingDrawer({ listing, token, onClose, onNotice, onChanged }: {
  listing: UserPropertyResponseDto;
  token: string;
  onClose: () => void;
  onNotice: (notice: StaffNotice) => void;
  onChanged: (listing: UserPropertyResponseDto | null) => void;
}) {
  const [tab, setTab] = useState<'overview' | 'gallery'>('overview');
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  // "Reopen review" brings back the pending-review actions for a rejected submission.
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const act = async (action: 'approve' | 'reject' | 'hide' | 'delete') => {
    if (action === 'delete' && !window.confirm('Delete this submission permanently?')) return;
    setBusy(true);
    try {
      if (action === 'approve') onChanged(await userPropertiesApi.approve(listing.id, token));
      else if (action === 'hide') onChanged(await userPropertiesApi.hide(listing.id, token));
      else if (action === 'reject') { onChanged(await userPropertiesApi.reject(listing.id, { rejectionReason: reason.trim() }, token)); setRejecting(false); setReason(''); }
      else { await userPropertiesApi.remove(listing.id, token); onChanged(null); }
      onNotice({ kind: 'success', message: action === 'delete' ? 'Submission deleted.' : `Submission ${action === 'approve' ? 'approved' : action === 'hide' ? 'hidden' : 'rejected'}.` });
    } catch (error) {
      onNotice(describeActionError(error, `${action === 'approve' ? 'approve' : action === 'hide' ? 'hide' : action === 'reject' ? 'reject' : 'delete'} this submission`, 'admin'));
    } finally {
      setBusy(false);
    }
  };

  const images = listing.images ?? [];
  const owner = listing.submittedBy;
  const facts = [
    { label: 'Type', value: listing.listingType === 'RENT' ? 'Rent' : 'Sale', icon: Tag },
    { label: 'Area', value: listing.areaSize != null ? formatArea(listing.areaSize, listing.areaUnit) : '—', icon: Ruler },
    { label: 'Category', value: listing.category, icon: Store },
    { label: 'Submitted', value: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(listing.createdAt)), icon: MessageSquare },
  ];
  const mode = listing.status === 'REJECTED' && !reopened ? 'rejected' : listing.status === 'HIDDEN' ? 'hidden' : listing.status === 'APPROVED' ? 'approved' : 'pending';
  const outline = 'inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e3ded6] bg-white px-4 text-sm font-semibold disabled:opacity-50';
  const primary = 'inline-flex h-10 items-center gap-1.5 rounded-full bg-[#cc7654] px-5 text-sm font-semibold text-white hover:bg-[#b66545] disabled:opacity-50';
  const rejectButton = <button type="button" onClick={() => setRejecting(true)} disabled={busy} className={`${outline} text-[#b23b2e]`}><X aria-hidden="true" className="h-4 w-4" />Reject</button>;
  const hideButton = <button type="button" onClick={() => void act('hide')} disabled={busy} className={outline}><EyeOff aria-hidden="true" className="h-4 w-4" />Hide</button>;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => !busy && onClose()}>
      <aside role="dialog" aria-modal="true" aria-labelledby="listing-drawer-title" onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-[760px] flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div>
            <span className="rounded-full bg-[#2a2723] px-2.5 py-1 text-[11px] font-semibold text-white">Owner listing</span>
            <h2 id="listing-drawer-title" className="mt-2 text-[22px] font-bold first-letter:uppercase">{listing.title}</h2>
            <p className="mt-1 font-bold">{formatNpr(listing.price, listing.listingType)}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-1.5 hover:bg-stone-100"><X className="h-5 w-5" /></button>
        </header>
        <div role="tablist" className="mt-4 flex gap-2 border-b border-[#ebe7e0] px-5 sm:px-6">
          {(['overview', 'gallery'] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`border-b-2 px-2 py-2.5 text-sm capitalize ${tab === value ? 'border-[#cc7654] font-semibold text-[#2a2723]' : 'border-transparent text-[#77726b]'}`}>{value}</button>)}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {tab === 'overview' ? (
            <>
              <div className="relative aspect-[456/160] overflow-hidden rounded-xl bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(listing)} alt={listing.title} fill sizes="760px" className="object-cover" /></div>
              <div className="mt-4"><StatusPill status={listing.status} /></div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-[#6b665f]"><MapPin aria-hidden="true" className="h-4 w-4" />{formatLocation(listing)}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map((fact) => <div key={fact.label} className="rounded-xl border border-[#ebe7e0] p-3"><fact.icon aria-hidden="true" className="h-4 w-4 text-[#2a2723]" /><dt className="mt-2 text-xs text-[#77726b]">{fact.label}</dt><dd className="mt-1 text-[15px] font-medium">{fact.value}</dd></div>)}
              </dl>
              <h3 className="mt-6 font-bold">Description</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#6b665f]">{listing.description || 'No description provided.'}</p>
              <div className="mt-5 rounded-xl border border-[#ebe7e0] p-4">
                <p className="text-xs text-[#77726b]">Submitted by</p>
                <p className="mt-1 font-bold">{owner.fullName}</p>
                <p className="mt-1 text-sm text-[#6b665f]">{[owner.email, owner.phoneNumber].filter(Boolean).join(' · ')}</p>
              </div>
              {listing.status === 'HIDDEN' ? <p className="mt-5 flex items-start gap-3 rounded-xl bg-[#f4f1ec] px-4 py-4 text-[13px] text-[#4b4740]"><EyeOff aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />This listing is hidden from the public marketplace. Restore it when it is ready to be visible again.</p> : null}
              {listing.status === 'REJECTED' ? <p className="mt-5 flex items-start gap-3 rounded-xl bg-[#fbe4e1] px-4 py-4 text-[13px] text-[#b23b2e]"><XCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>This listing was rejected and is not visible on the public marketplace. Reopen review to reconsider this submission.{listing.rejectionReason ? <span className="mt-1 block font-semibold">Reason: {listing.rejectionReason}</span> : null}</span></p> : null}
            </>
          ) : images.length ? (
            <div className="grid grid-cols-2 gap-3">{images.map((image) => <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#e8e4db]"><Image src={resolveImageSrcFromProperty(image.url)} alt="" fill sizes="360px" className="object-cover" /></div>)}</div>
          ) : <p className="py-10 text-center text-sm text-[#77726b]">No photos uploaded.</p>}
        </div>
        <footer className="border-t border-[#ebe7e0] px-5 py-4 sm:px-6">
          {rejecting ? (
            <form onSubmit={(event) => { event.preventDefault(); if (reason.trim()) void act('reject'); }} className="flex flex-wrap items-center gap-2">
              <label className="min-w-0 flex-1"><span className="sr-only">Rejection reason</span><input autoFocus value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason shown to the owner" className="h-10 w-full rounded-full border border-[#e3ded6] px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#cc7654]" /></label>
              <button type="button" onClick={() => setRejecting(false)} disabled={busy} className="h-10 rounded-full px-4 text-sm font-medium text-[#6b665f]">Cancel</button>
              <button type="submit" disabled={busy || !reason.trim()} className="h-10 rounded-full bg-[#b23b2e] px-4 text-sm font-semibold text-white disabled:opacity-50">Reject listing</button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={() => void act('delete')} disabled={busy} className="mr-auto inline-flex items-center gap-1.5 text-sm text-[#77726b] hover:text-[#b23b2e] disabled:opacity-50"><Trash2 aria-hidden="true" className="h-4 w-4" />Delete</button>
              {mode === 'pending' ? <><button type="button" onClick={() => void act('approve')} disabled={busy} className={primary}><Check aria-hidden="true" className="h-4 w-4" />Approve</button>{listing.status !== 'REJECTED' ? rejectButton : null}{hideButton}</> : null}
              {mode === 'approved' ? <>{rejectButton}{hideButton}</> : null}
              {mode === 'hidden' ? <>{rejectButton}<button type="button" onClick={() => void act('approve')} disabled={busy} className={primary}><Eye aria-hidden="true" className="h-4 w-4" />Restore listing</button></> : null}
              {mode === 'rejected' ? <><a href={`mailto:${owner.email}?subject=${encodeURIComponent(`Your Sunrise listing: ${listing.title}`)}`} className={outline}><Mail aria-hidden="true" className="h-4 w-4" />Contact submitter</a><button type="button" onClick={() => setReopened(true)} disabled={busy} className={primary}><RotateCcw aria-hidden="true" className="h-4 w-4" />Reopen review</button></> : null}
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}
