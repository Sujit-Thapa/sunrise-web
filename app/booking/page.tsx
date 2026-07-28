'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth';
import { propertiesApi, paymentApi } from '@/lib/backend';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getPropertyCategoryLabel,
  getListingTypeLabel,
  getPrimaryImage,
} from '@/lib/properties';
import type {
  InitiatePaymentDto,
  PropertyResponseDto,
  ConnectIpsInitiateResponseDto,
  EsewaInitiateResponseDto,
  KhaltiInitiateResponseDto,
} from '@/types';

type BookingStep = 1 | 2 | 3;
type FilterType = 'all' | 'house' | 'land';
type PaymentMethod = 'esewa' | 'khalti' | 'connectips';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  notes: string;
  payMethod: PaymentMethod;
}

// Client-side estimate only. The backend is the source of truth for the
// actual reservation fee (see SystemConfigResponseDto.reservationFeeAmount
// / PropertyResponseDto.reservationFeeOverride) — this percentage is just
// used to show the user an estimate before payment is initiated.
const DEPOSIT_PERCENT = 0.05;

const filterOptions: FilterType[] = ['all', 'house', 'land'];

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'esewa', label: 'eSewa' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'connectips', label: 'ConnectIPS' },
];

const inputClass = 'w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:bg-stone-50';
const buttonClass = 'border border-stone-300 bg-white px-4 py-2.5 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100';
const primaryButtonClass = 'bg-stone-900 px-5 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400';
const stepLabels = [{ n: 1, label: 'Choose Property' }, { n: 2, label: 'Your Details' }, { n: 3, label: 'Review' }];

/** Combines the address fields the backend actually returns into one line. */
function locationLabel(p: PropertyResponseDto): string {
  return formatLocation(p);
}

/** Backend has no fixed "house | land" enum — category is a free string. */
function propertyFilterType(p: PropertyResponseDto): FilterType {
  const cat = p.category.toLowerCase();
  if (cat.includes('land')) return 'land';
  return 'house';
}

function sizeLabel(p: PropertyResponseDto): string {
  return formatArea(p.areaSize, p.areaUnit);
}

function redirectTo(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noreferrer';
  link.target = '_self';
  link.click();
}

function submitPaymentForm(
  url: string,
  fields: Record<string, string>,
): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.target = '_self';

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function redirectPaymentResponse(
  response: Partial<EsewaInitiateResponseDto & ConnectIpsInitiateResponseDto> & {
    gatewayUrl?: string;
    formFields?: Record<string, string>;
  },
): void {
  const url = response.esewaUrl ?? response.paymentUrl ?? response.gatewayUrl ?? response.checkoutUrl;

  if (!url) {
    throw new Error('Payment gateway URL is missing.');
  }

  if (response.formFields && Object.keys(response.formFields).length > 0) {
    submitPaymentForm(url, response.formFields);
    return;
  }

  redirectTo(url);
}

