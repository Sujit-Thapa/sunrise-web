'use client';

import { cubicBezier, motion } from 'framer-motion';
import Image from 'next/image';
import { Suspense, useEffect, useState, type ComponentType, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiHome4Line,
  RiMapPinLine,
  RiPriceTag3Line,
  RiSearchLine,
  RiShieldCheckLine,
  RiSparklingLine,
} from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { getAuthToken } from '@/lib/auth';
import { resolveImageSrcFromProperty } from '@/lib/image';
import { setPendingBooking, snapshotProperty } from '@/lib/account-store';
import { propertiesApi, paymentApi } from '@/lib/backend';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getPropertyCategoryLabel,
  getListingTypeLabel,
} from '@/lib/properties';
import type { ConnectIpsInitiateResponseDto, EsewaInitiateResponseDto, InitiatePaymentDto, KhaltiInitiateResponseDto, PropertyResponseDto } from '@/types';

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

function SummaryChip({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 px-4 py-4">
      <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-4 w-4 text-gold-primary" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-midnight">{value}</p>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoadingState />}>
      <Booking />
    </Suspense>
  );
}

function BookingLoadingState() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fcfbf7_0%,#f4efe5_100%)] px-4 py-16 text-center text-sm text-slate-500">
      Loading booking...
    </main>
  );
}

