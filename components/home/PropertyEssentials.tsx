import Link from 'next/link';
import { ArrowRight, House, Handshake, ClipboardList, CalendarCheck } from 'lucide-react';

const essentials = [
  { title: 'Find a place that fits', label: 'Discover', description: 'Explore Sunrise properties by location, property type, and budget.', href: '/properties', icon: House },
  { title: 'Keep track of your reservation', label: 'Your account', description: 'View your property holds, assigned agent, and reservation history in one place.', href: '/account/reservations', icon: CalendarCheck },
  { title: 'Share your property', label: 'Marketplace', description: 'Submit your listing for review and manage it through your Sunrise account.', href: '/marketplace', icon: ClipboardList },
  { title: 'Make your next move with us', label: 'Consultation', description: 'Talk to our team about buying, selling, renting, or property consultation.', href: '/contact', icon: Handshake },
];

export default function PropertyEssentials() {
  return (
    <section aria-labelledby="essentials-heading" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><p className="mb-2 text-[11px] uppercase text-[#ca7653]">Explore with Sunrise</p><h2 id="essentials-heading" className="text-2xl font-bold tracking-tight text-[#2c2925] sm:text-3xl">Your Property Essentials</h2></div>
        <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#ca7653]">About Sunrise<ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {essentials.map(({ title, label, description, href, icon: Icon }, index) => (
          <Link key={title} href={href} className="group overflow-hidden rounded-[22px] bg-white transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ca7653]">
            <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden ${index % 2 ? 'bg-[#e2e6de] text-[#3E4A3D]' : 'bg-[#eee2d7] text-[#b97b58]'}`}>
              <div className="absolute h-40 w-40 rounded-full border border-current opacity-10" />
              <div className="absolute h-52 w-52 rounded-full border border-current opacity-10" />
              <Icon aria-hidden="true" size={58} strokeWidth={1} className="relative transition duration-300 group-hover:scale-110" />
            </div>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-wider text-[#ca7653]">{label}</p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[#2c2925]">{title}</h3>
              <p className="mt-3 text-xs leading-6 text-stone-500">{description}</p>
              <ArrowRight aria-hidden="true" size={18} className="mt-4 text-[#3E4A3D] transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
