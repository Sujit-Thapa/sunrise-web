'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Search } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import StaffAccountMenu from '@/components/admin/StaffAccountMenu';

export type WorkspaceNavItem = {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: number;
};

// Staff layout from the "Sunrise operations" Figma screens: dark sidebar, white top bar, warm canvas.
export default function WorkspaceShell({ title, active, items, onSelect, children }: {
  title: string;
  active: string;
  items: WorkspaceNavItem[];
  onSelect: (value: string) => void;
  children: ReactNode;
}) {

  return (
    <div className="staff-workspace min-h-screen bg-[#f6f4f0] text-[#2a2723] lg:flex">
      <aside className="bg-[#1e1e1e] px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:w-[248px] lg:px-[18px] lg:py-[26px]">
        <Link href="/" className="flex items-center gap-3 px-1.5">
          <Image src="/images/logo/sunrise1.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
          <span><strong className="block text-base font-bold tracking-wide">SUNRISE</strong><span className="block text-[11px] uppercase text-stone-400">Operations</span></span>
        </Link>
        <p className="mt-9 text-[11px] font-medium uppercase text-stone-400">Manage</p>
        <nav aria-label={`${title} navigation`} className="mt-2 flex gap-1 overflow-x-auto lg:flex-col lg:gap-1.5">
          {items.map(({ value, label, icon: Icon, badge }) => {
            const selected = active === value;
            return (
              <button key={value} type="button" aria-current={selected ? 'page' : undefined} onClick={() => onSelect(value)} className={`flex min-w-max items-center gap-3 rounded-[10px] px-3 py-3 text-left text-[13px] font-medium transition lg:w-full ${selected ? 'bg-[#cc7654] text-white shadow-sm' : 'text-stone-300 hover:bg-white/5 hover:text-white'}`}>
                {Icon ? <Icon className="h-[18px] w-[18px] shrink-0" /> : null}
                <span className="flex-1 leading-tight">{label}</span>
                {badge ? <span className={`grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[10px] font-bold text-white ${selected ? 'bg-[#a8583a]' : 'bg-[#cc7654]'}`}>{badge}</span> : null}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-[248px]">
        <header className="flex h-[84px] items-center justify-end gap-3 border-b border-[#ebe7e0] bg-white px-5 sm:px-8">
          <label className="hidden h-[50px] w-[250px] items-center gap-2.5 rounded-full bg-[#f4f1ec] px-4 text-stone-500 md:flex">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
            <input aria-label="Search the workspace" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-stone-400" placeholder="Search property, user, payment…" />
          </label>
          <Link href="/" className="hidden h-[34px] items-center gap-2 rounded-full border border-[#e3ded6] px-3.5 text-[13px] font-medium text-[#2a2723] transition hover:border-[#cc7654] sm:inline-flex"><ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />View public site</Link>
          <StaffAccountMenu />
        </header>
        <main className="mx-auto max-w-[1352px] px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
