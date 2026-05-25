'use client';

import { useState } from 'react';

type BookingStep = 1 | 2 | 3;

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

const PROPERTIES: Property[] = [
  { id: '1', title: 'The Harlow Estate', location: 'Maplewood, NJ', price: 1250000, type: 'house', size: '4,800 sq ft', beds: 5, baths: 4, ref: 'SR-001' },
  { id: '2', title: 'Meridian Townhouse', location: 'Austin, TX', price: 620000, type: 'house', size: '2,200 sq ft', beds: 3, baths: 2, ref: 'SR-002' },
  { id: '3', title: 'Lakeview Parcel A', location: 'Boulder, CO', price: 390000, type: 'land', size: '1.8 acres', ref: 'SR-003' },
  { id: '4', title: 'The Westfield Residence', location: 'Pasadena, CA', price: 895000, type: 'house', size: '3,100 sq ft', beds: 4, baths: 3, ref: 'SR-004' },
  { id: '5', title: 'Ridgecrest Plot', location: 'Asheville, NC', price: 215000, type: 'land', size: '0.9 acres', ref: 'SR-005' },
  { id: '6', title: 'The Alderton', location: 'Portland, OR', price: 745000, type: 'house', size: '2,650 sq ft', beds: 4, baths: 3, ref: 'SR-006' },
];

const DEPOSIT_PERCENT = 0.05;

