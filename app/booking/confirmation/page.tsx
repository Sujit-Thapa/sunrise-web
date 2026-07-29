'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import {
  addBookedProperty,
  clearPendingBooking,
  getPendingBooking,
} from '@/lib/account-store';

type ConfirmationStatus = 'success' | 'failed' | 'pending' | 'unknown';

/**
 * IMPORTANT — assumption flagged for verification:
 *
 * The Swagger schema for this API has no user-facing "check payment status"
 * endpoint (reservations are Agent/Admin only, and /v1/payments only has
 * initiate endpoints). That means this page CANNOT independently verify
 * the outcome by calling the API — it can only reflect whatever query
 * params the gateway/backend redirect actually contains.
 *
 * This parses a few common param name variants defensively. Once you
 * confirm the real redirect URL shape (check Network tab after a real
 * test payment, or ask your backend dev what `callbackUrl` produces),
 * update `parseCallbackParams` below to match exactly.
 */
function parseCallbackParams(params: URLSearchParams): {
  status: ConfirmationStatus;
  paymentId: string | null;
  provider: string | null;
  reason: string | null;
} {
  const rawStatus = (
    params.get('status') ||
    params.get('payment_status') ||
    params.get('transaction_status') ||
    ''
  ).toLowerCase();

  let status: ConfirmationStatus = 'unknown';
  if (['success', 'completed', 'complete', 'succeeded'].includes(rawStatus)) {
    status = 'success';
  } else if (['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(rawStatus)) {
    status = 'failed';
  } else if (['pending', 'processing'].includes(rawStatus)) {
    status = 'pending';
  }

  const paymentId =
    params.get('paymentId') ||
    params.get('payment_id') ||
    params.get('pidx') || // Khalti's own param name, in case it isn't intercepted server-side
    null;

  const provider = params.get('provider') || params.get('gateway') || null;
  const reason = params.get('reason') || params.get('message') || null;

  return { status, paymentId, provider, reason };
}

function statusCopy(status: ConfirmationStatus) {
  switch (status) {
    case 'success':
      return {
        heading: (
          <>
            You&apos;re one step<br />
            <em className="italic text-stone-600">closer to home.</em>
          </>
        ),
        eyebrow: 'Booking Confirmed',
        body: 'Your advance deposit has been received. Our team will be in touch within 24 hours to confirm the next steps.',
      };
    case 'failed':
      return {
        heading: (
          <>
            Something went<br />
            <em className="italic text-stone-600">wrong with payment.</em>
          </>
        ),
        eyebrow: 'Payment Failed',
        body: 'Your payment could not be completed. No deposit has been charged. You can try again or choose a different payment method.',
      };
    case 'pending':
      return {
        heading: (
          <>
            Your payment is<br />
            <em className="italic text-stone-600">being processed.</em>
          </>
        ),
        eyebrow: 'Payment Pending',
        body: 'We\u2019re still confirming your payment with the provider. This can take a few minutes — you don\u2019t need to do anything else right now.',
      };
    default:
      return {
        heading: (
          <>
            We couldn&apos;t confirm<br />
            <em className="italic text-stone-600">your payment status.</em>
          </>
        ),
        eyebrow: 'Status Unknown',
        body: 'We weren\u2019t able to read a clear status from the payment provider. If you completed a payment, please check your email or contact us before trying again.',
      };
  }
}

function StatusIcon({ status }: { status: ConfirmationStatus }) {
  if (status === 'success') {
    return (
      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#C0D8B0] text-[#4A7040]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-rose-200 text-rose-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 text-amber-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    );
  }
  return (
    <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-stone-300 text-stone-500">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </div>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthSession();
  const hasStoredBooking = useRef(false);
  const parsed = useMemo(() => parseCallbackParams(searchParams), [searchParams]);

  useEffect(() => {
    if (!parsed || parsed.status !== 'success' || !user || hasStoredBooking.current) return;

    const pending = getPendingBooking(user.id);

    if (pending) {
      addBookedProperty(user.id, pending.property, {
        paymentId: parsed.paymentId,
        provider: parsed.provider ?? pending.provider,
      });
      clearPendingBooking(user.id);
      hasStoredBooking.current = true;
    }
  }, [parsed, user]);

  if (!parsed) {
    return (
      <p className="py-24 text-center text-sm text-stone-400">Checking your payment status…</p>
    );
  }

  const { status, paymentId, provider, reason } = parsed;
  const copy = statusCopy(status);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-stone-800 sm:px-8" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="w-full max-w-[520px] text-center">
        <StatusIcon status={status} />
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-stone-500">{copy.eyebrow}</p>
        <h1 className="mb-4 font-serif text-4xl leading-tight text-stone-900 sm:text-[2.4rem]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {copy.heading}
        </h1>
        <p className="mx-auto mb-10 max-w-[420px] text-sm leading-7 text-stone-600">
          {copy.body}
        </p>

        {(paymentId || provider || reason) ? (
          <div className="mb-8 border border-stone-300 bg-white p-6 text-left">
            {provider ? (
              <div className="flex justify-between border-b border-stone-100 py-2 text-sm">
                <span className="text-stone-500">Provider</span>
                <span className="capitalize text-stone-800">{provider}</span>
              </div>
            ) : null}
            {paymentId ? (
              <div className="flex justify-between border-b border-stone-100 py-2 text-sm">
                <span className="text-stone-500">Payment Reference</span>
                <span className="text-stone-800">{paymentId}</span>
              </div>
            ) : null}
            {reason ? (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-stone-500">Note</span>
                <span className="text-stone-800">{reason}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {status === 'failed' || status === 'unknown' ? (
            <Link
              href="/booking"
              className="border border-stone-900 bg-stone-900 px-8 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-stone-50 transition hover:bg-stone-700"
            >
              Try Again
            </Link>
          ) : null}
          <Link
            href="/"
            className="border border-stone-300 bg-transparent px-8 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-sm text-stone-400">Loading…</p>}>
      <ConfirmationContent />
    </Suspense>
  );
}
