'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { RiCloseLine, RiMailLine, RiPhoneLine, RiShieldCheckLine, RiCustomerService2Line, RiCheckLine } from 'react-icons/ri';
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
    <dialog ref={ref} onCancel={onClose} aria-labelledby="owner-contact-title" className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-32px)] max-w-3xl overflow-y-auto rounded-[24px] bg-white p-6 text-[#2A2723] shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between gap-4"><h2 id="owner-contact-title" className="text-xl font-bold">Property Owner Contact</h2><button type="button" onClick={onClose} aria-label="Close owner contact" className="rounded-full p-2 text-stone-500 hover:bg-stone-100"><RiCloseLine size={24} /></button></div>
      <div className="mt-6 flex items-center gap-4"><span aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e9e6dd] text-2xl font-bold text-[#3E4A3D]">{initials}</span><div><h3 className="text-2xl font-bold">{owner.fullName}</h3><p className="mt-2 text-sm leading-6 text-stone-500">Listed by this marketplace member.<br />Connect directly using the contact details below.</p></div></div>
      <dl className="mt-6 divide-y divide-stone-100 text-sm">
        {owner.phoneNumber ? <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)]"><dt className="flex items-center gap-2 text-stone-500"><RiPhoneLine />Phone</dt><dd><a className="break-words hover:text-[#ca7653]" href={`tel:${owner.phoneNumber.replace(/[^+\d]/g, '')}`}>{owner.phoneNumber}</a></dd></div> : null}
        {owner.email ? <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)]"><dt className="flex items-center gap-2 text-stone-500"><RiMailLine />Email</dt><dd><a className="break-all hover:text-[#ca7653]" href={`mailto:${owner.email}?subject=${subject}`}>{owner.email}</a></dd></div> : null}
        {!owner.phoneNumber && !owner.email ? <p className="py-3 text-stone-500">Contact details are not available for this listing.</p> : null}
      </dl>
      <div className="mt-6 grid gap-6 rounded-2xl bg-[#f0f5fc] p-5 sm:grid-cols-[1.5fr_1fr]">
        <section><h3 className="flex items-center gap-2 text-sm font-bold"><RiShieldCheckLine className="shrink-0 text-xl text-blue-600" />Before you contact the owner</h3><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{['Mention the property you’re enquiring about.', 'Avoid sharing sensitive personal or financial information.', 'Verify the property and ownership details independently before making a payment.', 'Any transaction is between you and the property owner. Use proper documentation.'].map(tip => <li key={tip} className="flex gap-2"><RiCheckLine className="mt-1 shrink-0 text-blue-600" /><span>{tip}</span></li>)}</ul></section>
        <section className="sm:border-l sm:border-blue-100 sm:pl-5"><h3 className="flex items-center gap-2 text-sm font-bold"><RiCustomerService2Line className="text-xl text-blue-600" />Need help?</h3><p className="mt-3 text-xs leading-5 text-slate-600">Contact our team if you have concerns about this listing.</p><Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700"><RiMailLine />Contact Support</Link></section>
      </div>
    </dialog>
  );
}
