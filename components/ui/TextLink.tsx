import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

// Orange text link with a trailing arrow, used on the marketing pages.
export default function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#cc7654] hover:underline">{children}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>;
}
