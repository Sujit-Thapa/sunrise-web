import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

// Full-page frame used when an /auth/* URL is opened directly (the pop-up uses AuthModal).
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="fixed inset-0 z-[60] flex flex-col items-center overflow-y-auto bg-[#f7f5f1] px-4 py-10 sm:justify-center">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#6b665f] hover:text-[#2a2723]"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to Sunrise</Link>
        <div className="rounded-[28px] bg-white p-7 shadow-[0_24px_60px_rgba(42,39,35,0.08)] sm:p-9">{children}</div>
      </div>
    </main>
  );
}
