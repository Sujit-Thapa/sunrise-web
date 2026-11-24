import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Talk to Sunrise about buying, selling, renting or listing property in Nepal.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
