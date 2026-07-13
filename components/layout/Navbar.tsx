'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <Image
                  src="/images/logo/sunrise2.png"
                  alt="Sunrise Realty"
                  fill
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Sign Up Button */}
              <Link
                href="/auth/signup"
                className="px-6 py-2 rounded-full bg-gray-900/90 backdrop-blur-sm text-white text-sm font-medium hover:bg-gray-900 transition-colors duration-200 whitespace-nowrap shadow-sm"
              >
                Sign Up
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
                {NAV_LINKS.map((link) => (
                  <li key={link.label} className="border-b border-white/40">
                    <Link
                      href={link.href}
                      className="block px-6 py-4 text-base font-medium text-gray-900 hover:bg-white/40 transition-colors"
                      onClick={handleNavClick}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
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