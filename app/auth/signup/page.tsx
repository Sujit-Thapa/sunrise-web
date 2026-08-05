'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';

import AuthShell from '@/components/auth/AuthShell';
import { getRoleHomePath } from '@/lib/auth-routing';
import { auth, setAuthToken } from '@/lib/auth';
import type { RegisterUserDto } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: RegisterUserDto = {
      fullName,
      email,
      phoneNumber,
      password,
    };

    try {
      const response = await auth.register(payload);
      setAuthToken(response.accessToken);
      const currentUser = await auth.me(response.accessToken);
      router.replace(getRoleHomePath(currentUser.role));
    } catch (err) {
      setError((err as Error).message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join Sunrise Realestate"
      description="Create your account to save properties, book viewings, and manage your search."
      footerText="Already have an account?"
      footerHref="/auth/login"
      footerLinkLabel="Sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <Field label="Full name" htmlFor="fullName">
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
            />
          </div>
        </Field>

        <Field label="Email address" htmlFor="email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
            />
          </div>
        </Field>

        <Field label="Phone number" htmlFor="phoneNumber">
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="98XXXXXXXX"
              autoComplete="tel"
              inputMode="tel"
              required
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              required
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-10 text-sm text-stone-900 outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-midnight px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{loading ? 'Creating account…' : 'Create account'}</span>
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
