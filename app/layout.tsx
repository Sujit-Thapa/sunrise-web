import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import SiteShell from '@/components/layout/SiteShell';

const plusJakartaSans = localFont({
  src: [
    { path: '../public/fonts/PlusJakartaSans-Variable.ttf', weight: '200 800', style: 'normal' },
  ],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sunrise Realestate',
  description: 'Discover the perfect property with Sunrise Realestate',
  icons: {
    icon: '/images/logo/sunrise1.png',
    shortcut: '/images/logo/sunrise1.png',
    apple: '/images/logo/sunrise1.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className="min-h-full flex flex-col bg-white font-sans antialiased text-stone-900">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
