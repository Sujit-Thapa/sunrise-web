import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  children: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  footerText,
  footerHref,
  footerLinkLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-8">
          <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/images/logo/sunrise2.png"
              alt="Sunrise Realestate"
              width={160}
              height={65}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          <div className="mt-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>

          <div className="mt-6">{children}</div>

          <p className="mt-6 text-sm text-slate-500">
            {footerText}{' '}
            <Link href={footerHref} className="font-semibold text-midnight transition-colors hover:text-gold-primary">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
