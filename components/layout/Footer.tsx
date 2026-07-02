import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const SERVICES = [
  { label: 'Buy a Property', href: '#' },
  { label: 'Sell Your Home', href: '#' },
  { label: 'Rental Listings', href: '#' },
  { label: 'Market Reports', href: '#' },
  { label: 'Valuations', href: '#' },
];

const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    icon: () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: '#',
    icon: () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2s9 5 20 5a9.5 9.5 0 0 0-9-5.5c4.75 2.25 9-1.75 9-5.5v-.5a4.5 4.5 0 0 0 1-2.5" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#F7F5F0] text-[#2A2A28] border-t border-[#E3DFD4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-8">
        {/* Top: Brand + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D4920A] mb-1.5">
              Let&apos;s find your next place
            </p>
            <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#1C1C1A] leading-tight">
              Sunrise Multiple Housing &amp; Business
            </h3>
          </div>

          <a
            href="mailto:info@sunrisemhb.com"
            className="group inline-flex items-center gap-1.5 self-start text-xs tracking-wide text-[#4A4A45] border-b border-transparent hover:text-[#D4920A] hover:border-[#D4920A] transition-colors duration-200 whitespace-nowrap"
          >
            Start a conversation
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E3DFD4]" />

        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 py-8">
          {/* Navigate Column */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.14em] text-[#8A8578] mb-3">
              Navigate
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#4A4A45] hover:text-[#D4920A] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.14em] text-[#8A8578] mb-3">
              Services
            </h4>
            <ul className="space-y-2">
              {SERVICES.map((service) => (
                <li key={service.label}>
                  <a
                    href={service.href}
                    className="text-xs text-[#4A4A45] hover:text-[#D4920A] transition-colors duration-200"
                  >
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.14em] text-[#8A8578] mb-3">
              Contact
            </h4>
            <div className="space-y-2.5">
              <a
                href="mailto:info@sunrisemhb.com"
                className="flex items-center gap-2 text-xs text-[#4A4A45] hover:text-[#D4920A] transition-colors duration-200"
              >
                <Mail className="w-3 h-3 text-[#D4920A] flex-shrink-0" />
                info@sunrisemhb.com
              </a>
              <a
                href="tel:5551234567"
                className="flex items-center gap-2 text-xs text-[#4A4A45] hover:text-[#D4920A] transition-colors duration-200"
              >
                <Phone className="w-3 h-3 text-[#D4920A] flex-shrink-0" />
                (555) 123-4567
              </a>
              <div className="flex items-start gap-2 text-xs text-[#4A4A45]">
                <MapPin className="w-3 h-3 text-[#D4920A] flex-shrink-0 mt-0.5" />
                84 Meridian Ave, Suite 200
              </div>
            </div>
          </div>

          {/* Social Column */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.14em] text-[#8A8578] mb-3">
              Follow
            </h4>
            <div className="flex items-center gap-1.5">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-7 h-7 flex items-center justify-center text-[#4A4A45] border border-[#E3DFD4] hover:text-[#D4920A] hover:border-[#D4920A] transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E3DFD4]" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5">
          <p className="text-[11px] text-[#8A8578] tracking-wide">
            © 2024 Sunrise Multiple Housing &amp; Business. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="#"
              className="text-[11px] text-[#8A8578] hover:text-[#D4920A] transition-colors duration-200 tracking-wide"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[11px] text-[#8A8578] hover:text-[#D4920A] transition-colors duration-200 tracking-wide"
            >
              Terms of Use
            </a>
            <a
              href="#"
              className="text-[11px] text-[#8A8578] hover:text-[#D4920A] transition-colors duration-200 tracking-wide"
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}