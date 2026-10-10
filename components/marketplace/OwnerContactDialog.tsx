'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Check, Headset, Mail, Phone, ShieldCheck, X } from 'lucide-react';
import type { UserPropertyResponseDto } from '@/types';

export default function OwnerContactDialog({ listing, onClose }: { listing: UserPropertyResponseDto; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, []);
  const owner = listing.submittedBy;
  const initials = owner.fullName.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('');
  const subject = encodeURIComponent(`Enquiry about ${listing.title}`);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="owner-contact-title" className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-32px)] max-w-[978px] overflow-y-auto rounded-[24px] bg-white p-6 text-[#2a2723] shadow-[0_16px_20px_rgba(0,0,0,0.15)] backdrop:bg-black/40 backdrop:backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between gap-4"><h2 id="owner-contact-title" className="text-xl font-bold text-[#1a1a1f]">Property Owner Contact</h2><button type="button" onClick={onClose} aria-label="Close owner contact" className="rounded-full p-1.5 text-[#737380] hover:bg-stone-100"><X aria-hidden="true" size={20} /></button></div>
      <div className="mt-7 flex flex-col gap-[13px] sm:flex-row sm:items-start">
        <span aria-hidden="true" className="flex size-28 shrink-0 items-center justify-center rounded-full bg-[#e8e4db] text-4xl font-bold uppercase text-[#3e4a3d] sm:size-[159px] sm:text-5xl">{initials}</span>
        <div className="min-w-0 sm:pt-1"><h3 className="break-words text-3xl font-bold sm:text-[40px]">{owner.fullName}</h3><p className="mt-2 text-base leading-[25px] text-[#595450] sm:text-lg">Listed by a member of the Sunrise marketplace.<br />You can directly connect with them using the details below.</p></div>
      </div>
      <dl className="mt-7 space-y-4 text-sm">
        {owner.phoneNumber ? <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[194px_minmax(0,1fr)]"><dt className="flex items-center gap-4 font-semibold text-[#737380]"><Phone aria-hidden="true" size={18} fill="currentColor" strokeWidth={0} />Phone</dt><dd className="text-[#1a1a1f]"><a className="break-words hover:text-[#cc7654]" href={`tel:${owner.phoneNumber.replace(/[^+\d]/g, '')}`}>{owner.phoneNumber}</a></dd></div> : null}
        {owner.email ? <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[194px_minmax(0,1fr)]"><dt className="flex items-center gap-4 font-semibold text-[#737380]"><Mail aria-hidden="true" size={18} />Email</dt><dd className="text-[#1a1a1f]"><a className="break-all hover:text-[#cc7654]" href={`mailto:${owner.email}?subject=${subject}`}>{owner.email}</a></dd></div> : null}
        {!owner.phoneNumber && !owner.email ? <p className="text-[#737380]">Contact details are not available for this listing.</p> : null}
      </dl>
      <div className="mt-7 grid gap-6 rounded-[15px] bg-[#f7f5f1] px-6 py-7 sm:px-[30px] sm:py-[31px] md:grid-cols-[minmax(0,1fr)_220px]">
        <section className="flex gap-[15px]">
          <ShieldCheck aria-hidden="true" size={45} className="hidden shrink-0 fill-[#cc7654] text-white sm:block" />
          <div><h3 className="text-[22px] font-bold text-black">Before you contact the owner</h3><ul className="mt-3.5 space-y-3.5 text-base leading-[25px] text-black sm:text-lg">{['Please mention the property you’re enquiring about when contacting the owner.', 'Do not share sensitive personal or financial information unless necessary.', 'Never send money or make a payment before independently verifying the property and ownership details.', 'Any transaction is between you and the property owner, and should follow applicable laws and proper documentation.'].map(tip => <li key={tip} className="flex gap-5"><Check aria-hidden="true" size={24} className="shrink-0 text-[#cc7654]" /><span>{tip}</span></li>)}</ul></div>
        </section>
        <section className="md:border-l md:border-[#d9d3c9] md:pl-6"><h3 className="flex items-center gap-2 text-lg font-bold"><Headset aria-hidden="true" size={22} className="text-[#cc7654]" />Need Help?</h3><p className="mt-3 text-sm leading-5 text-[#595450]">Contact our support team if you notice suspicious activity or have concerns about this listing.</p><Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f4ded4] px-4 py-2 text-sm font-semibold text-[#cc7654] hover:bg-[#efcfc1]"><Mail aria-hidden="true" size={16} />Contact Support</Link></section>
      </div>
    </dialog>
  );
}
