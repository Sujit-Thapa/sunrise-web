'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const services = [
  'Property buying and selling',
  'Property rental and leasing',
  'Property consultation',
  'Real estate investment support',
  'Property valuation and market analysis',
  'Property marketing',
  'Negotiation and transaction support',
  'Property management support',
]

const strengths = [
  {
    heading: 'Trust',
    body: 'Clear information, honest advice, and no hidden surprises throughout the property process.',
  },
  {
    heading: 'Local knowledge',
    body: 'A practical understanding of property locations, pricing, and market conditions in Nepal.',
  },
  {
    heading: 'Long-term support',
    body: 'Personal guidance shaped around each client\'s goals, budget, preferences, and future plans.',
  },
]

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`bg-white py-24 text-stone-800 transition-opacity duration-700 sm:py-28 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
              Est. 2066 B.S. · Kathmandu, Nepal
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-midnight sm:text-5xl">
              Finding the right land<br />
              <span className="text-slate-500">at the right price.</span>
            </h1>
          </div>

          <div>
            <p className="mb-8 text-base leading-8 text-slate-500">
              Sun Rise Multiple Business &amp; Housing is a Nepal Kathmandu-listed company
              specializing in comprehensive, full-process, and cross-regional real estate services
              in Nepal.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border-b border-midnight pb-1 text-[0.8rem] uppercase tracking-[0.14em] text-midnight transition hover:gap-4 hover:text-gold-primary"
            >
              Speak with us
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5h14M10 1l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-16 h-px bg-stone-200" />

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
              Our history
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-midnight sm:text-4xl">
              Built around informed property decisions.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-500">
            <p>
              Established in 2066 B.S. (2009/2010 A.D.), the company has focused on reliable,
              transparent, and client-oriented real estate and property-related services in Nepal.
            </p>
            <p>
              Over time, our work has grown across buying and selling, land and property
              consultation, investment support, property marketing, valuation, negotiation,
              rental and leasing, and property management support.
            </p>
            <p>
              We aim to connect clients with suitable opportunities at reasonable and mutually
              agreed prices while maintaining trust, transparency, and professionalism.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-y border-stone-200 py-8 sm:grid-cols-2">
          <div>
            <div className="text-3xl font-semibold text-midnight sm:text-4xl">2066 B.S.</div>
            <div className="mt-2 text-[0.72rem] uppercase tracking-[0.15em] text-slate-400">Established</div>
          </div>
          <div className="sm:border-l sm:border-stone-200 sm:pl-6">
            <div className="text-3xl font-semibold text-midnight sm:text-4xl">Kathmandu</div>
            <div className="mt-2 text-[0.72rem] uppercase tracking-[0.15em] text-slate-400">Serving Nepal</div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
              Services
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-midnight sm:text-4xl">
              Support for the complete real estate journey.
            </h2>
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {services.map((service, index) => (
              <div key={service} className="flex items-center gap-3 border-b border-stone-200 py-3">
                <span className="text-sm font-semibold text-gold-primary">0{index + 1}</span>
                <span className="text-sm text-slate-500">{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-3 lg:grid-cols-3">
          {strengths.map((strength, index) => (
            <div key={strength.heading} className="border border-stone-200 bg-stone-50 p-8">
              <div className="mb-5 text-sm font-semibold text-gold-primary">0{index + 1}</div>
              <h3 className="mb-3 text-2xl font-semibold text-midnight">{strength.heading}</h3>
              <p className="text-sm leading-7 text-slate-500">{strength.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