function Booking() {
  const { user } = useAuthSession();
  const searchParams = useSearchParams();
  const requestedPropertyId = searchParams.get('propertyId');
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedId, setSelectedId] = useState(requestedPropertyId ?? '');
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
  const deposit = selected
    ? selected.reservationFeeOverride != null
      ? Number(selected.reservationFeeOverride)
      : Math.round(selected.price * DEPOSIT_PERCENT)
    : 0;
  const depositLabel = selected?.reservationFeeOverride != null
    ? 'Reservation deposit'
    : 'Estimated deposit';
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
      if (!user) throw new Error('Please wait a moment while we verify your account.');

      // Real InitiatePaymentDto only accepts propertyId — amount and the
      // callback URL are computed server-side, not supplied by the client.
      const payload: InitiatePaymentDto = { propertyId: selected.id };
      const pendingBooking = snapshotProperty(selected);
      setPendingBooking(user.id, pendingBooking, { provider: form.payMethod });

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
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(184,155,78,0.1),transparent_28%),linear-gradient(180deg,#fcfbf7_0%,#f4efe5_100%)] text-stone-800">
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-gold-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-56 h-80 w-80 rounded-full bg-midnight/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: cubicBezier(0.22, 1, 0.36, 1) }}
          className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
            <RiSparklingLine className="h-4 w-4" />
            Sunrise Realestate · Advance Booking
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-midnight sm:text-[clamp(2.4rem,4vw,3.4rem)]">
            Reserve your property
            <br />
            <span className="text-slate-500">before it&apos;s gone.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Secure your chosen home or land with an advance deposit. Our team will walk you through
            the full purchase process.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryChip icon={RiHome4Line} label="Selected" value={selected ? selected.title : 'Pick a property'} />
            <SummaryChip icon={RiPriceTag3Line} label={depositLabel} value={selected ? formatCurrency(deposit) : 'Calculated after selection'} />
            <SummaryChip icon={RiShieldCheckLine} label="Flow" value="Secure gateway checkout" />
          </div>
        </motion.section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {stepLabels.map((s, i, arr) => {
            const active = step === s.n;
            const complete = step > s.n;

            return (
              <div key={s.n} className="flex flex-1 items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-[0.72rem] font-semibold ${active ? 'border-midnight bg-midnight text-white' : complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-300 bg-white text-stone-400'}`}>
                  {complete ? '✓' : s.n}
                </div>
                <span className={`text-[0.72rem] uppercase tracking-[0.12em] ${active ? 'text-midnight' : 'text-stone-400'}`}>
                  {s.label}
                </span>
                {i < arr.length - 1 ? <div className="ml-3 hidden h-px flex-1 bg-stone-300/80 sm:block" /> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-8">
            {step === 1 ? (
              <section className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-primary">
                      <RiSearchLine className="h-4 w-4" />
                      Choose a property
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-midnight">Pick the home you want to reserve</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`rounded-full border px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] transition ${
                          filterType === f
                            ? 'border-midnight bg-midnight text-white'
                            : 'border-stone-200 bg-white text-slate-500 hover:border-gold-primary hover:text-gold-primary'
                        }`}
                        onClick={() => setFilterType(f)}
                      >
                        {f === 'all' ? 'All' : f === 'house' ? 'Houses' : 'Land'}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingProperties ? (
                  <div className="mt-6 rounded-[26px] border border-stone-200 bg-stone-50 px-8 py-16 text-center">
                    <p className="text-sm text-slate-500">Loading properties…</p>
                  </div>
                ) : loadError ? (
                  <p className="mt-6 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {loadError}
                  </p>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {filteredProps.map((p) => {
                      const selectedCard = selectedId === p.id;

                      return (
                        <motion.button
                          key={p.id}
                          type="button"
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.99 }}
                          className={`overflow-hidden rounded-[24px] border text-left transition ${
                            selectedCard
                              ? 'border-midnight bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]'
                              : 'border-stone-200 bg-white hover:border-gold-primary/60 hover:shadow-[0_18px_50px_rgba(15,23,42,0.06)]'
                          }`}
                          onClick={() => setSelectedId(p.id)}
                        >
                          <div className="relative aspect-[4/3] bg-slate-100">
                            <Image
                              src={resolveImageSrcFromProperty(p)}
                              alt={p.title || 'Property'}
                              fill
                              sizes="(min-width: 768px) 50vw, 100vw"
                              className="object-cover"
                            />
                            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-midnight backdrop-blur">
                              {propertyFilterType(p) === 'house' ? 'House' : 'Land'}
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="mb-3 text-[0.58rem] uppercase tracking-[0.18em] text-slate-400">
                              {getPropertyCategoryLabel(p.category)}
                            </p>
                            <h3 className="mb-1 text-lg font-semibold text-midnight">{p.title}</h3>
                            <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                              <RiMapPinLine className="h-4 w-4 shrink-0 text-gold-primary" />
                              {locationLabel(p)}
                            </p>
                            <div className="mb-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                                {sizeLabel(p)}
                              </span>
                              <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                                {getListingTypeLabel(p.listingType)}
                              </span>
                            </div>
                            <p className="text-[1.3rem] font-semibold text-midnight">{formatCurrency(p.price)}</p>
                            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">
                              {p.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedId}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <RiArrowRightLine className="h-4 w-4" />
                  </button>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: cubicBezier(0.22, 1, 0.36, 1) }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(3);
                }}
                className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6"
              >
                <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-primary">
                  <RiCalendarCheckLine className="h-4 w-4" />
                  Your details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-midnight">Tell us who we should contact</h2>

                <div className="mt-6 mb-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">First name</label>
                    <input
                      className={inputClass}
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Last name</label>
                    <input
                      className={inputClass}
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Email address</label>
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">Phone number</label>
                    <input
                      className={inputClass}
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-2">
                  <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">
                    Preferred appointment date
                  </label>
                  <input
                    className={inputClass}
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="mb-4 flex flex-col gap-2">
                  <label className="text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">
                    Notes (optional)
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[110px] resize-none`}
                    placeholder="Any questions or special requests…"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="mb-4 flex flex-col gap-2">
                  <label className="mb-2 text-[0.62rem] uppercase tracking-[0.16em] text-stone-500">
                    Deposit payment method
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {paymentOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`rounded-[18px] border px-3 py-3 text-center transition ${
                          form.payMethod === opt.value
                            ? 'border-midnight bg-stone-100'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, payMethod: opt.value }))}
                      >
                        <p
                          className={`text-[0.68rem] uppercase tracking-[0.12em] ${
                            form.payMethod === opt.value ? 'text-stone-900' : 'text-stone-500'
                          }`}
                        >
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                    onClick={() => setStep(1)}
                  >
                    <RiArrowLeftLine className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-midnight px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800"
                  >
                    Review booking
                    <RiArrowRightLine className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>
            ) : null}

            {step === 3 && selected ? (
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: cubicBezier(0.22, 1, 0.36, 1) }}
                onSubmit={handleConfirm}
                className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6"
              >
                <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-primary">
                  <RiPriceTag3Line className="h-4 w-4" />
                  Review
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-midnight">Confirm your booking details</h2>

                <div className="mt-6 rounded-[28px] border border-stone-200 bg-white p-6">
                  {[
                    ['Property', selected.title],
                    ['Location', locationLabel(selected)],
                    ['Reference', selected.id.slice(0, 8).toUpperCase()],
                    ['Purchase price', formatCurrency(selected.price)],
                    [depositLabel, formatCurrency(deposit)],
                    ['Payment method', paymentOptions.find((o) => o.value === form.payMethod)?.label ?? ''],
                    ['Appointment', form.date],
                    ['Name', `${form.firstName} ${form.lastName}`],
                    ['Email', form.email],
                    ['Phone', form.phone],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-b-0">
                      <span className="text-stone-500">{key}</span>
                      <span className="max-w-[55%] text-right text-stone-800">{value}</span>
                    </div>
                  ))}

                  {form.notes ? (
                    <div className="pt-3 text-sm">
                      <span className="mb-1 block text-slate-500">Notes</span>
                      <span className="text-stone-800">{form.notes}</span>
                    </div>
                  ) : null}
                </div>

                <p className="mt-4 text-[0.75rem] leading-6 text-slate-400">
                  The exact deposit amount is calculated by our system and confirmed on the payment
                  gateway. Clicking confirm will take you to{' '}
                  {paymentOptions.find((o) => o.value === form.payMethod)?.label} to complete payment.
                </p>

                {paymentError ? (
                  <p className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {paymentError}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                    onClick={() => setStep(2)}
                  >
                    <RiArrowLeftLine className="h-4 w-4" />
                    Edit details
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-midnight px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-70`}
                  >
                    {paymentLoading ? 'Redirecting to payment…' : 'Confirm & pay'}
                    <RiArrowRightLine className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-primary">
                <RiShieldCheckLine className="h-4 w-4" />
                Selected property
              </p>
              {!selected ? (
                <p className="mt-4 text-sm italic text-slate-400">No property chosen yet.</p>
              ) : (
                <>
                  <div className="relative mt-5 mb-5 aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
                    <Image
                      src={resolveImageSrcFromProperty(selected)}
                      alt={selected.title || 'Property'}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xl font-semibold text-midnight">{selected.title}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <RiMapPinLine className="h-4 w-4 shrink-0 text-gold-primary" />
                    {locationLabel(selected)}
                  </p>
                  <div className="mt-5 space-y-3">
                    {[
                      ['Category', selected.category],
                      ['Size', sizeLabel(selected)],
                      ['Reference', selected.id.slice(0, 8).toUpperCase()],
                    ].map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-b-0">
                        <span className="text-stone-500">{key}</span>
                        <span className="text-stone-800">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4">
                    <span className="text-[0.72rem] uppercase tracking-[0.1em] text-slate-500">
                      {depositLabel}
                    </span>
                    <span className="text-[1.3rem] font-semibold text-midnight">{formatCurrency(deposit)}</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
