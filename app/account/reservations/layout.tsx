import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Reserved Properties' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
