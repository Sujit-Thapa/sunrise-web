'use client';

import { useState, type FormEvent } from 'react';

type BookingStep = 1 | 2 | 3;

type FilterType = 'all' | 'house' | 'land';
type PaymentMethod = 'bank' | 'card' | 'escrow';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: 'house' | 'land';
  size: string;
  beds?: number;
  baths?: number;
  ref: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  notes: string;
  payMethod: PaymentMethod;
}

const PROPERTIES: Property[] = [
  { id: '1', title: 'The Harlow Estate', location: 'Maplewood, NJ', price: 1250000, type: 'house', size: '4,800 sq ft', beds: 5, baths: 4, ref: 'SR-001' },
  { id: '2', title: 'Meridian Townhouse', location: 'Austin, TX', price: 620000, type: 'house', size: '2,200 sq ft', beds: 3, baths: 2, ref: 'SR-002' },
  { id: '3', title: 'Lakeview Parcel A', location: 'Boulder, CO', price: 390000, type: 'land', size: '1.8 acres', ref: 'SR-003' },
  { id: '4', title: 'The Westfield Residence', location: 'Pasadena, CA', price: 895000, type: 'house', size: '3,100 sq ft', beds: 4, baths: 3, ref: 'SR-004' },
  { id: '5', title: 'Ridgecrest Plot', location: 'Asheville, NC', price: 215000, type: 'land', size: '0.9 acres', ref: 'SR-005' },
  { id: '6', title: 'The Alderton', location: 'Portland, OR', price: 745000, type: 'house', size: '2,650 sq ft', beds: 4, baths: 3, ref: 'SR-006' },
];

