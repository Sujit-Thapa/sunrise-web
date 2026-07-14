'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';

const socials = [
  { name: 'Google', icon: FcGoogle },
  { name: 'Apple', icon: FaApple },
  { name: 'Facebook', icon: FaFacebook },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup attempt:', { name, email, password });
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

          <h1 className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">Create account</h1>
          <p className="text-slate-500 text-sm mb-8">Start your home search today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <User className="h-4 w-4 text-slate-500" /> Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#B89B4E] focus:ring-2 focus:ring-[#B89B4E]/15"
                required
              />
            </div>

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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                <Lock className="h-4 w-4 text-slate-500" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
              Create account <ArrowRight className="h-5 w-5" />
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
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#B89B4E] hover:text-[#9c8342]">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            By creating an account, I accept the{' '}
            <Link href="#" className="text-[#B89B4E] hover:underline">terms of use</Link>
          </p>
        </div>
      </div>

      {/* Right - Image panel */}
      <div className="hidden lg:block relative p-6">
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#B89B4E] to-[#8a723a] shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-[#B89B4E]/10" />

          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <div>
              <h2 className="text-3xl font-semibold text-white mb-3 tracking-tight">Join Us Today</h2>
              <p className="text-white/80 max-w-md">
                Save homes, track price changes, and get matched with listings picked for you.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5">
              <p className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">Free to join</p>
              <p className="text-white text-sm leading-relaxed">
                Create an account in seconds and start browsing homes right away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}