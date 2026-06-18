import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2s9 5 20 5a9.5 9.5 0 0 0-9-5.5c4.75 2.25 9-1.75 9-5.5v-.5a4.5 4.5 0 0 0 1-2.5" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F2D5E] text-[#BDD0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pb-12 border-b border-[#1A3F7A]">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-light text-white mb-3 tracking-wide">
              Sunrise Realty
            </h3>
            <p className="text-sm leading-relaxed text-[#7A9CC8] mb-6 max-w-xs">
              A boutique firm dedicated to placing people in homes worth keeping.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-full border border-[#1A3F7A] flex items-center justify-center text-[#7A9CC8] hover:text-white hover:border-[#4A7CC8] transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigate Column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#4A7CC8] mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A0C0E8] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#4A7CC8] mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICES.map((service) => (
                <li key={service.label}>
                  <a
                    href={service.href}
                    className="text-sm text-[#A0C0E8] hover:text-white transition-colors duration-200"
                  >
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#4A7CC8] mb-5">
              Get in Touch
            </h4>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#4A7CC8] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#4A7CC8] mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:info@sunriserealty.com"
                    className="text-sm text-[#A0C0E8] hover:text-white transition-colors duration-200"
                  >
                    info@sunriserealty.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#4A7CC8] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#4A7CC8] mb-1">
                    Phone
                  </p>
                  <a
                    href="tel:5551234567"
                    className="text-sm text-[#A0C0E8] hover:text-white transition-colors duration-200"
                  >
                    (555) 123-4567
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#4A7CC8] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#4A7CC8] mb-1">
                    Office
                  </p>
                  <p className="text-sm text-[#A0C0E8]">
                    84 Meridian Ave, Suite 200
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8">
          <p className="text-xs text-[#4A72B0] tracking-wide">
            © 2024 Sunrise Realty. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <a
              href="#"
              className="text-xs text-[#4A72B0] hover:text-[#A0C0E8] transition-colors duration-200 tracking-wide"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-[#4A72B0] hover:text-[#A0C0E8] transition-colors duration-200 tracking-wide"
            >
              Terms of Use
            </a>
            <a
              href="#"
              className="text-xs text-[#4A72B0] hover:text-[#A0C0E8] transition-colors duration-200 tracking-wide"
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
