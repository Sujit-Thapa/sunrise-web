'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { RiMailLine, RiMapPinLine, RiArrowRightLine, RiCheckLine } from 'react-icons/ri';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(
          response.status >= 500
            ? 'We could not send your message right now. Please try again later.'
            : payload?.message || 'Please check your information and try again.',
        );
      }

      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Unable to send your message. Please try again.');
    }
  };

  return (
    <div className="bg-[#f8f6f1] px-5 py-10 text-[#2A2723] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-widest text-[#ca7653]">Let’s talk property</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Your next move.<br /><span className="text-[#ca7653]">Starts with a conversation.</span></h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-stone-500">Have a question about buying, selling, renting, or investing in Nepal? Tell us what you have in mind.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <aside className="flex flex-col rounded-[32px] bg-[#e9e6dd] p-7 sm:p-10">
            <h2 className="text-2xl font-bold">Here to help you find your way.</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">Ask about a listing, share your property goals, or speak with us about listing your own property.</p>
            <a href="mailto:info@sunrisembh.com" className="mt-8 flex items-center gap-4 rounded-2xl bg-white p-5 text-sm hover:text-[#ca7653]"><RiMailLine className="shrink-0 text-xl text-[#ca7653]" /><span><span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-400">Email us</span><span className="break-all">info@sunrisembh.com</span></span></a>
            <div className="mt-3 flex items-center gap-4 rounded-2xl bg-white p-5 text-sm"><RiMapPinLine className="shrink-0 text-xl text-[#ca7653]" /><span><span className="mb-1 block text-[10px] uppercase tracking-wider text-stone-400">Based in</span>Kathmandu, Nepal</span></div>
            <Link href="/properties" className="mt-8 inline-flex items-center gap-2 text-sm font-bold">Explore available properties <RiArrowRightLine /></Link>
          </aside>
          <section className="rounded-[32px] bg-white p-7 sm:p-10" aria-labelledby="contact-form-heading">
            <h2 id="contact-form-heading" className="text-2xl font-bold">Send us a message</h2>
            <p className="mt-2 text-sm text-stone-500">A few details will help us point you in the right direction.</p>
            {status === 'sent' ? <div role="status" className="mt-6 flex gap-2 rounded-xl bg-[#edf2eb] p-4 text-sm text-[#3E4A3D]"><RiCheckLine className="shrink-0 text-xl" />Thank you. Your message has been sent.</div> : null}
            {status === 'error' ? <div role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block text-xs font-medium">Full name<input autoComplete="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#ca7653]" /></label>
              <label className="block text-xs font-medium">Email address<input type="email" autoComplete="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#ca7653]" /></label>
              <label className="block text-xs font-medium">Your message<textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us about the property or support you’re looking for…" className="mt-2 min-h-40 w-full resize-y rounded-xl border border-stone-200 bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#ca7653]" /></label>
              <button type="submit" disabled={status === 'sending'} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#3E4A3D] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#303c2f] disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Send Message'}<RiArrowRightLine /></button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