export default function Booking() {
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedId, setSelectedId] = useState<string>('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', date: '', notes: '', payMethod: 'bank' });
  const [confirmed, setConfirmed] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'house' | 'land'>('all');

  const selected = PROPERTIES.find((p) => p.id === selectedId);
  const deposit = selected ? Math.round(selected.price * DEPOSIT_PERCENT) : 0;

  const filteredProps = PROPERTIES.filter((p) => filterType === 'all' || p.type === filterType);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  if (confirmed && selected) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');
          .bk { min-height: 100vh; background: #F7F5F0; font-family: 'DM Sans', sans-serif; font-weight: 300; color: #1A1814; display: flex; align-items: center; justify-content: center; padding: 4rem 2rem; }
          .bk-success { max-width: 520px; width: 100%; text-align: center; }
          .bk-tick { width: 52px; height: 52px; border: 1px solid #C0D8B0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: #4A7040; }
          .bk-success-eyebrow { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: #8A8070; margin-bottom: 0.75rem; }
          .bk-success-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 2.4rem; color: #1A1814; margin: 0 0 1rem; }
          .bk-success-title em { font-style: italic; color: #5C5040; }
          .bk-success-body { font-size: 0.88rem; line-height: 1.8; color: #6E6455; margin-bottom: 2.5rem; }
          .bk-summary-box { background: #fff; border: 1px solid #E0DAD0; padding: 1.5rem; text-align: left; margin-bottom: 2rem; }
          .bk-summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #F0EBE4; font-size: 0.85rem; }
          .bk-summary-row:last-child { border-bottom: none; font-weight: 400; }
          .bk-summary-label { color: #8A8070; }
          .bk-summary-val { color: #1A1814; }
          .bk-ref { font-size: 0.68rem; letter-spacing: 0.16em; color: #B0A890; text-transform: uppercase; }
          .bk-restart { background: none; border: 1px solid #E0DAD0; padding: 0.8rem 2rem; font-family: 'DM Sans', sans-serif; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8070; cursor: pointer; transition: all 0.2s; }
          .bk-restart:hover { background: #EFECE5; }
        `}</style>
        <div className="bk">
          <div className="bk-success">
            <div className="bk-tick">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="bk-success-eyebrow">Booking Confirmed</p>
            <h1 className="bk-success-title">You're one step<br /><em>closer to home.</em></h1>
            <p className="bk-success-body">
              Your advance booking has been received. Our team will contact you at <strong>{form.email}</strong> within 24 hours to confirm your deposit and walk you through the next steps.
            </p>
            <div className="bk-summary-box">
              {[
                ['Property', selected.title],
                ['Reference', selected.ref],
                ['Purchase Price', `$${selected.price.toLocaleString()}`],
                ['Deposit Due (5%)', `$${deposit.toLocaleString()}`],
                ['Appointment', form.date],
                ['Contact', `${form.firstName} ${form.lastName}`],
              ].map(([label, val]) => (
                <div className="bk-summary-row" key={label}>
                  <span className="bk-summary-label">{label}</span>
                  <span className="bk-summary-val">{val}</span>
                </div>
              ))}
            </div>
            <p className="bk-ref">Booking ID · BK-{Date.now().toString().slice(-6)}</p>
            <br /><br />
            <button className="bk-restart" onClick={() => { setConfirmed(false); setStep(1); setSelectedId(''); setForm({ firstName: '', lastName: '', email: '', phone: '', date: '', notes: '', payMethod: 'bank' }); }}>
              Make Another Booking
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .bk { min-height: 100vh; background: #F7F5F0; font-family: 'DM Sans', sans-serif; font-weight: 300; color: #1A1814; }
        .bk-container { max-width: 1100px; margin: 0 auto; padding: 6rem 2.5rem 5rem; }

        /* Header */
        .bk-eyebrow { font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase; color: #8A8070; margin-bottom: 1rem; }
        .bk-headline { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.4rem, 4vw, 3.4rem); line-height: 1.08; color: #1A1814; margin: 0 0 0.9rem; letter-spacing: -0.01em; }
        .bk-headline em { font-style: italic; color: #5C5040; }
        .bk-subhead { font-size: 0.92rem; line-height: 1.8; color: #6E6455; max-width: 460px; margin-bottom: 3.5rem; }

        /* Steps */
        .bk-steps { display: flex; align-items: center; gap: 0; margin-bottom: 3.5rem; }
        .bk-step { display: flex; align-items: center; gap: 0.65rem; }
        .bk-step-num { width: 28px; height: 28px; border: 1px solid #E0DAD0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: #B0A890; flex-shrink: 0; }
        .bk-step-num.active { background: #1A1814; color: #F7F5F0; border-color: #1A1814; }
        .bk-step-num.done { background: #EFECE5; color: #6E6455; border-color: #E0DAD0; }
        .bk-step-label { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: #B0A890; }
        .bk-step-label.active { color: #1A1814; }
        .bk-step-sep { flex: 1; height: 1px; background: #E0DAD0; margin: 0 1rem; max-width: 60px; }

        /* Body layout */
        .bk-body { display: grid; grid-template-columns: 1fr 320px; gap: 3rem; align-items: start; }

        /* Property grid */
        .bk-prop-filters { display: flex; gap: 2px; margin-bottom: 1.5rem; }
        .bk-filter-btn { background: #fff; border: 1px solid #E0DAD0; padding: 0.55rem 1rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #8A8070; cursor: pointer; transition: all 0.2s; }
        .bk-filter-btn.active { background: #1A1814; color: #F7F5F0; border-color: #1A1814; }

        .bk-prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .bk-prop-card { background: #fff; border: 2px solid transparent; padding: 1.4rem; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .bk-prop-card:hover { background: #FDFCF9; border-color: #D8D0C0; }
        .bk-prop-card.selected { border-color: #1A1814; background: #fff; }

        .bk-prop-type { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 0.75rem; }
        .bk-prop-type.house { color: #3A5070; }
        .bk-prop-type.land { color: #3A5830; }
        .bk-prop-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 1.1rem; color: #1A1814; margin: 0 0 0.25rem; line-height: 1.2; }
        .bk-prop-loc { font-size: 0.75rem; color: #9A9080; margin-bottom: 0.9rem; }
        .bk-prop-price { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 1.3rem; color: #1A1814; }
        .bk-prop-ref { font-size: 0.62rem; letter-spacing: 0.12em; color: #C0B8A8; text-transform: uppercase; }
        .bk-prop-meta { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
        .bk-prop-meta-item { font-size: 0.72rem; color: #9A9080; }

        .bk-next-btn { margin-top: 2rem; background: #1A1814; color: #F7F5F0; border: none; padding: 0.9rem 2rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .bk-next-btn:disabled { background: #C0B8A8; cursor: not-allowed; }
        .bk-next-btn:not(:disabled):hover { background: #3A3428; }

        /* Sidebar summary */
        .bk-sidebar { position: sticky; top: 2rem; }
        .bk-sidebar-card { background: #fff; border: 1px solid #E0DAD0; padding: 1.75rem; }
        .bk-sidebar-heading { font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: #B0A890; margin-bottom: 1.25rem; }
        .bk-sidebar-empty { font-size: 0.85rem; color: #C0B8A8; font-style: italic; font-family: 'Cormorant Garamond', serif; }
        .bk-sidebar-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 1.2rem; color: #1A1814; margin-bottom: 0.2rem; }
        .bk-sidebar-loc { font-size: 0.78rem; color: #9A9080; margin-bottom: 1.25rem; }
        .bk-sidebar-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.5rem 0; border-bottom: 1px solid #F0EBE4; }
        .bk-sidebar-row:last-child { border-bottom: none; }
        .bk-sidebar-key { color: #8A8070; }
        .bk-sidebar-val { color: #1A1814; }
        .bk-deposit-row { display: flex; justify-content: space-between; font-size: 0.88rem; padding: 1rem 0 0; margin-top: 0.5rem; border-top: 1px solid #E0DAD0; }
        .bk-deposit-key { color: #5C5040; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; }
        .bk-deposit-val { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: #1A1814; }

        /* Form */
        .bk-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .bk-field { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1rem; }
        .bk-label { font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8070; }
        .bk-input, .bk-select, .bk-textarea { background: #fff; border: 1px solid #E0DAD0; padding: 0.8rem 0.9rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.88rem; color: #1A1814; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; -webkit-appearance: none; }
        .bk-input:focus, .bk-select:focus, .bk-textarea:focus { border-color: #8A8070; background: #FDFCF9; }
        .bk-input::placeholder, .bk-textarea::placeholder { color: #C0B8A8; }
        .bk-textarea { resize: none; min-height: 90px; }

        .bk-pay-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 1rem; }
        .bk-pay-opt { border: 1px solid #E0DAD0; padding: 0.9rem 0.75rem; cursor: pointer; text-align: center; transition: all 0.2s; }
        .bk-pay-opt.selected { border-color: #1A1814; background: #EFECE5; }
        .bk-pay-opt:hover:not(.selected) { background: #FDFCF9; }
        .bk-pay-label { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: #8A8070; }
        .bk-pay-label.selected { color: #1A1814; }

        .bk-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .bk-back-btn { background: none; border: 1px solid #E0DAD0; padding: 0.9rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8070; cursor: pointer; transition: all 0.2s; }
        .bk-back-btn:hover { background: #EFECE5; }
        .bk-submit-btn { flex: 1; background: #1A1814; color: #F7F5F0; border: none; padding: 0.9rem; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .bk-submit-btn:hover { background: #3A3428; }

        .bk-notice { font-size: 0.75rem; color: #B0A890; line-height: 1.6; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #E0DAD0; }

        @media (max-width: 860px) {
          .bk-body { grid-template-columns: 1fr; }
          .bk-sidebar { position: static; }
          .bk-prop-grid { grid-template-columns: 1fr; }
          .bk-form-grid { grid-template-columns: 1fr; }
          .bk-pay-options { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .bk-container { padding: 4rem 1.5rem 4rem; }
        }
      `}</style>

      <div className="bk">
        <div className="bk-container">

          {/* Header */}
          <p className="bk-eyebrow">Sunrise Realty · Advance Booking</p>
          <h1 className="bk-headline">Reserve your property<br /><em>before it's gone.</em></h1>
          <p className="bk-subhead">
            Secure your chosen home or land with a 5% advance deposit. Our team will walk you through the full purchase process.
          </p>

          {/* Steps */}
          <div className="bk-steps">
            {[{ n: 1, label: 'Choose Property' }, { n: 2, label: 'Your Details' }, { n: 3, label: 'Review' }].map((s, i, arr) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? '1' : 'none' }}>
                <div className="bk-step">
                  <div className={`bk-step-num ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <span className={`bk-step-label ${step === s.n ? 'active' : ''}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="bk-step-sep" />}
              </div>
            ))}
          </div>

          <div className="bk-body">

            {/* Main content */}
            <div>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="bk-prop-filters">
                    {(['all', 'house', 'land'] as const).map((f) => (
                      <button key={f} className={`bk-filter-btn ${filterType === f ? 'active' : ''}`} onClick={() => setFilterType(f)}>
                        {f === 'all' ? 'All' : f === 'house' ? 'Houses' : 'Land'}
                      </button>
                    ))}
                  </div>
                  <div className="bk-prop-grid">
                    {filteredProps.map((p) => (
                      <div key={p.id} className={`bk-prop-card ${selectedId === p.id ? 'selected' : ''}`} onClick={() => setSelectedId(p.id)}>
                        <p className={`bk-prop-type ${p.type}`}>{p.type}</p>
                        <h3 className="bk-prop-title">{p.title}</h3>
                        <p className="bk-prop-loc">{p.location}</p>
                        {(p.beds || p.baths) && (
                          <div className="bk-prop-meta">
                            {p.beds && <span className="bk-prop-meta-item">{p.beds} bd</span>}
                            {p.baths && <span className="bk-prop-meta-item">{p.baths} ba</span>}
                            <span className="bk-prop-meta-item">{p.size}</span>
                          </div>
                        )}
                        {p.type === 'land' && <p className="bk-prop-meta-item" style={{ marginBottom: '0.5rem', fontSize: '0.72rem', color: '#9A9080' }}>{p.size}</p>}
                        <p className="bk-prop-price">${p.price.toLocaleString()}</p>
                        <p className="bk-prop-ref">{p.ref}</p>
                      </div>
                    ))}
                  </div>
                  <button className="bk-next-btn" disabled={!selectedId} onClick={() => setStep(2)}>
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                  <div className="bk-form-grid">
                    <div className="bk-field">
                      <label className="bk-label">First Name</label>
                      <input className="bk-input" placeholder="Jane" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                    </div>
                    <div className="bk-field">
                      <label className="bk-label">Last Name</label>
                      <input className="bk-input" placeholder="Smith" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="bk-form-grid">
                    <div className="bk-field">
                      <label className="bk-label">Email Address</label>
                      <input className="bk-input" type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="bk-field">
                      <label className="bk-label">Phone Number</label>
                      <input className="bk-input" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Preferred Appointment Date</label>
                    <input className="bk-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Notes (optional)</label>
                    <textarea className="bk-textarea" placeholder="Any questions or special requests…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label" style={{ marginBottom: '0.65rem' }}>Deposit Payment Method</label>
                    <div className="bk-pay-options">
                      {[{ val: 'bank', label: 'Bank Transfer' }, { val: 'card', label: 'Credit Card' }, { val: 'escrow', label: 'Escrow' }].map((opt) => (
                        <div key={opt.val} className={`bk-pay-opt ${form.payMethod === opt.val ? 'selected' : ''}`} onClick={() => setForm({ ...form, payMethod: opt.val })}>
                          <p className={`bk-pay-label ${form.payMethod === opt.val ? 'selected' : ''}`}>{opt.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bk-form-actions">
                    <button type="button" className="bk-back-btn" onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" className="bk-submit-btn">Review Booking →</button>
                  </div>
                </form>
              )}

              {/* Step 3 */}
              {step === 3 && selected && (
                <form onSubmit={handleConfirm}>
                  <div style={{ background: '#fff', border: '1px solid #E0DAD0', padding: '2rem', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B0A890', marginBottom: '1.25rem' }}>Booking Summary</p>
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
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #F0EBE4', fontSize: '0.85rem' }}>
                        <span style={{ color: '#8A8070' }}>{k}</span>
                        <span style={{ color: '#1A1814' }}>{v}</span>
                      </div>
                    ))}
                    {form.notes && (
                      <div style={{ padding: '0.55rem 0', fontSize: '0.85rem' }}>
                        <span style={{ color: '#8A8070', display: 'block', marginBottom: '0.25rem' }}>Notes</span>
                        <span style={{ color: '#1A1814' }}>{form.notes}</span>
                      </div>
                    )}
                  </div>
                  <p className="bk-notice">
                    By confirming this booking, you agree to pay a 5% advance deposit of <strong>${deposit.toLocaleString()}</strong>. This reserves the property exclusively for you for 30 days while the full purchase agreement is prepared. The deposit is fully refundable within 7 days.
                  </p>
                  <div className="bk-form-actions">
                    <button type="button" className="bk-back-btn" onClick={() => setStep(2)}>← Edit Details</button>
                    <button type="submit" className="bk-submit-btn">Confirm Booking →</button>
                  </div>
                </form>
              )}

            </div>

            {/* Sidebar */}
            <div className="bk-sidebar">
              <div className="bk-sidebar-card">
                <p className="bk-sidebar-heading">Selected Property</p>
                {!selected ? (
                  <p className="bk-sidebar-empty">No property chosen yet.</p>
                ) : (
                  <>
                    <p className="bk-sidebar-title">{selected.title}</p>
                    <p className="bk-sidebar-loc">{selected.location}</p>
                    {[
                      ['Type', selected.type.charAt(0).toUpperCase() + selected.type.slice(1)],
                      ['Size', selected.size],
                      ...(selected.beds ? [['Beds / Baths', `${selected.beds} / ${selected.baths}`]] : []),
                      ['Ref', selected.ref],
                    ].map(([k, v]) => (
                      <div className="bk-sidebar-row" key={k}>
                        <span className="bk-sidebar-key">{k}</span>
                        <span className="bk-sidebar-val">{v}</span>
                      </div>
                    ))}
                    <div className="bk-deposit-row">
                      <span className="bk-deposit-key">Deposit Due</span>
                      <span className="bk-deposit-val">${deposit.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}