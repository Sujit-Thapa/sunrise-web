'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <Image
                  src="/images/logo/sunrise.png"
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
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Sign In Button */}
              <button
                onClick={() => {
                  /* Auth modal trigger */
                }}
                className="px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap"
              >
                Sign In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
        <div className="fixed inset-0 z-40 pt-20 bg-white lg:hidden">
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.label} className="border-b border-gray-200">
                    <Link
                      href={link.href}
                      className="block px-6 py-4 text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={handleNavClick}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sign In Button for Mobile */}
            <div className="border-t border-gray-200 p-4 sm:p-6">
              <button
                onClick={() => {
                  handleNavClick();
                  /* Auth modal trigger */
                }}
                className="w-full px-6 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Sign In / Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
