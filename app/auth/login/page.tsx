'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebookF } from 'react-icons/fa';

import { auth, setAuthToken } from '@/lib/auth';
import type { LoginDto } from '@/types';

const socials = [
  {
    name: 'Google',
    icon: FcGoogle,
  },
  {
    name: 'Apple',
    icon: FaApple,
  },
  {
    name: 'Facebook',
    icon: FaFacebookF,
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: LoginDto = {
      email,
      password,
    };

    try {
      const response = await auth.login(payload);
      setAuthToken(response.accessToken);
      window.location.href = '/';
    } catch (err) {
      setError((err as Error).message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-white lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      {/* Left side */}
      <section className="flex h-screen items-center justify-center overflow-hidden px-5 py-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <Link
            href="/"
            className="mb-5 inline-flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/logo/sunrise2.png"
              alt="Sunrise Realestate"
              width={160}
              height={65}
              className="h-14 w-auto object-contain xl:h-16"
              priority
            />
          </Link>

          {/* Heading */}
          <div className="mb-5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B89B4E]">
              Welcome back
            </p>

            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 xl:text-3xl">
              Sign in to your account
            </h1>

            <p className="mt-1.5 text-xs leading-5 text-slate-500 xl:text-sm">
              Continue your property search and manage your saved homes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="group relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#B89B4E]" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#B89B4E] focus:ring-2 focus:ring-[#B89B4E]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-700"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-semibold text-[#B89B4E] transition-colors hover:text-[#9c8342]"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="group relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#B89B4E]" />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#B89B4E] focus:ring-2 focus:ring-[#B89B4E]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#B89B4E] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#a88d45] hover:shadow-md hover:shadow-[#B89B4E]/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{loading ? 'Signing in…' : 'Sign in'}</span>

              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Or continue with
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-3 gap-2.5">
            {socials.map((social) => {
              const Icon = social.icon;

              return (
                <button
                  key={social.name}
                  type="button"
                  aria-label={`Continue with ${social.name}`}
                  title={`Continue with ${social.name}`}
                  className="group flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                      social.name === 'Apple'
                        ? 'text-black'
                        : social.name === 'Facebook'
                          ? 'text-[#1877F2]'
                          : ''
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Signup */}
          <p className="mt-5 text-center text-xs text-slate-500">
            New to Sunrise Realestate?{' '}
            <Link
              href="/auth/signup"
              className="font-semibold text-slate-900 transition-colors hover:text-[#B89B4E]"
            >
              Create account
            </Link>
          </p>

          {/* Terms */}
          <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
            By signing in, you agree to our{' '}
            <Link
              href="#"
              className="text-slate-600 underline-offset-4 transition-colors hover:text-[#B89B4E] hover:underline"
            >
              terms of use
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Right image panel */}
      <section className="hidden h-screen overflow-hidden p-3 lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-900">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=90"
            alt="Modern luxury interior"
            fill
            sizes="55vw"
            className="object-cover"
            priority
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

          {/* Brand badge */}
          <div className="absolute left-7 top-7">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D5B967]" />

              <span className="text-[11px] font-medium text-white">
                Sunrise Realestate
              </span>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 xl:p-10">
            <div className="max-w-lg">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                Welcome back
              </p>

              <h2 className="text-3xl font-medium leading-[1.1] tracking-[-0.035em] text-white xl:text-4xl">
                Your next home could be one search away.
              </h2>

              <p className="mt-3 max-w-md text-xs leading-5 text-white/65 xl:text-sm">
                Pick up where you left off, explore new properties and stay
                connected to the homes that matter to you.
              </p>

              {/* Features */}
              <div className="mt-5 flex items-center gap-5 border-t border-white/20 pt-5">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Discover
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/50">
                    Find properties
                  </p>
                </div>

                <div className="h-7 w-px bg-white/20" />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Save
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/50">
                    Keep favorites
                  </p>
                </div>

                <div className="h-7 w-px bg-white/20" />

                <div>
                  <p className="text-sm font-semibold text-white">
                    Connect
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/50">
                    Stay updated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
