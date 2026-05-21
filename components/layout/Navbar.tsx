'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Booking', href: '/booking' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="px-8 md:px-12 absolute top-0 z-10 w-full bg-white">
      {/* Gold gradient rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4920A, transparent)',
        }}
      />

      <div className="mx-auto max-w-container flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/logo/sunrise.png"
            alt="Sunrise Real Estate"
            width={500}
            height={500}
            loading="eager"
            priority
            className="w-50 h-auto"
          />
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-9 list-none">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'relative py-1',
                    'text-[11.5px] font-normal uppercase tracking-widest',
                    isActive ? 'text-[#D4920A]' : 'text-stone',
                    'hover:text-[#D4920A] transition-colors duration-150',
                    'after:absolute after:bottom-[-2px] after:left-0 after:h-px after:bg-[#D4920A]',
                    'after:transition-[right] after:duration-250',
                    isActive ? 'after:right-0' : 'after:right-full hover:after:right-0'
                  )}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-1">
          {/* Notification bell */}
          <button
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-stone hover:bg-stone/5 hover:text-stone-800 transition-colors duration-150"
          >
            {/* Bell icon — replace with your icon library */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6" />
              <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
            </svg>
            {/* Unread dot */}
            <span
              className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full border-[1.5px] border-white"
              style={{ background: '#D4920A' }}
            />
          </button>

          {/* Divider */}
          <div className="w-px h-[18px] bg-stone/20 mx-1.5" />

          {/* Sign in */}
          <Link
            href="/login"
            className={cn(
              'flex items-center gap-1.5 px-4 h-8',
              'border border-stone/25 rounded-sm',
              'text-[11.5px] uppercase tracking-widest font-normal text-stone-800',
              'hover:bg-[#D4920A] hover:border-[#D4920A] hover:text-white',
              'transition-all duration-150'
            )}
          >
            {/* User icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              <path d="M5.5 20a7 7 0 0 1 13 0" />
            </svg>
            Sign in
          </Link>
        </div>

        {/* Mobile hamburger — expand as needed */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center text-stone"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  )
}