'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Properties', href: '/properties' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Booking', href: '/booking' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md backdrop-saturate-200 border-b overflow-hidden ${
          isScrolled
            ? 'bg-white/15 border-white/30 shadow-[0_1px_20px_rgba(0,0,0,0.04)]'
            : 'bg-white/5 border-white/10'
        }`}
      >
        {/* diagonal sheen, like light glancing off glass */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
        <div className="pointer-events-none absolute -top-1/2 -left-1/4 w-1/2 h-[200%] rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* crisp top highlight, like a light catching the glass edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-32 h-32 sm:w-28 sm:h-28">
                <Image
                  src="/images/logo/sunrise2.png"
                  alt="Sunrise Realty"
                  fill
                  sizes="(min-width: 640px) 112px, 96px"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {NAV_LINKS.map((link) => {
                  const isActive = isActiveLink(link.href);

                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`text-sm font-medium transition-colors relative group ${
                          isActive
                            ? 'text-black'
                            : 'text-gray-800 hover:text-gray-900'
                        }`}
                      >
                        {link.label}

                        <span
                          className={`absolute -bottom-1 left-0 h-0.5 bg-[#B89B4E] transition-all duration-300 ${
                            isActive
                              ? 'w-full'
                              : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Login Button */}
              <Link
                href="/auth/login"
                className="px-6 py-2 rounded-full bg-B89B4E backdrop-blur-sm text-black text-sm font-medium hover:bg-[#B89B4E] transition-colors duration-200 whitespace-nowrap shadow-sm"
              >
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/40 transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-white/30 backdrop-blur-xl backdrop-saturate-200 lg:hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />

          <div className="relative flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => {
                  const isActive = isActiveLink(link.href);

                  return (
                    <li
                      key={link.label}
                      className="border-b border-white/40"
                    >
                      <Link
                        href={link.href}
                        className={`relative block px-6 py-4 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-white/50 text-black'
                            : 'text-gray-900 hover:bg-white/40'
                        }`}
                        onClick={handleNavClick}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#B89B4E]" />
                        )}

                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sign Up Button for Mobile */}
            <div className="border-t border-white/40 p-4 sm:p-6">
              <Link
                href="/auth/signup"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center px-6 py-3 rounded-full bg-gray-900/90 backdrop-blur-sm text-white font-medium hover:bg-gray-900 transition-colors duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}