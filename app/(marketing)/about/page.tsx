import type { Metadata } from 'next';
import AboutSection from '@/components/sections/AboutSection';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Sunrise and our vision.',
};

export default function AboutPage() {
  return <AboutSection />;
}
