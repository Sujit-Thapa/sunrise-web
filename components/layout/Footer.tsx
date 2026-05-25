import Link from "next/link"

const links = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

const socials = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l16 16M4 20L20 4"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .footer {
          background-color: #0F2D5E;
          color: #BDD0F0;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          padding: 5rem 0 2.5rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5rem;
        }

        /* ── Top grid ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1.4fr;
          gap: 3rem;
          padding-bottom: 4rem;
          border-bottom: 1px solid #1A3F7A;
        }

        /* Brand col */
        .footer-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.7rem;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          margin: 0 0 0.75rem;
          line-height: 1;
        }

        .footer-brand-tagline {
          font-size: 0.82rem;
          line-height: 1.7;
          color: #7A9CC8;
          max-width: 220px;
          margin: 0 0 2rem;
        }

        .footer-socials {
          display: flex;
          gap: 0.75rem;
        }

        .footer-social-btn {
          width: 34px;
          height: 34px;
          border: 1px solid #1A3F7A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7A9CC8;
          text-decoration: none;
          transition: border-color 0.25s, color 0.25s;
        }
        .footer-social-btn:hover {
          border-color: #4A7CC8;
          color: #BDD0F0;
        }

        /* Nav cols */
        .footer-col-heading {
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4A7CC8;
          margin: 0 0 1.4rem;
        }

        .footer-nav {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .footer-nav a {
          font-size: 0.9rem;
          color: #A0C0E8;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-nav a:hover { color: #FFFFFF; }

        /* Contact col */
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-contact-icon {
          color: #4A7CC8;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .footer-contact-label {
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #4A7CC8;
          margin-bottom: 0.15rem;
        }

        .footer-contact-value {
          font-size: 0.88rem;
          color: #A0C0E8;
          transition: color 0.2s;
        }
        a.footer-contact-value:hover { color: #FFFFFF; }

        /* ── Bottom bar ── */
        .footer-bottom {
          padding-top: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .footer-copy {
          font-size: 0.75rem;
          color: #4A72B0;
          letter-spacing: 0.04em;
        }

        .footer-legal {
          display: flex;
          gap: 1.75rem;
        }

        .footer-legal a {
          font-size: 0.75rem;
          color: #4A72B0;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .footer-legal a:hover { color: #A0C0E8; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">

          <div className="footer-grid">

            {/* Brand */}
            <div>
              <p className="footer-brand-name">Sunrise Realty</p>
              <p className="footer-brand-tagline">
                A boutique firm dedicated to placing people in homes worth keeping.
              </p>
              <div className="footer-socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="footer-social-btn" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p className="footer-col-heading">Navigate</p>
              <ul className="footer-nav">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <p className="footer-col-heading">Services</p>
              <ul className="footer-nav">
                {["Buy a Property", "Sell Your Home", "Rental Listings", "Market Reports", "Valuations"].map((s) => (
                  <li key={s}><a href="#">{s}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="footer-col-heading">Get in Touch</p>

              <div className="footer-contact-item">
                <svg className="footer-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <div>
                  <p className="footer-contact-label">Email</p>
                  <a href="mailto:info@sunriserealty.com" className="footer-contact-value" style={{ textDecoration: "none", display: "block" }}>
                    info@sunriserealty.com
                  </a>
                </div>
              </div>

              <div className="footer-contact-item">
                <svg className="footer-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                </svg>
                <div>
                  <p className="footer-contact-label">Phone</p>
                  <a href="tel:5551234567" className="footer-contact-value" style={{ textDecoration: "none", display: "block" }}>
                    (555) 123-4567
                  </a>
                </div>
              </div>

              <div className="footer-contact-item">
                <svg className="footer-contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <p className="footer-contact-label">Office</p>
                  <span className="footer-contact-value">84 Meridian Ave, Suite 200</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p className="footer-copy">© 2024 Sunrise Realty. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Cookie Settings</a>
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}