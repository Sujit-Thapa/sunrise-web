"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: "18+", label: "Years in Market" },
  { value: "3,400", label: "Properties Sold" },
  { value: "97%", label: "Client Satisfaction" },
  { value: "42", label: "Cities Covered" },
]

const values = [
  {
    heading: "Precision",
    body: "Every listing is curated with obsessive attention to detail — from valuation to staging.",
  },
  {
    heading: "Transparency",
    body: "We believe in clear pricing, honest timelines, and no surprises at closing.",
  },
  {
    heading: "Legacy",
    body: "We think beyond the transaction. Our goal is to place you somewhere you'll stay.",
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
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        {/* Intro */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-primary">
              Est. 2006 · Real Estate
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-midnight sm:text-5xl">
              Where fine homes<br />
              <span className="text-slate-500">find the right hands.</span>
            </h2>
          </div>

          <div>
            <p className="mb-8 text-base leading-8 text-slate-500">
              We are a boutique real estate firm built on discretion, expertise, and an
              unwavering belief that the right home changes everything. For nearly two decades,
              we have guided buyers and sellers through some of the most significant decisions
              of their lives — quietly, and with care.
            </p>
            <button className="inline-flex items-center gap-3 border-b border-midnight pb-1 text-[0.8rem] uppercase tracking-[0.14em] text-midnight transition hover:gap-4 hover:text-gold-primary">
              Our story
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5h14M10 1l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-16 h-px bg-stone-200" />

        {/* Stats */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`border-stone-200 ${index < stats.length - 1 ? "md:border-r md:pr-6" : ""}`}
            >
              <div className="text-3xl font-semibold text-midnight sm:text-4xl">{stat.value}</div>
              <div className="mt-2 text-[0.72rem] uppercase tracking-[0.15em] text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mt-16 grid gap-3 lg:grid-cols-3">
          {values.map((value, index) => (
            <div key={value.heading} className="border border-stone-200 bg-stone-50 p-8">
              <div className="mb-5 text-sm font-semibold text-gold-primary">0{index + 1}</div>
              <h3 className="mb-3 text-2xl font-semibold text-midnight">{value.heading}</h3>
              <p className="text-sm leading-7 text-slate-500">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
