'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePagePath } from '@/components/layout/usePagePath';
import { Menu, X } from 'lucide-react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { isStaffRole, normalizeUserRole } from '@/lib/auth-routing';

const PUBLIC_NAV_LINKS = [
  { label: 'Explore', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrator', AGENT: 'Agent', USER: 'Customer' };

export default function Navbar() {
  const { user, loading, signOut } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePagePath();
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

  const roleDashboardHref =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : null;
  const roleDashboardLabel =
    user?.role === 'ADMIN' ? 'Admin dashboard' : user?.role === 'AGENT' ? 'Agent dashboard' : null;
  // Staff browse the same site visitors see; their dashboard is one click away on the right.
  const navLinks = PUBLIC_NAV_LINKS;

  // The properties page sits under a solid 91px white header bar in the design.
  const solidHeader = pathname === '/properties';
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
      <nav aria-label="Main navigation" className={`absolute left-0 right-0 top-0 z-50 pb-4 pt-4 sm:pt-7 ${solidHeader ? 'bg-[#f7f5f1]' : ''}`}>
        <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
          <div className="relative z-10 flex h-16 items-center justify-between sm:h-20">
            <Link href="/" aria-label="Sunrise Realestate home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <span className="flex w-28 flex-col items-center gap-1 sm:w-32">
                  <Image src="/images/logo/sunrise1.png" alt="" width={64} height={64} className="h-12 w-12 object-contain sm:h-16 sm:w-16" priority />
                  <Image src="/images/logo/sunrise.png" alt="Sunrise Realestate" width={116} height={29} className="h-6 w-24 object-contain sm:h-7 sm:w-[116px]" priority />
                </span>
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
              <ul className="absolute left-1/2 flex -translate-x-1/2 h-[38px] items-center gap-[18px] whitespace-nowrap rounded-[74px] bg-white px-[30px] shadow-sm">
                {navLinks.map((link) => {
                  const isActive = isActiveLink(link.href);

                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`group relative text-sm font-normal tracking-[0.01em] transition-colors ${
                          isActive ? 'text-[#cc7654]' : 'text-[#2a2723] hover:text-[#cc7654]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {loading ? (
                <div className="h-10 w-28 animate-pulse rounded-full bg-stone-100" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link href="/marketplace?list=1" className="rounded-[38px] bg-[#3e4a3d] px-4 py-2 text-sm font-bold tracking-[0.01em] text-white transition hover:bg-[#303c2f]">
                    List Properties
                  </Link>
                  <div ref={accountRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountOpen((prev) => !prev)}
                      className="grid size-10 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#2a2723] text-xs font-bold text-white shadow-[0_2px_8px_rgba(42,39,35,0.12)]"
                      aria-expanded={accountOpen}
                      aria-haspopup="menu"
                      aria-label="Open account menu"
                    >
                      {user.avatarUrl ? (
                        // A regular image keeps the avatar compatible with any configured S3 host.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : initials}
                    </button>
                    {accountOpen ? (
                      <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-[60] flex w-[170px] flex-col gap-0.5 rounded-2xl bg-white px-1.5 py-2 shadow-[0_0_25px_rgba(0,0,0,0.15)]">
                        <Link role="menuitem" href="/profile" onClick={handleNavClick} className={`rounded-lg px-2.5 py-1.5 text-sm ${pathname === '/profile' ? 'bg-[#f2f2f2] font-medium text-[#212121]' : 'text-[#333] hover:bg-[#f7f7f7]'}`}>Profile</Link>
                        <Link role="menuitem" href="/account/reservations" onClick={handleNavClick} className={`rounded-lg px-2.5 py-1.5 text-sm ${pathname === '/account/reservations' ? 'bg-[#f2f2f2] font-medium text-[#212121]' : 'text-[#333] hover:bg-[#f7f7f7]'}`}>Reserved Properties</Link>
                        <button type="button" role="menuitem" onClick={handleLogout} className="rounded-lg px-2.5 py-1.5 text-left text-sm text-[#333] hover:bg-[#f7f7f7]">Sign Out</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="rounded-[38px] bg-[#3e4a3d] px-5 py-1 text-sm font-bold tracking-[0.01em] text-white transition hover:bg-[#303c2f]"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="rounded-full bg-white/90 p-2.5 text-[#3e4a3d] shadow-sm transition hover:bg-white lg:hidden"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6 text-[#3e4a3d]" /> : <Menu className="h-6 w-6 text-[#3e4a3d]" />}
            </button>
          </div>
        </div>
      </nav>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-white/95 pt-28 sm:pt-36 backdrop-blur-xl lg:hidden">
          <div className="relative flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <ul className="divide-y divide-white/15 rounded-[28px] border border-white/20 bg-white/70 shadow-sm backdrop-blur-xl">
                {navLinks.map((link) => {
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
                    <p className="mt-2 text-xs text-slate-400">{ROLE_LABELS[user.role] ?? user.role}</p>
                  </div>
                  <div className="grid gap-2">
                    <Link
                      href="/profile"
                      onClick={handleNavClick}
                      className="rounded-full border border-white/20 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                    >
                      Profile
                    </Link>
                    {normalizeUserRole(user.role) === 'user' ? (
                      <Link href="/account/reservations" onClick={handleNavClick}
                        className="rounded-full border border-white/20 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-slate-700">
                        My reservations
                      </Link>
                    ) : null}
                    {isStaffRole(user.role) ? (
                      <Link
                        href={roleDashboardHref ?? '/'}
                        onClick={handleNavClick}
                        className="rounded-full border border-white/20 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                      >
                        {roleDashboardLabel}
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
                    className="rounded-full bg-[#3e4a3d] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#303c2f]"
                  >
                    Sign In
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
