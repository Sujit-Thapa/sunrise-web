'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname?.startsWith('/auth/');
  const isHome = pathname === '/';
  const isContact = pathname?.startsWith('/contact');
  const contentOffset = hideLayout || isHome || isContact ? '' : 'pt-16 sm:pt-20';

  return (
    <>
      {!hideLayout && <Navbar />}
      <main className={`flex-1 ${contentOffset}`}>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
