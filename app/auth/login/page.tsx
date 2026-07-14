'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';

const socials = [
  { name: 'Google', icon: FcGoogle },
  { name: 'Apple', icon: FaApple },
  { name: 'Facebook', icon: FaFacebook },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F7F5F0] grid lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center mb-10">
            <Image
              src="/images/logo/sunrise2.png"
              alt="Sunrise Realty"
              width={1300}
              height={40}
              className="h-30 w-auto object-contain"
              priority
            />
          </Link>

          <h1 className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Welcome back to find your next home</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Mail className="h-4 w-4 text-slate-500" /> Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#B89B4E] focus:ring-2 focus:ring-[#B89B4E]/15"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock className="h-4 w-4 text-slate-500" /> Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-[#B89B4E] hover:text-[#9c8342]">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#B89B4E] focus:ring-2 focus:ring-[#B89B4E]/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#B89B4E] px-6 py-2.5 font-semibold text-white transition hover:bg-[#a3894a] active:scale-95 shadow-sm shadow-[#B89B4E]/30"
            >
              Sign in <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs font-medium text-slate-400">OR</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="space-y-2.5">
            {socials.map((s) => (
              <button
                key={s.name}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                <s.icon className="h-5 w-5" />
                Continue with {s.name}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            New here?{' '}
            <Link href="/auth/signup" className="font-semibold text-[#B89B4E] hover:text-[#9c8342]">
              Create account
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            By signing in, I accept the{' '}
            <Link href="#" className="text-[#B89B4E] hover:underline">terms of use</Link>
          </p>
        </div>
      </div>

      {/* Right - Image panel */}
      <div className="hidden lg:block relative p-6">
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#B89B4E] to-[#8a723a] shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-[#B89B4E]/10" />

          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <div>
              <h2 className="text-3xl font-semibold text-white mb-3 tracking-tight">Find Your Dream Home</h2>
              <p className="text-white/80 max-w-md">
                Explore millions of homes, get real-time updates, and connect with trusted real estate professionals.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5">
              <p className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">Why choose us</p>
              <p className="text-white text-sm leading-relaxed">
                Transparent pricing, detailed market insights, and a team that puts your needs first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}