'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { getAuthToken } from '@/lib/auth';
import { propertiesApi, paymentApi } from '@/lib/backend';
import type {
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
  return [p.street, p.city, p.state, p.country].filter(Boolean).join(', ');
}

/** Backend has no fixed "house | land" enum — category is a free string. */
function propertyFilterType(p: PropertyResponseDto): FilterType {
  const cat = p.category.toLowerCase();
  if (cat.includes('land')) return 'land';
  return 'house';
}

function sizeLabel(p: PropertyResponseDto): string {
  if (!p.areaSize) return 'Details coming soon';
  return `${p.areaSize.toLocaleString()} ${p.areaUnit ?? ''}`.trim();
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
      const payload = { propertyId: selected.id };

      if (form.payMethod === 'esewa') {
        const res: EsewaInitiateResponseDto = await paymentApi.initiateEsewa(payload, token);
        window.location.href = res.paymentUrl;
      } else if (form.payMethod === 'khalti') {
        const res: KhaltiInitiateResponseDto = await paymentApi.initiateKhalti(payload, token);
        window.location.href = res.paymentUrl;
      } else {
        // ConnectIPS uses a different response key: checkoutUrl, not paymentUrl.
        const res: ConnectIpsInitiateResponseDto = await paymentApi.initiateConnectIps(payload, token);
        window.location.href = res.checkoutUrl;
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
    <div className="min-h-screen bg-white text-stone-800" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:px-10">
        <p className="mb-4 text-[0.68rem] uppercase tracking-[0.22em] text-stone-500">Sunrise Realty · Advance Booking</p>
        <h1 className="mb-3 max-w-[460px] font-serif text-4xl leading-[1.05] text-stone-900 sm:text-[clamp(2.4rem,4vw,3.4rem)]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Reserve your property<br />
          <em className="italic text-stone-600">before it&apos;s gone.</em>
        </h1>
        <p className="mb-14 max-w-[460px] text-[0.92rem] leading-8 text-stone-600">
          Secure your chosen home or land with an advance deposit. Our team will walk you through the full purchase process.
        </p>

        <div className="mb-14 flex flex-wrap items-center gap-0">
          {stepLabels.map((s, i, arr) => (
            <div key={s.n} className="flex flex-1 items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center border text-[0.72rem] ${step === s.n ? 'border-stone-900 bg-stone-900 text-stone-50' : step > s.n ? 'border-stone-300 bg-stone-100 text-stone-600' : 'border-stone-300 bg-white text-stone-400'}`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-[0.72rem] uppercase tracking-[0.1em] ${step === s.n ? 'text-stone-900' : 'text-stone-400'}`}>{s.label}</span>
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
                    <button key={f} className={`${buttonClass} ${filterType === f ? 'border-stone-900 bg-stone-900 text-stone-50' : ''}`} onClick={() => setFilterType(f)}>
                      {f === 'all' ? 'All' : f === 'house' ? 'Houses' : 'Land'}
                    </button>
                  ))}
                </div>

                {loadingProperties ? (
                  <p className="py-10 text-center text-sm text-stone-400">Loading properties…</p>
                ) : loadError ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</p>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {filteredProps.map((p) => (
                      <button key={p.id} type="button" className={`border p-5 text-left transition ${selectedId === p.id ? 'border-stone-900 bg-white' : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'}`} onClick={() => setSelectedId(p.id)}>
                        <p className={`mb-3 text-[0.58rem] uppercase tracking-[0.18em] ${propertyFilterType(p) === 'house' ? 'text-[#3A5070]' : 'text-[#3A5830]'}`}>{p.category}</p>
                        <h3 className="mb-1 font-serif text-lg text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{p.title}</h3>
                        <p className="mb-3 text-sm text-stone-500">{locationLabel(p)}</p>
                        <p className="mb-2 text-[0.72rem] text-stone-500">{sizeLabel(p)}</p>
                        <p className="font-serif text-[1.3rem] text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>${p.price.toLocaleString()}</p>
                        <p className="mt-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone-400">{p.id.slice(0, 8).toUpperCase()}</p>
                      </button>
                    ))}
                  </div>
                )}

                <button className={`${primaryButtonClass} mt-8`} disabled={!selectedId} onClick={() => setStep(2)}>
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
                <div className="mb-6 border border-stone-300 bg-white p-8">
                  <p className="mb-5 text-[0.62rem] uppercase tracking-[0.18em] text-stone-400">Booking Summary</p>
                  {[
                    ['Property', selected.title],
                    ['Location', locationLabel(selected)],
                    ['Reference', selected.id.slice(0, 8).toUpperCase()],
                    ['Purchase Price', `$${selected.price.toLocaleString()}`],
                    ['Estimated Deposit', `$${deposit.toLocaleString()}`],
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
                      <span className="mb-1 block text-stone-500">Notes</span>
                      <span className="text-stone-800">{form.notes}</span>
                    </div>
                  )}
                </div>
                <p className="border-t border-stone-300 pt-4 text-[0.75rem] leading-6 text-stone-400">
                  The exact deposit amount is calculated by our system and confirmed on the payment gateway — the figure above is an estimate. Clicking confirm will take you to {paymentOptions.find((o) => o.value === form.payMethod)?.label} to complete payment.
                </p>
                {paymentError ? (
                  <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
            <div className="border border-stone-300 bg-white p-7">
              <p className="mb-5 text-[0.62rem] uppercase tracking-[0.18em] text-stone-400">Selected Property</p>
              {!selected ? (
                <p className="font-serif text-sm italic text-stone-400" style={{ fontFamily: '"Cormorant Garamond", serif' }}>No property chosen yet.</p>
              ) : (
                <>
                  <p className="font-serif text-xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{selected.title}</p>
                  <p className="mb-5 text-sm text-stone-500">{locationLabel(selected)}</p>
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
                  <div className="mt-4 flex items-center justify-between border-t border-stone-300 pt-4">
                    <span className="text-[0.72rem] uppercase tracking-[0.1em] text-stone-500">Est. Deposit</span>
                    <span className="font-serif text-[1.3rem] text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>${deposit.toLocaleString()}</span>
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