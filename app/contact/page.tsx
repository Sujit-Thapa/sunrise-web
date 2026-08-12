'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { FiMail as Mail, FiMapPin as MapPin, FiPhone as Phone, FiSend as Send } from 'react-icons/fi';

type ContactState = {
  name: string;
  email: string;
  message: string;
};

type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
  const [formData, setFormData] = useState<ContactState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to send your message.');
      }

      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send your message.');
    }
  };

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-brand-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-midnight">
            Let&apos;s talk about your next home.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
            Send us a question, a budget, or a neighborhood you&apos;re watching. Your message will
            arrive in our inbox at <span className="font-medium text-midnight">sunrisembh@gmail.com</span>.
          </p>

          <div className="mt-8 space-y-3 text-sm text-slate-600">
            <a
              href="mailto:sunrisembh@gmail.com"
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 transition hover:border-stone-300 hover:bg-white"
            >
              <Mail className="h-4 w-4 text-gold-primary" />
              sunrisembh@gmail.com
            </a>
            <a
              href="tel:5551234567"
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 transition hover:border-stone-300 hover:bg-white"
            >
              <Phone className="h-4 w-4 text-gold-primary" />
              (555) 123-4567
            </a>
            <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <MapPin className="mt-0.5 h-4 w-4 text-gold-primary" />
              <span>84 Meridian Ave, Suite 200</span>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-midnight outline-none transition placeholder:text-slate-400 focus:border-stone-300 focus:bg-white"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm text-midnight outline-none transition placeholder:text-slate-400 focus:border-stone-300 focus:bg-white"
                />
              </Field>
            </div>

            <Field label="Message">
              <textarea
                name="message"
                placeholder="How can we help?"
                value={formData.message}
                onChange={handleChange}
                required
                className="min-h-[180px] w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-midnight outline-none transition placeholder:text-slate-400 focus:border-stone-300 focus:bg-white"
              />
            </Field>

            {status === 'sent' ? (
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                Thanks. Your message was sent successfully.
              </div>
            ) : null}

            {status === 'error' && errorMessage ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-midnight px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'sending' ? 'Sending...' : 'Send message'}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