export default function Booking() {
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    notes: '',
    payMethod: 'esewa',
  });
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [properties, setProperties] = useState<PropertyResponseDto[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        const res = await propertiesApi.findAll({ page: 1, limit: 50 });
        if (isMounted) setProperties(res.items);
      } catch (err) {
        if (isMounted) setLoadError((err as Error).message || 'Unable to load properties.');
      } finally {
        if (isMounted) setLoadingProperties(false);
      }
    };

    loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeProperties = properties ?? [];
  const selected = safeProperties.find((p) => p.id === selectedId);
  const deposit = selected ? Math.round(selected.price * DEPOSIT_PERCENT) : 0;
  const filteredProps = safeProperties.filter((p) => filterType === 'all' || propertyFilterType(p) === filterType);

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setPaymentLoading(true);

    const token = getAuthToken();

    try {
      if (!selected) throw new Error('No property selected.');
      if (!token) throw new Error('You must be logged in to proceed with payment.');

      // Real InitiatePaymentDto only accepts propertyId — amount and the
      // callback URL are computed server-side, not supplied by the client.
      const payload: InitiatePaymentDto = { propertyId: selected.id };

      if (form.payMethod === 'esewa') {
        const res = await paymentApi.initiateEsewa(payload, token);
        redirectPaymentResponse(res);
      } else if (form.payMethod === 'khalti') {
        const res: KhaltiInitiateResponseDto = await paymentApi.initiateKhalti(payload, token);
        redirectTo(res.paymentUrl);
      } else {
        const res = await paymentApi.initiateConnectIps(payload, token);
        redirectPaymentResponse(res);
      }
      // Execution stops here on success — the browser navigates away to
      // the payment gateway. The actual "booking confirmed" state should
      // live on a separate /booking/confirmation page that the gateway
      // redirects back to once payment completes, since only the backend
      // knows the true reservation outcome.
    } catch (err) {
      setPaymentError((err as Error).message || 'Unable to initiate payment.');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-stone-200 bg-white/85 px-6 py-8 shadow-brand-sm backdrop-blur sm:px-8">
          <p className="mb-3 text-[0.68rem] uppercase tracking-[0.22em] text-gold-primary">Sunrise Realestate · Advance Booking</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-midnight sm:text-[clamp(2.4rem,4vw,3.4rem)]">
            Reserve your property
            <br />
            <span className="text-slate-500">before it&apos;s gone.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[0.92rem] leading-8 text-slate-500">
            Secure your chosen home or land with an advance deposit. Our team will walk you
            through the full purchase process.
          </p>
        </div>

        <div className="mb-10 mt-8 flex flex-wrap items-center gap-0">
          {stepLabels.map((s, i, arr) => (
            <div key={s.n} className="flex flex-1 items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center border text-[0.72rem] ${step === s.n ? 'border-midnight bg-midnight text-white' : step > s.n ? 'border-stone-300 bg-stone-100 text-stone-600' : 'border-stone-300 bg-white text-stone-400'}`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-[0.72rem] uppercase tracking-[0.1em] ${step === s.n ? 'text-midnight' : 'text-stone-400'}`}>{s.label}</span>
              {i < arr.length - 1 && <div className="ml-3 hidden h-px flex-1 bg-stone-300 sm:block" />}
            </div>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            {step === 1 && (
              <div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {filterOptions.map((f) => (
                    <button key={f} className={`${buttonClass} rounded-full ${filterType === f ? 'border-midnight bg-midnight text-white' : 'bg-white'}`} onClick={() => setFilterType(f)}>
                      {f === 'all' ? 'All' : f === 'house' ? 'Houses' : 'Land'}
                    </button>
                  ))}
                </div>

                {loadingProperties ? (
                  <div className="rounded-[28px] border border-stone-200 bg-white px-8 py-16 text-center shadow-brand-sm">
                    <p className="text-sm text-slate-500">Loading properties…</p>
                  </div>
                ) : loadError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredProps.map((p) => (
                      <button key={p.id} type="button" className={`overflow-hidden rounded-[24px] border text-left transition ${selectedId === p.id ? 'border-midnight bg-white shadow-brand-md' : 'border-stone-200 bg-white hover:border-gold-primary/60 hover:shadow-brand-sm'}`} onClick={() => setSelectedId(p.id)}>
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {getPrimaryImage(p.images)?.url ? (
                            <Image
                              src={getPrimaryImage(p.images)!.url}
                              alt={p.title || 'Property'}
                              fill
                              sizes="(min-width: 768px) 50vw, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(184,155,78,0.12),rgba(15,23,42,0.05))] text-sm font-medium text-slate-500">
                              No image yet
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <p className={`mb-3 text-[0.58rem] uppercase tracking-[0.18em] ${propertyFilterType(p) === 'house' ? 'text-[#3A5070]' : 'text-[#3A5830]'}`}>{getPropertyCategoryLabel(p.category)}</p>
                          <h3 className="mb-1 text-lg font-semibold text-midnight">{p.title}</h3>
                          <p className="mb-3 text-sm text-slate-500">{locationLabel(p)}</p>
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">{sizeLabel(p)}</span>
                            <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">{getListingTypeLabel(p.listingType)}</span>
                          </div>
                          <p className="text-[1.3rem] font-semibold text-midnight">{formatCurrency(p.price)}</p>
                          <p className="mt-2 text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">{p.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button className={`${primaryButtonClass} mt-8 rounded-full`} disabled={!selectedId} onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">First Name</label>
                    <input className={inputClass} placeholder="Jane" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Last Name</label>
                    <input className={inputClass} placeholder="Smith" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
                  </div>
                </div>
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Email Address</label>
                    <input className={inputClass} type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Phone Number</label>
                    <input className={inputClass} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
                  </div>
                </div>
                <div className="mb-4 flex flex-col gap-2">
                  <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Preferred Appointment Date</label>
                  <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
                </div>
                <div className="mb-4 flex flex-col gap-2">
                  <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Notes (optional)</label>
                  <textarea className={`${inputClass} min-h-[90px] resize-none`} placeholder="Any questions or special requests…" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
                </div>
                <div className="mb-4 flex flex-col gap-2">
                  <label className="mb-2 text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Deposit Payment Method</label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {paymentOptions.map((opt) => (
                      <button key={opt.value} type="button" className={`border px-3 py-3 text-center transition ${form.payMethod === opt.value ? 'border-stone-900 bg-stone-100' : 'border-stone-300 bg-white hover:bg-stone-50'}`} onClick={() => setForm((prev) => ({ ...prev, payMethod: opt.value }))}>
                        <p className={`text-[0.68rem] uppercase tracking-[0.12em] ${form.payMethod === opt.value ? 'text-stone-900' : 'text-stone-500'}`}>{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className={buttonClass} onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className={`${primaryButtonClass} flex-1`}>Review Booking →</button>
                </div>
              </form>
            )}

            {step === 3 && selected && (
              <form onSubmit={handleConfirm}>
                  <div className="mb-6 rounded-[28px] border border-stone-200 bg-white p-8 shadow-brand-sm">
                  <p className="mb-5 text-[0.62rem] uppercase tracking-[0.18em] text-slate-400">Booking Summary</p>
                  {[
                    ['Property', selected.title],
                    ['Location', locationLabel(selected)],
                    ['Reference', selected.id.slice(0, 8).toUpperCase()],
                    ['Purchase Price', formatCurrency(selected.price)],
                    ['Estimated Deposit', formatCurrency(deposit)],
                    ['Payment Method', paymentOptions.find((o) => o.value === form.payMethod)?.label ?? ''],
                    ['Appointment', form.date],
                    ['Name', `${form.firstName} ${form.lastName}`],
                    ['Email', form.email],
                    ['Phone', form.phone],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-b-0">
                      <span className="text-stone-500">{key}</span>
                      <span className="text-stone-800">{value}</span>
                    </div>
                  ))}
                  {form.notes && (
                    <div className="pt-3 text-sm">
                      <span className="mb-1 block text-slate-500">Notes</span>
                      <span className="text-stone-800">{form.notes}</span>
                    </div>
                  )}
                </div>
                <p className="border-t border-stone-200 pt-4 text-[0.75rem] leading-6 text-slate-400">
                  The exact deposit amount is calculated by our system and confirmed on the payment gateway — the figure above is an estimate. Clicking confirm will take you to {paymentOptions.find((o) => o.value === form.payMethod)?.label} to complete payment.
                </p>
                {paymentError ? (
                  <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {paymentError}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className={buttonClass} onClick={() => setStep(2)}>← Edit Details</button>
                  <button type="submit" disabled={paymentLoading} className={`${primaryButtonClass} flex-1 ${paymentLoading ? 'cursor-wait opacity-70' : ''}`}>
                    {paymentLoading ? 'Redirecting to payment…' : 'Confirm & Pay →'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-7 shadow-brand-sm">
              <p className="mb-5 text-[0.62rem] uppercase tracking-[0.18em] text-slate-400">Selected Property</p>
              {!selected ? (
                <p className="text-sm italic text-slate-400">No property chosen yet.</p>
              ) : (
                <>
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
                    {getPrimaryImage(selected.images)?.url ? (
                      <Image
                        src={getPrimaryImage(selected.images)!.url}
                        alt={selected.title || 'Property'}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(184,155,78,0.12),rgba(15,23,42,0.05))] text-sm font-medium text-slate-500">
                        No image yet
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-semibold text-midnight">{selected.title}</p>
                  <p className="mb-5 text-sm text-slate-500">{locationLabel(selected)}</p>
                  {[
                    ['Category', selected.category],
                    ['Size', sizeLabel(selected)],
                    ['Ref', selected.id.slice(0, 8).toUpperCase()],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-b-0">
                      <span className="text-stone-500">{key}</span>
                      <span className="text-stone-800">{value}</span>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                    <span className="text-[0.72rem] uppercase tracking-[0.1em] text-slate-500">Est. Deposit</span>
                    <span className="text-[1.3rem] font-semibold text-midnight">{formatCurrency(deposit)}</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
