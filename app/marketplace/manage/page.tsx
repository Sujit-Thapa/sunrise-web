'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiEyeLine, RiEyeOffLine, RiMapPinLine } from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getAuthToken } from '@/lib/auth';
import { userPropertiesApi } from '@/lib/backend';
import { resolveImageSrcFromProperty } from '@/lib/image';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type { UserPropertyResponseDto } from '@/types';

function statusTone(status: UserPropertyResponseDto['status']): string {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700';
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700';
  if (status === 'HIDDEN') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-50 text-amber-700';
}

export default function ManageMarketplacePage() {
  const { user, loading: authLoading } = useAuthSession();
  const [listings, setListings] = useState<UserPropertyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadListings = async () => {
    const token = getAuthToken();
    if (!token) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await userPropertiesApi.findMine(token, { page: 1, limit: 50 });
      setListings(response.items ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) void loadListings();
  }, [authLoading]);

  const handleHide = async (listing: UserPropertyResponseDto) => {
    if (listing.status === 'HIDDEN') return;
    const token = getAuthToken();
    if (!token) return;

    setBusyId(listing.id);
    setError('');
    try {
      const updated = await userPropertiesApi.hide(listing.id, token);
      setListings((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to hide this listing.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (listing: UserPropertyResponseDto) => {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return;
    const token = getAuthToken();
    if (!token) return;

    setBusyId(listing.id);
    setError('');
    try {
      await userPropertiesApi.remove(listing.id, token);
      setListings((current) => current.filter((item) => item.id !== listing.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete this listing.');
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) {
    return <PageShell><p className="py-20 text-center text-sm text-slate-500">Checking your account...</p></PageShell>;
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg border border-stone-200 bg-white p-8 text-center shadow-brand-sm sm:p-10">
          <h1 className="text-3xl font-semibold text-midnight">Sign in to manage listings</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">Your marketplace submissions are private and can only be managed from your account.</p>
          <Link href="/auth/login" className="mt-7 inline-flex rounded-full bg-midnight px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800">Sign in</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col justify-between gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">Owner workspace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-midnight sm:text-5xl">Your marketplace listings</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">Review status, update details, and keep your property submissions ready for interested buyers and renters.</p>
        </div>
        <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">
          <RiAddLine className="h-4 w-4" />
          Add listing
        </Link>
      </div>

      {error ? <p className="mt-6 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {loading ? (
        <p className="py-20 text-center text-sm text-slate-500">Loading your listings...</p>
      ) : listings.length === 0 ? (
        <div className="mt-10 border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold text-midnight">No listings yet</h2>
          <p className="mt-3 text-sm text-slate-500">Add a property to send it through the marketplace review process.</p>
          <Link href="/marketplace" className="mt-6 inline-flex rounded-full border border-midnight px-5 py-3 text-sm font-semibold text-midnight hover:bg-midnight hover:text-white">List a property</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {listings.map((listing) => (
            <article key={listing.id} className="overflow-hidden border border-stone-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
              <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
                <div className="relative min-h-52 bg-stone-100">
                  <Image src={resolveImageSrcFromProperty(listing)} alt={listing.title || 'Property'} fill sizes="220px" className="object-cover" />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${statusTone(listing.status)}`}>
                    {getPropertyStatusLabel(listing.status)}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold text-midnight">{listing.title}</h2>
                    <span className="shrink-0 text-lg font-semibold text-gold-primary">{formatCurrency(listing.price)}</span>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><RiMapPinLine className="h-4 w-4 shrink-0 text-gold-primary" />{formatLocation(listing) || 'Location not specified'}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="bg-stone-50 px-3 py-2">{getListingTypeLabel(listing.listingType)}</span>
                    <span className="bg-stone-50 px-3 py-2">{formatArea(listing.areaSize, listing.areaUnit)}</span>
                    <span className="bg-stone-50 px-3 py-2">{listing.images?.length ?? 0} image{listing.images?.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {listing.status === 'APPROVED' ? <Link href={`/marketplace/${listing.id}`} className="inline-flex items-center gap-2 rounded-full bg-midnight px-3 py-2 text-xs font-semibold text-white hover:bg-stone-800"><RiEyeLine className="h-4 w-4" />View live</Link> : null}
                    <Link href={`/marketplace#my-submissions`} className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-gold-primary hover:text-gold-primary"><RiEditLine className="h-4 w-4" />Edit details</Link>
                    {listing.status !== 'HIDDEN' ? <button type="button" disabled={busyId === listing.id} onClick={() => void handleHide(listing)} className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-gold-primary hover:text-gold-primary disabled:opacity-50"><RiEyeOffLine className="h-4 w-4" />Hide</button> : null}
                    <button type="button" disabled={busyId === listing.id} onClick={() => void handleDelete(listing)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><RiDeleteBinLine className="h-4 w-4" />Delete</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[linear-gradient(180deg,#fcfbf7_0%,#f5f1e8_100%)] px-4 py-10 text-stone-900 sm:px-6 lg:px-8 lg:py-14"><div className="mx-auto max-w-7xl">{children}</div></main>;
}
