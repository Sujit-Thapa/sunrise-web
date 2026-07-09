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
    <footer className="border-t border-stone-200 bg-stone-50/80 text-stone-700">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-[1rem] font-medium uppercase tracking-[0.28em] text-stone-500">
              Sunrise Multiple Business and Housinf Pvt. Ltd.
            </p>
           
           
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="rounded-full border border-stone-300 px-3 py-2 text-sm text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8  border-stone-200 pt-10 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Explore
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Services
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-600 transition hover:text-stone-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-stone-600">
              <a href="mailto:info@sunriserealty.com" className="flex items-start gap-3 transition hover:text-stone-900">
                <Mail className="mt-0.5 h-4 w-4" />
                <span>info@sunrismbh.com</span>
              </a>
              <a href="tel:5551234567" className="flex items-start gap-3 transition hover:text-stone-900">
                <Phone className="mt-0.5 h-4 w-4" />
                <span>(555) 123-4567</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>84 Meridian Ave, Suite 200</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 pt-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 Sunrise Realty. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition hover:text-stone-900">
              Privacy
            </a>
            <a href="#" className="transition hover:text-stone-900">
              Terms
            </a>
            <a href="#" className="transition hover:text-stone-900">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
