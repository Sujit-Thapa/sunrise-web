'use client';

import { usePagePath } from '@/components/layout/usePagePath';
import { AuthSessionProvider, useAuthSession } from '@/components/auth/AuthSessionProvider';
import Navbar from '@/components/layout/Navbar';
import StaffSiteBar from '@/components/layout/StaffSiteBar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/layout/BackToTop';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <SiteChrome>{children}</SiteChrome>
    </AuthSessionProvider>
  );
}

function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePagePath();
  const { user } = useAuthSession();
  const hideLayout = pathname === '/admin' || pathname === '/agent';
  const isHome = pathname === '/';
  const isProperties = pathname === '/properties';
  const hideFooter = isProperties || pathname === '/profile';
  const staffDashboard = user?.role === 'ADMIN' ? { href: '/admin', label: 'Admin dashboard' } : user?.role === 'AGENT' ? { href: '/agent', label: 'Agent dashboard' } : null;
  // --site-header is the height pages reserve for the top bar: the public navbar (96px / 124px)
  // or, for staff previewing the site, the same 84px bar as their dashboard.
  const headerVar = staffDashboard ? '[--site-header:84px]' : '[--site-header:96px] sm:[--site-header:124px]';
  const contentOffset = hideLayout || isHome || isProperties ? '' : 'pt-[var(--site-header)]';

  return (
    <div className={`contents ${headerVar}`}>
      {hideLayout ? null : staffDashboard ? <StaffSiteBar pathname={pathname} dashboardHref={staffDashboard.href} dashboardLabel={staffDashboard.label} /> : <Navbar />}
      <main className={`flex-1 bg-[#f7f5f1] ${contentOffset}`}>{children}</main>
      {!hideLayout && !hideFooter && <Footer />}
      {!hideLayout && <BackToTop />}
    </div>
  );
}
