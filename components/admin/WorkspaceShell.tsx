'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Bell, ChevronDown, Search } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export default function WorkspaceShell({ title, active, items, onSelect, children }: {
  title: string;
  active: string;
  items: Array<{ value: string; label: string; icon?: ComponentType<{ className?: string }> }>;
  onSelect: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="staff-workspace min-h-screen bg-[#1f1f1f] text-[#2a2927] lg:flex">
      <aside className="bg-[#202020] px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:w-[236px] lg:px-6 lg:py-7">
        <Link href="/" className="flex items-center gap-3 px-2"><Image src="/images/logo/sunrise1.png" alt="Sunrise" width={32} height={32} className="h-8 w-8 object-contain" /><span><strong className="block text-sm tracking-wide">SUNRISE</strong><span className="block text-[7px] uppercase tracking-[0.12em] text-stone-400">Operations</span></span></Link>
        <p className="mt-9 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">Manage</p>
        <nav aria-label={`${title} navigation`} className="mt-2 flex gap-1 overflow-x-auto lg:flex-col">
          {items.map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-current={active === value ? 'page' : undefined} onClick={() => onSelect(value)} className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition lg:w-full ${active === value ? 'bg-[#cd7654] text-white shadow-sm' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}>{Icon ? <Icon className="h-3.5 w-3.5" /> : null}{label}</button>)}
        </nav>
        <div className="mt-7 hidden border-t border-white/10 pt-5 lg:block"><Link href="/properties" className="flex items-center justify-between px-2 text-xs text-stone-400 transition hover:text-white">View website <ArrowUpRight className="h-3.5 w-3.5" /></Link><Link href="/profile" className="mt-4 block px-2 text-xs text-stone-400 transition hover:text-white">My account</Link></div>
      </aside>
      <div className="min-w-0 flex-1 bg-[#f8f7f4] lg:ml-[236px]">
        <header className="flex h-[72px] items-center justify-end gap-3 border-b border-stone-200 bg-white px-5 sm:px-8">
          <label className="hidden h-9 w-[250px] items-center gap-2 rounded-lg bg-[#f8f7f4] px-3 text-stone-400 md:flex"><Search className="h-3.5 w-3.5" /><input className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-stone-400" placeholder="Search property, user, payment…" /></label>
          <Link href="/properties" className="hidden rounded-lg border border-stone-200 px-3 py-2 text-[10px] font-semibold text-stone-600 transition hover:border-[#cd7654] sm:inline-flex">View public site</Link>
          <button type="button" aria-label="Notifications" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><Bell className="h-4 w-4" /></button>
          <Link href="/profile" className="flex items-center gap-2 rounded-lg border border-stone-100 px-2 py-1.5 text-left"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#2d2a26] text-[9px] font-bold text-white">AD</span><span className="hidden sm:block"><strong className="block text-[10px]">Admin</strong><span className="block text-[8px] text-stone-400">Administrator</span></span><ChevronDown className="h-3 w-3 text-stone-400" /></Link>
        </header>
        <main className="mx-auto max-w-[1260px] px-4 py-6 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
