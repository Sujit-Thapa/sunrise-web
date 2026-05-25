'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthModal from '../../modals/AuthModal';

const NAV_LINKS = [
  { label: 'Properties', href: '/properties' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Booking', href: '/booking' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          transition: background 0.3s, border-color 0.3s, padding 0.3s;
          border-bottom: 1px solid transparent;
          background: transparent;
          padding: 1.4rem 0;
        }

        .nav.scrolled {
          background: rgba(247, 245, 240, 0.96);
          border-bottom-color: #E0DAD0;
          padding: 0.9rem 0;
          backdrop-filter: blur(8px);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        /* Logo */
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.3rem;
          letter-spacing: 0.05em;
          color: #1A1814;
          text-decoration: none;
          white-space: nowrap;
        }
        .nav-logo span { font-style: italic; color: #5C5040; }

        /* Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6E6455;
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 100%;
          height: 1px;
          background: #1A1814;
          transition: right 0.25s ease;
        }

        .nav-links a:hover { color: #1A1814; }
        .nav-links a:hover::after { right: 0; }

        /* Auth button */
        .nav-auth-btn {
          background: #1A1814;
          color: #F7F5F0;
          border: none;
          padding: 0.6rem 1.4rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .nav-auth-btn:hover { background: #3A3428; }

        /* Mobile menu toggle */
        .nav-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #1A1814;
          cursor: pointer;
          padding: 0.25rem;
        }

        /* Mobile drawer */
        .nav-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #F7F5F0;
          z-index: 49;
          flex-direction: column;
          padding: 6rem 2.5rem 3rem;
        }
        .nav-drawer.open { display: flex; }

        .nav-drawer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .nav-drawer-links li { border-bottom: 1px solid #E8E3D8; }

        .nav-drawer-links a {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.8rem;
          color: #1A1814;
          text-decoration: none;
          padding: 0.85rem 0;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-drawer-links a:hover { color: #5C5040; }

        .nav-drawer-auth {
          margin-top: 2.5rem;
          background: #1A1814;
          color: #F7F5F0;
          border: none;
          padding: 1rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s;
        }
        .nav-drawer-auth:hover { background: #3A3428; }

        @media (max-width: 820px) {
          .nav-links { display: none; }
          .nav-auth-btn { display: none; }
          .nav-menu-btn { display: flex; }
        }
      `}</style>

      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">

          {/* Logo */}
          <Link href="/" className="nav-logo">
            Sunrise <span>Realty</span>
          </Link>

          {/* Desktop links */}
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>

          {/* Desktop auth button */}
          <button className="nav-auth-btn" onClick={() => setAuthOpen(true)}>
            Sign In
          </button>

          {/* Mobile hamburger */}
          <button
            className="nav-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        <ul className="nav-drawer-links">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <button className="nav-drawer-auth" onClick={() => { setMenuOpen(false); setAuthOpen(true); }}>
          Sign In / Create Account
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}