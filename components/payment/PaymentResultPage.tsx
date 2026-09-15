'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { RiArrowRightLine, RiCheckLine, RiCloseLine, RiHome4Line, RiPriceTag3Line } from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { addBookedProperty, clearPendingBooking, getPendingBooking } from '@/lib/account-store';

export default function PaymentResultPage({ success }: { success: boolean }) {
  const searchParams = useSearchParams();
  const { user } = useAuthSession();
  const handled = useRef(false);
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');
  const pendingBooking = user ? getPendingBooking(user.id) : null;

  useEffect(() => {
    if (!success || !user || handled.current) return;

    const pending = getPendingBooking(user.id);
    if (pending) {
      addBookedProperty(user.id, pending.property, {
        paymentId,
        provider: pending.provider,
      });
      clearPendingBooking(user.id);
    }
    handled.current = true;
  }, [paymentId, success, user]);

  const title = success ? 'Your property is reserved.' : 'Payment was not completed.';
  const description = success
    ? 'Your reservation payment was received. Sunrise Realestate will contact you with the next steps.'
    : 'No reservation was confirmed. You can return to booking and try again with another payment method.';

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(184,155,78,0.14),transparent_30%),linear-gradient(180deg,#fcfbf7_0%,#f5f1e8_100%)] px-4 py-16 text-stone-900 sm:px-6">
      <section className="w-full max-w-xl border border-stone-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-12">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {success ? <RiCheckLine className="h-8 w-8" /> : <RiCloseLine className="h-8 w-8" />}
        </div>
        <p className="mt-7 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-deep">{success ? 'Payment successful' : 'Payment failed'}</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-midnight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-500">{description}</p>

        {success && pendingBooking ? (
          <div className="mt-8 border border-stone-200 bg-stone-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <RiHome4Line className="mt-0.5 h-5 w-5 shrink-0 text-gold-primary" />
              <div>
                <p className="font-semibold text-midnight">{pendingBooking.property.title}</p>
                <p className="mt-1 text-sm text-slate-500">Your booking has been added to your account.</p>
              </div>
            </div>
            {paymentId ? <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><RiPriceTag3Line className="h-4 w-4" />Payment reference: {paymentId}</p> : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!success ? (
            <Link href={pendingBooking ? `/booking?propertyId=${encodeURIComponent(pendingBooking.property.id)}` : '/booking'} className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">
              Try payment again <RiArrowRightLine className="h-4 w-4" />
            </Link>
          ) : null}
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-gold-primary hover:text-gold-primary">View my bookings</Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-gold-primary hover:text-gold-primary">Return home</Link>
        </div>
      </section>
    </main>
  );
}
