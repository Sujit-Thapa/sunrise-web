'use client';

import { useState, type FormEvent } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

import AuthShell from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      description="Enter your email address and we’ll send a reset link if the account exists."
      footerText="Remembered your password?"
      footerHref="/auth/login"
      footerLinkLabel="Sign in"
    >
      {status === 'sent' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          If an account with that email exists, a password reset link has been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block" htmlFor="email">
            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Email address
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-midnight px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{status === 'sending' ? 'Sending…' : 'Send reset link'}</span>
            {status !== 'sending' ? <ArrowRight className="h-4 w-4" /> : null}
          </button>

          {status === 'error' ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Failed to send. Please try again.
            </div>
          ) : null}
        </form>
      )}
    </AuthShell>
  );
}
