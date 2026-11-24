import type { Metadata } from 'next';

export const metadata: Metadata = { title: { default: 'Marketplace', template: '%s | Sunrise Realestate' }, description: 'Discover homes, land and commercial spaces listed by owners across Nepal.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
