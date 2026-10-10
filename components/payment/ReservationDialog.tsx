'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { XCircle } from 'lucide-react';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getAuthToken } from '@/lib/auth';
import { paymentApi, propertiesApi } from '@/lib/backend';
import { setPendingBooking, snapshotProperty } from '@/lib/account-store';
import { formatCurrency } from '@/lib/properties';
import type { PropertyResponseDto } from '@/types';

export default function ReservationDialog({ property, onClose }: { property: PropertyResponseDto; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { user } = useAuthSession();
  const [provider, setProvider] = useState('esewa');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  async function pay() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token || user?.role !== 'USER') throw new Error('Sign in with a customer account to reserve this property.');
      const current = await propertiesApi.findOne(property.id, token);
      if (current.status !== 'ACTIVE') throw new Error('This property is no longer available.');
      const payload = { propertyId: property.id };
      const result = provider === 'esewa' ? await paymentApi.initiateEsewa(payload, token)
        : provider === 'khalti' ? await paymentApi.initiateKhalti(payload, token)
        : await paymentApi.initiateConnectIps(payload, token);
      const url = ('esewaUrl' in result && result.esewaUrl) || ('gatewayUrl' in result && result.gatewayUrl) || ('paymentUrl' in result ? result.paymentUrl : result.checkoutUrl);
      if (typeof url !== 'string' || !url || !['https:', 'http:'].includes(new URL(url).protocol)) throw new Error('The payment gateway is unavailable. Please try again.');
      setPendingBooking(user.id, snapshotProperty(current), { provider });
      if ('formFields' in result && result.formFields && Object.keys(result.formFields).length) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        Object.entries(result.formFields).forEach(([name, value]) => {
          const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value; form.appendChild(input);
        });
        document.body.appendChild(form); form.submit(); form.remove();
      } else window.location.assign(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to start payment.');
      setBusy(false);
    }
  }

  const fee = property.reservationFeeOverride;
  return (
    <dialog ref={dialogRef} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} aria-labelledby="reserve-heading" className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-32px)] max-w-[720px] overflow-y-auto rounded-[24px] bg-white p-6 text-[#2a2723] shadow-[0_16px_20px_rgba(0,0,0,0.15)] backdrop:bg-[rgba(29,27,24,0.5)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 id="reserve-heading" className="text-[22px] font-extrabold">Reserve Property</h2>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Close reservation" className="flex size-9 items-center justify-center rounded-[18px] bg-[#f7f5f0] disabled:opacity-50"><XCircle aria-hidden="true" size={16} /></button>
      </div>
      <div className="mt-7 rounded-2xl bg-[#f7f5f0] p-5">
        <p className="text-[11px] font-bold uppercase text-[#595450]">Property details</p>
        <h3 className="mt-1 text-[15px] font-bold">{property.title}</h3>
        <dl className="mt-3.5 space-y-2.5 border-t border-[#e6e0d6] pt-3.5 text-[13px]">
          <div className="flex justify-between gap-4"><dt className="font-medium text-[#595450]">Property Price</dt><dd className="font-semibold">{formatCurrency(property.price)}</dd></div>
          {fee != null ? <div className="flex justify-between gap-4"><dt className="font-medium text-[#595450]">Reservation Fee</dt><dd className="font-semibold">{formatCurrency(fee)}</dd></div> : null}
        </dl>
        {fee != null
          ? <div className="mt-3.5 flex items-center justify-between gap-4 border-t border-[#e6e0d6] pt-3.5"><p className="text-sm font-bold">Total Reservation Payment</p><p className="text-lg font-extrabold text-[#cc7654]">{formatCurrency(fee)}</p></div>
          : <p className="mt-3.5 border-t border-[#e6e0d6] pt-3.5 text-xs leading-5 text-[#595450]">The reservation fee will be confirmed at the payment gateway before you pay.</p>}
      </div>
      {user?.role === 'USER' ? <p className="mt-7 text-sm text-[#595450]">Reserving as <span className="font-semibold text-[#2a2723]">{user.fullName}</span> · {user.email}</p> : null}
      <fieldset disabled={busy} className="mt-7">
        <legend className="mb-4 text-sm font-extrabold uppercase">Payment Method</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {[['esewa', 'eSewa'], ['khalti', 'Khalti'], ['connectips', 'ConnectIPS']].map(([value, label]) => {
            const selected = provider === value;
            return (
              <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl bg-white p-4 text-sm font-semibold ${selected ? 'border-2 border-[#cc7654]' : 'border border-[#efe7de]'}`}>
                <input type="radio" name="provider" value={value} checked={selected} onChange={() => setProvider(value)} className="peer sr-only" />
                <span aria-hidden="true" className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-[#cc7654] ${selected ? 'border-[#cc7654]' : 'border-[#efe7de]'}`}>{selected ? <span className="size-2.5 rounded-full bg-[#cc7654]" /> : null}</span>
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-7">
        {!user ? <Link href="/auth/login" className="block rounded-xl bg-[#cc7654] py-4 text-center text-base font-bold text-white hover:bg-[#b66545]">Sign in to reserve</Link> : user.role !== 'USER' ? <p className="text-sm text-[#595450]">Reservations are available to customer accounts.</p> : <button type="button" disabled={busy || property.status !== 'ACTIVE'} onClick={() => void pay()} className="w-full rounded-xl bg-[#cc7654] py-4 text-base font-bold text-white hover:bg-[#b66545] disabled:opacity-60">{busy ? 'Opening payment gateway…' : 'Proceed to Payment'}</button>}
      </div>
    </dialog>
  );
}
