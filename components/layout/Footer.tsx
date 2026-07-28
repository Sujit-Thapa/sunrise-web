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
    <footer className="relative mt-20">
      {/* Soft separation from the section above */}
      <div className="pointer-events-none absolute inset-x-0 -top-12 h-12 bg-gradient-to-b from-transparent to-white" />

      <div className="relative overflow-hidden border-t border-stone-200/70 bg-white text-stone-700">
        {/* Subtle top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B89B4E]/25 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-14">
          {/* Main footer content */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1.2fr_auto] lg:gap-14">
            {/* Explore */}
            <div>
              <FooterHeading>Explore</FooterHeading>

              <ul className="space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-stone-600 transition-colors duration-200 hover:text-[#B89B4E]"
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <FooterHeading>Services</FooterHeading>

              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-600 transition-colors duration-200 hover:text-[#B89B4E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <FooterHeading>Contact</FooterHeading>

              <div className="space-y-3 text-sm text-stone-600">
                <a
                  href="mailto:info@sunrisembh.com"
                  className="group flex w-fit items-start gap-2.5 transition-colors duration-200 hover:text-[#B89B4E]"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#B89B4E]" />
                  <span>info@sunrisembh.com</span>
                </a>

                <a
                  href="tel:5551234567"
                  className="group flex w-fit items-start gap-2.5 transition-colors duration-200 hover:text-[#B89B4E]"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#B89B4E]" />
                  <span>(555) 123-4567</span>
                </a>

                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B89B4E]" />
                  <span className="max-w-[220px] leading-relaxed">
                    84 Meridian Ave, Suite 200
                  </span>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="sm:col-span-2 lg:col-span-1 lg:text-right">
              <FooterHeading className="lg:text-right">Follow</FooterHeading>

              <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="group inline-flex items-center gap-1 text-sm text-stone-600 transition-colors duration-200 hover:text-[#B89B4E]"
                  >
                    {social.label}

                    <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom area */}
          <div className="mt-12 flex flex-col gap-4 border-t border-stone-200/70 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Sunrise Realestate. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href="#"
                className="transition-colors duration-200 hover:text-[#B89B4E]"
              >
                Privacy
              </a>

              <a
                href="#"
                className="transition-colors duration-200 hover:text-[#B89B4E]"
              >
                Terms
              </a>

              <a
                href="#"
                className="transition-colors duration-200 hover:text-[#B89B4E]"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-400 ${className}`}
    >
      {children}
    </h3>
  );
}
