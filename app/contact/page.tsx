'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Mail, MapPin } from 'lucide-react';

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
        throw new Error(payload?.message || 'Unable to send your message. Please try again.');
      }

      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Unable to send your message. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-tight text-stone-900">
            Get in touch
          </h1>
          <p className="text-[0.9rem] font-light text-stone-500">
            Have a question about property buying, selling, renting, or investment in Nepal? Send us a message.
          </p>
        </div>

        <div className="mb-12 flex flex-col items-center gap-3 text-[0.85rem] text-stone-600 sm:flex-row sm:justify-center sm:gap-6">
          <a
            href="mailto:info@sunrisembh.com"
            className="flex items-center gap-2 transition hover:text-[#B89B4E]"
          >
            <Mail className="h-4 w-4 text-[#B89B4E]" />
            info@sunrisembh.com
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#B89B4E]" />
            Kathmandu, Nepal
          </span>
        </div>

        {status === 'sent' ? (
          <div className="mb-6 flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-5 py-4 text-[0.85rem] text-stone-600">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#B89B4E]" />
            Thank you - we&apos;ll be in touch shortly.
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-[0.85rem] text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#B89B4E] focus:bg-white"
          />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#B89B4E] focus:bg-white"
          />
          <textarea
            name="message"
            placeholder="How can we help?"
            value={formData.message}
            onChange={handleChange}
            required
            className="min-h-[120px] w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#B89B4E] focus:bg-white"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-md bg-stone-900 py-3.5 text-[0.8rem] font-medium uppercase tracking-[0.15em] text-stone-100 transition-colors hover:bg-[#B89B4E]"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </main>
  );
}
