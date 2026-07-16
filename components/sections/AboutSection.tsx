"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: "18+", label: "Years in Market" },
  { value: "3,400", label: "Properties Sold" },
  { value: "97%", label: "Client Satisfaction" },
  { value: "42", label: "Cities Covered" },
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

  const reveal = visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"

  return (
    <section ref={sectionRef} className="overflow-hidden bg-white py-24 text-stone-800 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className={`grid gap-10 transition-all duration-700 lg:grid-cols-2 lg:items-end ${reveal}`}>
          <div>
            <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-stone-500">
              Est. 2006 · Real Estate
            </p>
            <h2 className="font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
              Where fine homes<br />
              <em className="italic text-stone-600">find the right hands.</em>
            </h2>
          </div>

          <div>
            <p className="mb-8 text-base leading-8 text-stone-600">
              We are a boutique real estate firm built on discretion, expertise, and an
              unwavering belief that the right home changes everything. For nearly two decades,
              we have guided buyers and sellers through some of the most significant decisions
              of their lives — quietly, and with care.
            </p>
            <button className="inline-flex items-center gap-3 border-b border-stone-900 pb-1 text-[0.8rem] uppercase tracking-[0.14em] text-stone-900 transition hover:gap-4 hover:text-stone-600">
              Our story
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M1 5h14M10 1l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`mt-16 h-px bg-gradient-to-r from-stone-300 to-transparent transition-all duration-700 ${visible ? "scale-x-100 opacity-100" : "scale-x-40 opacity-0"} origin-left`} />

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`border-stone-200 transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} ${index < stats.length - 1 ? "md:border-r md:pr-6" : ""}`}
              style={{ transitionDelay: visible ? `${0.1 + index * 0.08}s` : "0s" }}
            >
              <div className="font-serif text-3xl text-stone-900 sm:text-4xl">{stat.value}</div>
              <div className="mt-2 text-[0.72rem] uppercase tracking-[0.15em] text-stone-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-3 lg:grid-cols-3">
          {values.map((value, index) => (
            <div
              key={value.heading}
              className={`border border-stone-200 bg-stone-50 p-8 transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: visible ? `${0.35 + index * 0.12}s` : "0s" }}
            >
              <div className="mb-5 font-serif text-sm italic text-stone-400">0{index + 1}</div>
              <h3 className="mb-3 font-serif text-2xl text-stone-900">{value.heading}</h3>
              <p className="text-sm leading-7 text-stone-600">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}