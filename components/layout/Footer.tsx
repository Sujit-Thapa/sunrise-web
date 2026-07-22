import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const QUICK_LINKS = [
  { label: "Buy a Property", href: "/properties" },
  { label: "Sell Your Home", href: "/contact" },
  { label: "Rental Listings", href: "/properties" },
  { label: "Market Insights", href: "/about" },
];

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "X", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/20 bg-white/30 backdrop-blur-xl text-stone-700">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        {/* Main grid: link columns + socials as a 4th column */}
        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:gap-10">
          <div>
            <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Explore
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-xs text-stone-600 transition hover:text-[#B89B4E]"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Services
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-stone-600 transition hover:text-[#B89B4E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Contact
            </h3>
            <div className="space-y-2 text-xs text-stone-600">
              <a href="mailto:info@sunrisembh.com" className="flex items-start gap-2 transition hover:text-[#B89B4E]">
                <Mail className="mt-0.5 h-3.5 w-3.5 text-[#B89B4E]" />
                <span>info@sunrisembh.com</span>
              </a>
              <a href="tel:5551234567" className="flex items-start gap-2 transition hover:text-[#B89B4E]">
                <Phone className="mt-0.5 h-3.5 w-3.5 text-[#B89B4E]" />
                <span>(555) 123-4567</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-[#B89B4E]" />
                <span>84 Meridian Ave, Suite 200</span>
              </div>
            </div>
          </div>

          {/* Socials: own column on desktop, wraps to full width below on mobile */}
          <div className="flex flex-col sm:col-span-3 lg:col-span-1 lg:items-end">
            <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500 lg:text-right">
              Follow
            </h3>
            <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="relative overflow-hidden rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-[0.7rem] font-medium text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-md transition duration-300 hover:border-[#B89B4E]/50 hover:bg-white/35 hover:text-[#B89B4E] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_12px_rgba(184,155,78,0.15)]"
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/50 to-transparent" />
                  <span className="relative">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/30 pt-5 text-[0.7rem] text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 Sunrise Realty. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-[#B89B4E]">
              Privacy
            </a>
            <a href="#" className="transition hover:text-[#B89B4E]">
              Terms
            </a>
            <a href="#" className="transition hover:text-[#B89B4E]">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}