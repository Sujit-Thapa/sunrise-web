'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RiCheckLine, RiTimeLine, RiCloseLine } from 'react-icons/ri';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getPendingBooking, clearPendingBooking } from '@/lib/account-store';
import { getAuthToken } from '@/lib/auth';
import { reservationsApi } from '@/lib/backend';
import { formatCurrency } from '@/lib/properties';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { MyReservationDto } from '@/types';

const CHECKING = 'Checking your reservation…';

export default function PaymentResultPage({ success }: { success: boolean }) {
  const { user, loading } = useAuthSession();
  const [reservation, setReservation] = useState<MyReservationDto | null>(null);
  const [message, setMessage] = useState(CHECKING);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!success || !user || user.role !== 'USER') return;
    let active = true;
    const token = getAuthToken();
    const pending = getPendingBooking(user.id);
    if (!token) {
      queueMicrotask(() => { if (active) setMessage('Your session has expired. Sign in again to view your reservation.'); });
      return () => { active = false; };
    }
    async function verify() {
      try {
        if (!pending) {
          if (active) setMessage('Open My reservations to see your confirmed holds and history.');
          return;
        }
        let page = 1;
        let match: MyReservationDto | undefined;
        do {
          const result = await reservationsApi.findMine(token!, { page, limit: 100 });
          match = result.items.find(item => item.property.id === pending!.property.id && item.status !== 'CANCELLED');
          if (match || page * result.limit >= result.total || !result.items.length) break;
          page += 1;
        } while (active);
        if (!active) return;
        if (match) {
          setReservation(match);
          clearPendingBooking(user!.id);
        } else setMessage('Your reservation is not visible yet. Check again shortly, or open My reservations.');
      } catch {
        if (active) setMessage('We couldn’t verify your reservation. Please try again or open My reservations.');
      }
    }
    void verify();
    return () => { active = false; };
  }, [success, user, attempt]);

  // Show a placeholder while the session loads and while a paid reservation is still being looked up.
  if (success && (loading || (user?.role === 'USER' && !reservation && message === CHECKING))) {
    return <div className="bg-[#f7f5f1] px-5 py-10 sm:py-14"><CardSkeleton label={loading ? 'Checking your account' : CHECKING} /></div>;
  }

  return (
    <div className="bg-[#f7f5f1] px-5 py-10 text-[#2a2723] sm:py-14">
      <section className="mx-auto max-w-[620px] rounded-[24px] border border-stone-200 bg-white px-6 py-9 shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3ef] text-[#cc7654]">{reservation ? <RiCheckLine size={28} /> : success ? <RiTimeLine size={28} /> : <RiCloseLine size={28} />}</div>
        <h1 className="mt-5 text-center text-3xl font-bold">{reservation ? 'Reservation Confirmed!' : success ? 'Reservation status' : 'Payment not completed'}</h1>
        {reservation ? <>
          <p className="mx-auto mt-3 w-fit break-all rounded-full bg-[#f7f5f1] px-3 py-1 text-center text-xs">Reference: {reservation.id}</p>
          <div className="mt-8 rounded-2xl border border-stone-200 bg-[#f7f5f1] p-5">
            <p className="text-xs uppercase">Reserved property</p><h2 className="mt-1 font-bold">{reservation.property.title}</h2>
            <dl className="mt-4 space-y-3 border-t border-stone-200 pt-4 text-sm">
              <div className="flex justify-between gap-3"><dt>Reservation fee</dt><dd>{formatCurrency(reservation.reservationFeeAmount)}</dd></div>
              <div className="flex justify-between gap-3"><dt>Status</dt><dd>{reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}</dd></div>
              <div className="flex justify-between gap-3"><dt>Date</dt><dd>{new Date(reservation.createdAt).toLocaleDateString()}</dd></div>
              {reservation.claimedAgentNameSnapshot ? <div className="flex justify-between gap-3"><dt>Assigned agent</dt><dd>{reservation.claimedAgentNameSnapshot}</dd></div> : null}
            </dl>
          </div>
        </> : <p role="status" className="mt-5 text-center text-sm leading-6 text-stone-500">{success ? (user ? message : 'Sign in to view your reservation status.') : 'Payment was not completed. Check My reservations before starting another payment.'}</p>}
        {success && !reservation && user?.role === 'USER' ? <button onClick={() => { setMessage(CHECKING); setAttempt(value => value + 1); }} className="mx-auto mt-5 block text-sm text-[#cc7654] underline">Check again</button> : null}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/account/reservations" className="rounded-xl bg-[#cc7654] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#b66545]">View My Reservations</Link>
          <Link href="/properties" className="rounded-xl border border-[#cc7654] px-4 py-3 text-center text-sm font-bold text-[#cc7654]">Browse Properties</Link>
        </div>
      </section>
      {reservation ? <section className="mx-auto mt-8 max-w-[620px]"><h2 className="text-sm font-bold">WHAT HAPPENS NEXT?</h2><div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-600">Track your reservation and assigned agent in My reservations. For questions about your property, <Link href="/contact" className="text-[#cc7654] underline">contact Sunrise</Link>.</div></section> : null}
    </div>
  );
}
