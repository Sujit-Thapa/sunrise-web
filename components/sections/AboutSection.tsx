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
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .about-section {
          background-color: #F7F5F0;
          color: #1A1814;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          padding: 7rem 0;
          overflow: hidden;
        }

        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5rem;
        }

        /* ── Header Row ── */
        .about-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: end;
          margin-bottom: 5rem;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .about-header.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .about-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8A8070;
          margin-bottom: 1.25rem;
        }

        .about-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          line-height: 1.08;
          letter-spacing: -0.01em;
          color: #1A1814;
          margin: 0;
        }

        .about-headline em {
          font-style: italic;
          color: #5C5040;
        }

        .about-body {
          font-size: 1rem;
          line-height: 1.85;
          color: #5C5040;
          margin-bottom: 2.5rem;
        }

        .about-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A1814;
          text-decoration: none;
          border-bottom: 1px solid #1A1814;
          padding-bottom: 2px;
          transition: gap 0.3s ease, color 0.3s ease;
          cursor: pointer;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
        }
        .about-cta:hover { gap: 1.1rem; color: #5C5040; }
        .about-cta svg { transition: transform 0.3s ease; }
        .about-cta:hover svg { transform: translateX(3px); }

        /* ── Divider ── */
        .about-divider {
          height: 1px;
          background: linear-gradient(90deg, #D8D0C0 0%, transparent 100%);
          margin-bottom: 4rem;
          opacity: 0;
          transform: scaleX(0.4);
          transform-origin: left;
          transition: opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s;
        }
        .about-divider.visible {
          opacity: 1;
          transform: scaleX(1);
        }

        /* ── Stats ── */
        .about-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-bottom: 5rem;
        }

        .stat-item {
          padding: 0 2rem 0 0;
          border-right: 1px solid #D8D0C0;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .stat-item:last-child { border-right: none; padding-right: 0; padding-left: 2rem; }
        .stat-item:not(:first-child) { padding-left: 2rem; }
        .stat-item.visible { opacity: 1; transform: translateY(0); }

        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 2.8rem;
          line-height: 1;
          color: #1A1814;
          margin-bottom: 0.35rem;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8A8070;
        }

        /* ── Values ── */
        .about-values {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }

        .value-card {
          background: #EFECE5;
          padding: 2.5rem 2rem;
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.7s ease, transform 0.7s ease, background 0.3s ease;
        }
        .value-card:hover { background: #E8E3D8; }
        .value-card.visible { opacity: 1; transform: translateY(0); }

        .value-index {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.85rem;
          color: #B0A890;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .value-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 1.55rem;
          color: #1A1814;
          margin-bottom: 0.75rem;
          letter-spacing: 0.01em;
        }

        .value-body {
          font-size: 0.88rem;
          line-height: 1.75;
          color: #6E6455;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .about-header { grid-template-columns: 1fr; gap: 2rem; }
          .about-stats { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
          .stat-item { border-right: none; padding: 0 !important; border-bottom: 1px solid #D8D0C0; padding-bottom: 1.5rem !important; }
          .stat-item:nth-child(3), .stat-item:last-child { border-bottom: none; }
          .about-values { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="about-section" ref={sectionRef}>
        <div className="about-container">

          {/* Header */}
          <div className={`about-header ${visible ? "visible" : ""}`}>
            <div>
              <p className="about-eyebrow">Est. 2006 · Real Estate</p>
              <h2 className="about-headline">
                Where fine homes<br />find <em>the right hands.</em>
              </h2>
            </div>
            <div>
              <p className="about-body">
                We are a boutique real estate firm built on discretion, expertise, and an
                unwavering belief that the right home changes everything. For nearly two decades,
                we have guided buyers and sellers through some of the most significant decisions
                of their lives — quietly, and with care.
              </p>
              <button className="about-cta">
                Our story
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 5h14M10 1l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className={`about-divider ${visible ? "visible" : ""}`} />

          {/* Stats */}
          <div className="about-stats">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`stat-item ${visible ? "visible" : ""}`}
                style={{ transitionDelay: visible ? `${0.1 + i * 0.1}s` : "0s" }}
              >
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="about-values">
            {values.map((v, i) => (
              <div
                key={v.heading}
                className={`value-card ${visible ? "visible" : ""}`}
                style={{ transitionDelay: visible ? `${0.4 + i * 0.15}s` : "0s" }}
              >
                <div className="value-index">0{i + 1}</div>
                <h3 className="value-heading">{v.heading}</h3>
                <p className="value-body">{v.body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}