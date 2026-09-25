'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RiCloseCircleLine, RiKey2Line, RiSecurePaymentLine } from 'react-icons/ri';
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
    <dialog ref={dialogRef} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} aria-labelledby="reserve-heading" className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-32px)] max-w-[580px] overflow-y-auto rounded-[24px] bg-white p-6 text-[#2A2723] shadow-xl backdrop:bg-black/45 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="reserve-heading" className="flex items-center gap-3 text-xl font-bold"><RiKey2Line className="rounded-lg bg-[#fff3ee] p-1 text-3xl text-[#ca7653]" />Reserve Property</h2>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Close reservation" className="rounded-full bg-[#f8f6f1] p-2 disabled:opacity-50"><RiCloseCircleLine size={18} /></button>
      </div>
      <div className="rounded-2xl bg-[#f8f6f1] p-5 text-sm">
        <p className="text-xs uppercase">Property details</p><h3 className="mt-1 font-bold">{property.title}</h3>
        <dl className="mt-3 space-y-3 border-t border-stone-200 pt-3">
          <div className="flex justify-between gap-4"><dt>Property price</dt><dd>{formatCurrency(property.price)}</dd></div>
          {fee != null ? <><div className="flex justify-between gap-4"><dt>Reservation fee</dt><dd>{formatCurrency(fee)}</dd></div><div className="flex justify-between gap-4 border-t border-stone-200 pt-3 font-bold"><dt>Total reservation payment</dt><dd className="text-[#ca7653]">{formatCurrency(fee)}</dd></div></> : <p className="text-xs leading-5 text-stone-500">The reservation fee will be confirmed at the payment gateway before you pay.</p>}
        </dl>
      </div>
      {user?.role === 'USER' ? <p className="mt-5 text-sm text-stone-500">Reserving as <span className="font-medium text-[#2A2723]">{user.fullName}</span> · {user.email}</p> : null}
      <fieldset disabled={busy} className="mt-6"><legend className="mb-3 text-xs font-bold uppercase">Payment method</legend><div className="grid gap-3 sm:grid-cols-3">{[['esewa', 'eSewa'], ['khalti', 'Khalti'], ['connectips', 'ConnectIPS']].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${provider === value ? 'border-[#ca7653] bg-[#fff9f6]' : 'border-stone-200'}`}><input type="radio" name="provider" value={value} checked={provider === value} onChange={() => setProvider(value)} className="accent-[#ca7653]" /><RiSecurePaymentLine className="shrink-0 text-[#ca7653]" />{label}</label>)}</div></fieldset>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {!user ? <Link href="/auth/login" className="mt-6 block rounded-xl bg-[#ca7653] p-3 text-center text-sm font-bold text-white">Sign in to reserve</Link> : user.role !== 'USER' ? <p className="mt-6 text-sm text-stone-600">Reservations are available to customer accounts.</p> : <button type="button" disabled={busy || property.status !== 'ACTIVE'} onClick={() => void pay()} className="mt-6 w-full rounded-xl bg-[#ca7653] p-3 text-sm font-bold text-white hover:bg-[#b66545] disabled:opacity-60">{busy ? 'Opening payment gateway…' : 'Proceed to Payment'}</button>}
    </dialog>
  );
}