const DEPOSIT_PERCENT = 0.05;
const filterOptions: FilterType[] = ['all', 'house', 'land'];
const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'card', label: 'Credit Card' },
  { value: 'escrow', label: 'Escrow' },
];
const inputClass = 'w-full border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:bg-stone-50';
const buttonClass = 'border border-stone-300 bg-white px-4 py-2.5 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100';
const primaryButtonClass = 'bg-stone-900 px-5 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400';

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
    payMethod: 'bank',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const selected = PROPERTIES.find((p) => p.id === selectedId);
  const deposit = selected ? Math.round(selected.price * DEPOSIT_PERCENT) : 0;
  const filteredProps = PROPERTIES.filter((p) => filterType === 'all' || p.type === filterType);
  const bookingId = `BK-${selected?.ref?.slice(-3) ?? '000'}`;

  const handleConfirm = (e: FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  const resetBooking = () => {
    setConfirmed(false);
    setStep(1);
    setSelectedId('');
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      date: '',
      notes: '',
      payMethod: 'bank',
    });
  };

  if (confirmed && selected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-stone-800 sm:px-8" style={{ fontFamily: '"DM Sans", sans-serif' }}>
        <div className="w-full max-w-[520px] text-center">
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#C0D8B0] text-[#4A7040]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-stone-500">Booking Confirmed</p>
          <h1 className="mb-4 font-serif text-4xl leading-tight text-stone-900 sm:text-[2.4rem]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            You&apos;re one step<br />
            <em className="italic text-stone-600">closer to home.</em>
          </h1>
          <p className="mx-auto mb-10 max-w-[420px] text-sm leading-7 text-stone-600">
            Your advance booking has been received. Our team will contact you at <strong>{form.email}</strong> within 24 hours to confirm your deposit and walk you through the next steps.
          </p>
          <div className="mb-8 border border-stone-300 bg-white p-6 text-left">
            {[
              ['Property', selected.title],
              ['Reference', selected.ref],
              ['Purchase Price', `$${selected.price.toLocaleString()}`],
              ['Deposit Due (5%)', `$${deposit.toLocaleString()}`],
              ['Appointment', form.date],
              ['Contact', `${form.firstName} ${form.lastName}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-b-0 last:font-medium">
                <span className="text-stone-500">{label}</span>
                <span className="text-stone-800">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-stone-400">Booking ID · BK-{Date.now().toString().slice(-6)}</p>
          <button className="mt-8 border border-stone-300 bg-transparent px-8 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-stone-600 transition hover:bg-stone-100" onClick={resetBooking}>
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-800" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:px-10">
        <p className="mb-4 text-[0.68rem] uppercase tracking-[0.22em] text-stone-500">Sunrise Realty · Advance Booking</p>
        <h1 className="mb-3 max-w-[460px] font-serif text-4xl leading-[1.05] text-stone-900 sm:text-[clamp(2.4rem,4vw,3.4rem)]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Reserve your property<br />
          <em className="italic text-stone-600">before it&apos;s gone.</em>
        </h1>
        <p className="mb-14 max-w-[460px] text-[0.92rem] leading-8 text-stone-600">
          Secure your chosen home or land with a 5% advance deposit. Our team will walk you through the full purchase process.
        </p>

        <div className="mb-14 flex flex-wrap items-center gap-0">
          {[{ n: 1, label: 'Choose Property' }, { n: 2, label: 'Your Details' }, { n: 3, label: 'Review' }].map((s, i, arr) => (
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
                <div className="grid gap-2 md:grid-cols-2">
                  {filteredProps.map((p) => (
                    <button key={p.id} type="button" className={`border p-5 text-left transition ${selectedId === p.id ? 'border-stone-900 bg-white' : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'}`} onClick={() => setSelectedId(p.id)}>
                      <p className={`mb-3 text-[0.58rem] uppercase tracking-[0.18em] ${p.type === 'house' ? 'text-[#3A5070]' : 'text-[#3A5830]'}`}>{p.type}</p>
                      <h3 className="mb-1 font-serif text-lg text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{p.title}</h3>
                      <p className="mb-3 text-sm text-stone-500">{p.location}</p>
                      {p.beds || p.baths ? (
                        <div className="mb-2 flex flex-wrap gap-3 text-[0.72rem] text-stone-500">
                          {p.beds && <span>{p.beds} bd</span>}
                          {p.baths && <span>{p.baths} ba</span>}
                          <span>{p.size}</span>
                        </div>
                      ) : (
                        <p className="mb-2 text-[0.72rem] text-stone-500">{p.size}</p>
                      )}
                      <p className="font-serif text-[1.3rem] text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>${p.price.toLocaleString()}</p>
                      <p className="mt-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone-400">{p.ref}</p>
                    </button>
                  ))}
                </div>
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
                    ['Location', selected.location],
                    ['Reference', selected.ref],
                    ['Purchase Price', `$${selected.price.toLocaleString()}`],
                    ['Deposit (5%)', `$${deposit.toLocaleString()}`],
                    ['Payment Method', form.payMethod === 'bank' ? 'Bank Transfer' : form.payMethod === 'card' ? 'Credit Card' : 'Escrow'],
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
                  By confirming this booking, you agree to pay a 5% advance deposit of <strong className="text-stone-600">${deposit.toLocaleString()}</strong>. This reserves the property exclusively for you for 30 days while the full purchase agreement is prepared. The deposit is fully refundable within 7 days.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className={buttonClass} onClick={() => setStep(2)}>← Edit Details</button>
                  <button type="submit" className={`${primaryButtonClass} flex-1`}>Confirm Booking →</button>
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
                  <p className="mb-5 text-sm text-stone-500">{selected.location}</p>
                  {[
                    ['Type', selected.type.charAt(0).toUpperCase() + selected.type.slice(1)],
                    ['Size', selected.size],
                    ...(selected.beds ? [['Beds / Baths', `${selected.beds} / ${selected.baths}`]] : []),
                    ['Ref', selected.ref],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-b-0">
                      <span className="text-stone-500">{key}</span>
                      <span className="text-stone-800">{value}</span>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center justify-between border-t border-stone-300 pt-4">
                    <span className="text-[0.72rem] uppercase tracking-[0.1em] text-stone-500">Deposit Due</span>
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
