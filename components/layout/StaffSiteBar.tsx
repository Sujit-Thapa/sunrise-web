'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import StaffAccountMenu from '@/components/admin/StaffAccountMenu';

const SITE_LINKS = [
  { label: 'Explore', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Shown instead of the public navbar while staff browse the site, so switching between the
// dashboard and the site keeps the same 84px white bar with the same controls on the right.
export default function StaffSiteBar({ pathname, dashboardHref, dashboardLabel }: { pathname: string; dashboardHref: string; dashboardLabel: string }) {
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-[84px] items-center gap-4 border-b border-[#ebe7e0] bg-white px-4 sm:px-8">
      <Link href={dashboardHref} className="flex shrink-0 items-center gap-3">
        <Image src="/images/logo/sunrise1.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
        <span className="hidden sm:block"><strong className="block text-base font-bold tracking-wide text-[#2a2723]">SUNRISE</strong><span className="block text-[11px] uppercase text-stone-500">Site preview</span></span>
      </Link>
      <nav aria-label="Site pages" className="mx-auto hidden lg:block">
        <ul className="flex h-[38px] items-center gap-[18px] rounded-[74px] border border-[#ebe7e0] bg-white px-[26px] text-sm">
          {SITE_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={`tracking-[0.01em] transition-colors ${isActive(link.href) ? 'font-semibold text-[#cc7654]' : 'text-[#2a2723] hover:text-[#cc7654]'}`}>{link.label}</Link></li>)}
        </ul>
      </nav>
      <div className="ml-auto flex items-center gap-3 lg:ml-0">
        <Link href={dashboardHref} className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#e3ded6] px-3.5 text-[13px] font-medium text-[#2a2723] transition hover:border-[#cc7654]"><LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" /><span className="hidden sm:inline">{dashboardLabel}</span></Link>
        <StaffAccountMenu />
      </div>
    </header>
  );
}
