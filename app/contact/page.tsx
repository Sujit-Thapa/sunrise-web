'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Bookmark, Check, CheckCircle2, MessagesSquare } from 'lucide-react';

import Breadcrumb from '@/components/ui/Breadcrumb';
import { INQUIRY_TYPES, type InquiryType } from '@/lib/contact';

const EMPTY = { name: '', email: '', phone: '', propertyReference: '', message: '' };
const inputClass = 'h-11 w-full rounded-lg border border-[#e6e1d8] bg-[#f7f5f1] px-3.5 text-sm text-[#2a2723] outline-none transition placeholder:text-[#a19c95] focus:border-[#cc7654] focus:bg-white';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-[#2a2723]';

const FAQS = [
  { q: 'How do I ask about a specific property?', a: 'Choose Buying / reservations and add the property name, listing ID or link. Include your questions, preferred location and budget so the inquiry is easier to understand.' },
  { q: 'Can I list my own property?', a: 'Use List Properties to start an owner marketplace listing. For questions about presenting your property, choose Selling / marketplace listing in the inquiry form.' },
  { q: 'Does reserving a property confirm a purchase?', a: 'No. A reservation expresses interest. Availability, price and final terms still need to be confirmed with the relevant owner or agent before any purchase decision.' },
  { q: 'Can you help with investment or rental questions?', a: 'Yes. Choose Investment / valuation or Rental / management and describe your goals. For account questions, choose General support; never include your password.' },
];

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#cc7654] hover:underline">{children}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>;
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [inquiryType, setInquiryType] = useState<InquiryType>(INQUIRY_TYPES[0]);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const update = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inquiryType, consent }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(response.status >= 500 ? 'We could not send your inquiry right now. Please try again later.' : payload?.message || 'Please check your information and try again.');
      }
      setStatus('sent');
      setForm(EMPTY);
      setConsent(false);
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Unable to send your inquiry. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-2 text-[#2a2723] sm:px-8 xl:px-0">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />

      <p className="mt-10 text-sm font-bold tracking-[0.01em] text-[#cc7654]">CONTACT US</p>
      <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-[0.01em] sm:text-[55px]">Let’s talk about <span className="text-[#cc7654]">your next move.</span></h1>
      <p className="mt-5 max-w-[680px] text-base leading-[1.6] text-[#6b665f] sm:text-lg">Looking for a property, planning an investment or listing your own? Tell Sunrise what you have in mind, and let’s find a suitable way forward.</p>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="rounded-[26px] bg-white p-6 sm:p-9" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="text-[28px] font-bold tracking-[0.01em]">How can we help?</h2>
          <p className="mt-1.5 text-sm text-[#6b665f]">Share a few details so your inquiry has the right context.</p>
          <p className="mt-1 text-xs text-[#9a958e]">Fields marked * are required.</p>

          {status === 'sent' ? <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-[#e6efe7] px-4 py-3 text-sm text-[#3e6b4a]"><CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />Thank you — your inquiry has been sent. We’ll reply to the email you provided.</p> : null}
          {status === 'error' ? <p role="alert" className="mt-6 rounded-xl bg-[#fbe4e1] px-4 py-3 text-sm text-[#b23b2e]">{error}</p> : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block"><span className={labelClass}>Full name *</span><input name="name" value={form.name} onChange={update} required minLength={2} autoComplete="name" placeholder="Your full name" className={inputClass} /></label>
              <label className="block"><span className={labelClass}>Email address *</span><input type="email" name="email" value={form.email} onChange={update} required autoComplete="email" placeholder="you@example.com" className={inputClass} /></label>
            </div>
            <label className="block"><span className={labelClass}>Phone number (optional)</span><input type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" placeholder="Include your country code" className={inputClass} /></label>

            <fieldset>
              <legend className={labelClass}>Inquiry type *</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {INQUIRY_TYPES.map((type, index) => {
                  const selected = inquiryType === type;
                  return (
                    <label key={type} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-[13px] font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#cc7654] ${selected ? 'border-[#cc7654] bg-[#fbe9e1]' : 'border-[#e6e1d8] bg-[#f7f5f1] hover:border-[#d9cfc3]'} ${index === INQUIRY_TYPES.length - 1 ? 'sm:col-span-2' : ''}`}>
                      <input type="radio" name="inquiryType" value={type} checked={selected} onChange={() => setInquiryType(type)} className="sr-only" />
                      <span aria-hidden="true" className={`grid size-4 shrink-0 place-items-center rounded-full border ${selected ? 'border-[#cc7654]' : 'border-[#b6b0a7]'}`}>{selected ? <span className="size-2 rounded-full bg-[#cc7654]" /> : null}</span>
                      {type}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block">
              <span className={labelClass}>Property reference (optional)</span>
              <input name="propertyReference" value={form.propertyReference} onChange={update} placeholder="Property name, listing ID or link" aria-describedby="reference-hint" className={inputClass} />
              <span id="reference-hint" className="mt-1.5 block text-xs text-[#9a958e]">Interested in a specific listing? Copy its name or link from the property details page.</span>
            </label>
            <label className="block"><span className={labelClass}>Message *</span><textarea name="message" value={form.message} onChange={update} required minLength={10} maxLength={5000} placeholder="Tell us about your preferred location, budget, property requirements or the support you need." className={`${inputClass} h-auto min-h-[120px] resize-y py-3`} /></label>

            <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#6b665f]">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5 size-4 shrink-0 accent-[#cc7654]" />
              <span>I agree that Sunrise may use these details to respond to my inquiry. *</span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <button type="submit" disabled={status === 'sending'} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#cc7654] px-6 text-sm font-semibold text-white transition hover:bg-[#b66545] disabled:opacity-60">{status === 'sending' ? 'Sending…' : <>Send Inquiry<ArrowRight aria-hidden="true" className="h-4 w-4" /></>}</button>
              <p className="text-xs text-[#9a958e]">Please don’t share passwords or payment details.</p>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[26px] bg-[#e8e4db] p-6 sm:p-7">
            <MessagesSquare aria-hidden="true" className="h-6 w-6 text-[#cc7654]" />
            <h2 className="mt-5 text-[22px] font-bold leading-tight">A little context.<br />A better conversation.</h2>
            <p className="mt-4 text-sm text-[#6b665f]">For property inquiries, it helps to include:</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {['The property name, listing ID or link', 'Your preferred location and property type', 'Your budget range and intended use', 'Any questions about details or availability'].map((tip) => <li key={tip} className="flex gap-2.5"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#cc7654]" />{tip}</li>)}
            </ul>
            <div className="mt-5"><TextLink href="/properties">Explore Properties</TextLink></div>
          </div>

          <div className="rounded-[26px] bg-[#2a2723] p-6 text-white sm:p-7">
            <Bookmark aria-hidden="true" className="h-5 w-5 text-[#cc7654]" />
            <h2 className="mt-5 text-[22px] font-bold leading-tight">Questions about<br />a reservation?</h2>
            <p className="mt-3 text-sm leading-6 text-[#e8e4db]">Open <Link href="/account/reservations" className="underline underline-offset-2 hover:text-white">Reserved Properties</Link> in your account to review your reservation. Include the property reference and explain what you need help with in this form.</p>
            <p className="mt-4 border-t border-white/15 pt-4 text-xs leading-5 text-[#cfc9bf]">A reservation is an expression of interest, not a completed purchase or a purchase guarantee. Confirm availability and final terms with the relevant owner or agent.</p>
          </div>

          <div className="px-1">
            <h2 className="font-semibold">Inquiring about a marketplace listing?</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b665f]">Review the owner or agent information on the listing for property-specific context, and include the listing reference in your message.</p>
          </div>
        </aside>
      </div>

      <section className="mt-16" aria-labelledby="contact-faq">
        <p className="text-sm font-bold tracking-[0.01em] text-[#cc7654]">BEFORE YOU SEND</p>
        <h2 id="contact-faq" className="mt-1.5 text-3xl font-bold tracking-[0.01em] sm:text-4xl">A few helpful answers.</h2>
        <dl className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-t border-[#e6e1d8] py-6">
              <dt className="text-lg font-semibold">{faq.q}</dt>
              <dd className="mt-2.5 text-sm leading-6 text-[#6b665f]">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 rounded-[40px] bg-[#e8e4db] p-7 sm:p-10" aria-labelledby="contact-start">
        <h2 id="contact-start" className="text-[28px] font-bold tracking-[0.01em]">You can also start right here.</h2>
        <p className="mt-2 text-sm text-[#6b665f]">Explore the site while you consider your next step.</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div><h3 className="text-lg font-semibold">Find a property</h3><p className="mt-2 text-sm leading-6 text-[#6b665f]">Search and filter the Sunrise collection and marketplace.</p><div className="mt-3"><TextLink href="/properties">Explore Properties</TextLink></div></div>
          <div><h3 className="text-lg font-semibold">Share your property</h3><p className="mt-2 text-sm leading-6 text-[#6b665f]">Start a marketplace listing for a property you own.</p><div className="mt-3"><TextLink href="/marketplace?list=1">List Properties</TextLink></div></div>
          <div><h3 className="text-lg font-semibold">Review your interest</h3><p className="mt-2 text-sm leading-6 text-[#6b665f]">Sign in to view and track your reserved properties.</p><div className="mt-3"><TextLink href="/account/reservations">Reserved Properties</TextLink></div></div>
        </div>
      </section>
    </div>
  );
}
