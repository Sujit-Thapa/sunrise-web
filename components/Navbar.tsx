'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="px-8 md:px-12 relative">
      {/* Gold gradient rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-50"
        style={{
          background:
            'linear-gradient(90deg, transparent, #D4920A, transparent)',
        }}
      />

      <div className="mx-auto max-w-container flex items-center justify-between h-[68px] py-10">
        {/* Logo */}
        <Link href="/" className="flex items-center  gap-3 group">
          {/* Diamond mark */}
          <Image src="/images/logo/sunrise1.png" alt="Logo" width={500} height={500} className='w-20 object-contain' />
          <Image src="/images/logo/sunrise.png" alt="Logo" width={500} height={500} className='w-50 h-auto' />
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
                    // layout
                    'relative py-1',
                    // typography
                    'text-[14px] font-normal uppercase ',
                    // color
                    isActive ? 'text-gold-primary' : 'text-stone',
                    // interaction
                    'hover:text-gold-highlight transition-colors duration-150',
                    // underline animation via pseudo (handled with group)
                    'after:absolute after:bottom-[-2px] after:left-0 after:h-px after:bg-gold-primary',
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
      </div>
    </nav>
  )
}