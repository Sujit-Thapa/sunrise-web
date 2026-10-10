import Image from 'next/image';
import Link from 'next/link';

const groups = [
  { title: 'Pages', width: 'sm:w-40', links: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Properties', href: '/properties' },
  ] },
  { title: 'Account', width: 'sm:w-[140px]', links: [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/signup' },
  ] },
  { title: 'Get in touch', width: 'sm:w-[140px]', links: [
    { label: 'Contact', href: '/contact' },
  ] },
];

export default function Footer() {
  return (
    <footer className="bg-[#f7f5f1] px-5 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-[1320px] rounded-t-[56px] bg-[#1e1e1e] px-7 pb-10 pt-14 text-white sm:rounded-t-[114px] sm:px-[72px]">
        <Link href="/" aria-label="Sunrise Realestate home" className="mx-auto flex w-fit flex-col items-center">
          <Image src="/images/logo/sunrise.png" alt="Sunrise" width={180} height={46} className="h-auto w-44 brightness-0 invert sm:w-52" />
          <span className="mt-2 text-xs uppercase tracking-[0.14em] text-white/80">Multiple Businesses &amp; Housing Pvt. Ltd.</span>
        </Link>
        <nav aria-label="Footer navigation" className="mx-auto mt-[50px] flex w-fit flex-wrap justify-center gap-x-[34px] gap-y-8">
          {groups.map((group) => (
            <div key={group.title} className={`w-[140px] ${group.width}`}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/60">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-base text-white transition hover:text-[#cc7654]">{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </nav>
        <p className="mt-[50px] border-t border-white/10 pt-4 text-center text-base tracking-[0.01em] text-white">© {new Date().getFullYear()} Sunrise Realestate. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
