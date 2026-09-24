'use client';

import { usePathname } from 'next/navigation';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname?.startsWith('/auth/') || pathname === '/admin' || pathname === '/agent';
  const isHome = pathname === '/';
  const isProperties = pathname === '/properties';
  const contentOffset = hideLayout || isHome || isProperties ? '' : 'pt-24 sm:pt-[124px]';

  return (
    <AuthSessionProvider>
      {!hideLayout && <Navbar />}
      <main className={`flex-1 bg-[#f8f6f1] ${contentOffset}`}>{children}</main>
      {!hideLayout && <Footer />}
    </AuthSessionProvider>
  );
}
