'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

// Pop-up frame for the intercepted /auth/* routes; closing returns to the page underneath.
// Next keeps a parallel-route slot's last content after navigating elsewhere, so the pop-up
// only renders while the URL is still an /auth/* address.
export default function AuthModal({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith('/auth/') ? <AuthDialog>{children}</AuthDialog> : null;
}

function AuthDialog({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); router.back(); }}
      onClick={(event) => { if (event.target === dialogRef.current) router.back(); }}
      aria-label="Account"
      className="fixed inset-0 m-auto max-h-[92svh] w-[calc(100%-32px)] max-w-[440px] overflow-y-auto rounded-[28px] bg-white p-0 text-[#2a2723] shadow-[0_24px_60px_rgba(42,39,35,0.18)] backdrop:bg-[rgba(29,27,24,0.45)] backdrop:backdrop-blur-[2px] motion-safe:animate-[auth-pop_180ms_ease-out]"
    >
      <div className="relative p-7 sm:p-9">
        <button type="button" onClick={() => router.back()} aria-label="Close" className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-[#f4f1ec] text-[#6b665f] transition hover:bg-[#ebe6de] hover:text-[#2a2723]"><X className="h-4 w-4" /></button>
        {children}
      </div>
    </dialog>
  );
}
