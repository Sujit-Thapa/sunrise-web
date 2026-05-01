import type { Metadata } from 'next'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/sections/AboutSection'

export const metadata: Metadata = {
  title: 'About — Sunrise Multiple Businesses & Housing',
  description: 'Learn about Sunrise and our vision.',
}

export default function AboutPage() {
  return (
    <>
      {/* <HeroSection

      /> */}
      <AboutSection />
    </>
  )
}
