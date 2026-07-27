import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import SiteShell from '@/components/layout/SiteShell';

const radikal = localFont({
  src: [
    { path: '../public/fonts/Radikal Light.otf', weight: '300', style: 'normal' },
    { path: '../public/fonts/Radikal Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Radikal Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-radikal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sunrise Realty - Find Your Dream Home',
  description: 'Discover the perfect property with Sunrise Realty',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={radikal.variable}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#fcfaf6] text-stone-900">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
