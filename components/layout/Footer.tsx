import Image from 'next/image';
import Link from 'next/link';

const groups = [
  { title: 'Pages', links: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Properties', href: '/properties' },
  ] },
  { title: 'Account', links: [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/signup' },
    { label: 'My Profile', href: '/profile' },
    { label: 'My Reservations', href: '/account/reservations' },
  ] },
  { title: 'Get in touch', links: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'List Your Property', href: '/marketplace' },
  ] },
];

export default function Footer() {
  return (
    <footer className="bg-[#f8f6f1] px-5 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-[1088px] rounded-t-[48px] bg-[#2A2723] px-7 pb-7 pt-12 text-white sm:rounded-t-[80px] sm:px-14 sm:pt-14">
        <Link href="/" aria-label="Sunrise Realestate home" className="mx-auto flex w-fit flex-col items-center">
          <Image src="/images/logo/sunrise.png" alt="Sunrise" width={180} height={46} className="h-auto w-40 brightness-0 invert sm:w-44" />
          <span className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-300">Multiple Businesses &amp; Housing Pvt. Ltd.</span>
        </Link>
        <nav aria-label="Footer navigation" className="mx-auto mt-12 grid max-w-xl grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-4 text-xs font-normal uppercase tracking-[0.16em] text-stone-400">{group.title}</h2>
              <ul className="space-y-2.5">
                {group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-xs text-stone-100 transition hover:text-[#d1805c]">{link.label}</Link></li>)}
              </ul>
              {group.title === 'Get in touch' && <p className="mt-4 text-xs leading-6 text-stone-400">Kathmandu, Nepal<br /><a className="break-all hover:text-[#d1805c]" href="mailto:info@sunrisembh.com">info@sunrisembh.com</a></p>}
            </div>
          ))}
        </nav>
        <p className="mt-12 border-t border-white/10 pt-5 text-center text-xs text-stone-300">© {new Date().getFullYear()} Sunrise Realestate. All rights reserved.</p>
      </div>
    </footer>
  );
}
