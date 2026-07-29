'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Menu, Shield, UserCircle2, X } from 'lucide-react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';

const NAV_LINKS = [
  { label: 'Properties', href: '/properties' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Booking', href: '/booking' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = () => {
    setIsOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    signOut();
    setAccountOpen(false);
    setIsOpen(false);
    router.push('/');
  };

  const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const initials = user
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'U';

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/15 bg-white/10 backdrop-blur-xl backdrop-saturate-200 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-transparent" />
        <div className="pointer-events-none absolute -top-1/2 -left-1/4 h-[200%] w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex h-16 items-center justify-between sm:h-20">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="relative h-12 w-32 sm:h-14 sm:w-36">
                <Image
                  src="/images/logo/sunrise2.png"
                  alt="Sunrise Realestate"
                  fill
                  sizes="(min-width: 640px) 144px, 128px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
              <ul className="flex items-center gap-8">
                {NAV_LINKS.map((link) => {
                  const isActive = isActiveLink(link.href);

                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`group relative text-sm font-medium transition-colors ${
                          isActive ? 'text-midnight' : 'text-slate-700 hover:text-midnight'
                        }`}
                      >
                        {link.label}
                        <span
                          className={`absolute -bottom-1 left-0 h-0.5 bg-gold-primary transition-all duration-300 ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {loading ? (
                <div className="h-10 w-28 animate-pulse rounded-full bg-stone-100" />
              ) : user ? (
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-full border border-white/25 bg-white/30 px-3 py-2 text-left text-midnight shadow-sm backdrop-blur-md transition hover:border-white/40 hover:bg-white/40"
                    aria-expanded={accountOpen}
                    aria-label="Open account menu"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                      {initials}
                    </span>
                    <span className="hidden flex-col leading-tight sm:flex">
                      <span className="text-sm font-semibold text-midnight">{user.fullName}</span>
                      <span className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-600">
                        {user.role}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-600 transition-transform ${
                        accountOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {accountOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-64 overflow-hidden rounded-[24px] border border-white/20 bg-white/90 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                      <div className="px-3 py-3">
                        <p className="text-sm font-semibold text-midnight">{user.fullName}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-stone-100" />
                      <Link
                        href="/profile"
                        onClick={handleNavClick}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-stone-50 hover:text-midnight"
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </Link>
                      {(user.role === 'admin' || user.role === 'agent') ? (
                        <Link
                          href="/admin"
                          onClick={handleNavClick}
                          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-stone-50 hover:text-midnight"
                        >
                          <Shield className="h-4 w-4" />
                          Admin
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/20"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>
      </nav>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-white/20 pt-16 backdrop-blur-xl lg:hidden">
          <div className="relative flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <ul className="divide-y divide-white/15 rounded-[28px] border border-white/20 bg-white/70 shadow-sm backdrop-blur-xl">
                {NAV_LINKS.map((link) => {
                  const isActive = isActiveLink(link.href);

                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={handleNavClick}
                        className={`block px-5 py-4 text-base font-medium ${
                          isActive
                            ? 'bg-white/60 text-midnight'
                            : 'text-slate-700 hover:bg-white/40 hover:text-midnight'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-white/15 p-4 sm:p-6">
              {loading ? (
                <div className="h-12 rounded-full bg-white/20" />
              ) : user ? (
                <div className="space-y-3">
                  <div className="rounded-[24px] border border-white/20 bg-white/70 p-4 backdrop-blur-xl">
                    <p className="text-sm font-semibold text-midnight">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
                      {user.role}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Link
                      href="/profile"
                      onClick={handleNavClick}
                      className="rounded-full border border-white/20 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                    >
                      Profile
                    </Link>
                    {(user.role === 'admin' || user.role === 'agent') ? (
                      <Link
                        href="/admin"
                        onClick={handleNavClick}
                        className="rounded-full border border-white/20 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                      >
                        Admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Link
                    href="/auth/login"
                    onClick={handleNavClick}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/20"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
