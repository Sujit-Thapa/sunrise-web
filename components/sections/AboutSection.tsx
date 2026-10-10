import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, ClipboardList, Info, KeyRound, LineChart, Megaphone, MessagesSquare, Warehouse, type LucideIcon } from 'lucide-react';

import Breadcrumb from '@/components/ui/Breadcrumb';

const services: Array<{ title: string; body: string; icon: LucideIcon }> = [
  { title: 'Property consultation', body: 'Discuss your needs, preferred location and budget to find a suitable direction.', icon: MessagesSquare },
  { title: 'Investment support', body: 'Consider property opportunities in the context of your goals and financial plans.', icon: LineChart },
  { title: 'Property marketing', body: 'Present your property clearly and connect it with interested buyers through listings.', icon: Megaphone },
  { title: 'Property valuation', body: 'Understand the factors that inform a property’s value before discussing a price.', icon: ClipboardList },
  { title: 'Negotiation support', body: 'Support constructive discussions toward reasonable, mutually agreed terms.', icon: BadgeDollarSign },
  { title: 'Rental support', body: 'Explore rental requirements and connect owners and tenants with suitable options.', icon: KeyRound },
  { title: 'Management support', body: 'Discuss the ongoing needs of your property and the support that may be appropriate.', icon: Warehouse },
];

const approach = [
  { title: 'Trust', body: 'Listen to your priorities and build a shared understanding of what you need.' },
  { title: 'Transparency', body: 'Keep property information, questions and price discussions clear and open.' },
  { title: 'Professionalism', body: 'Approach each inquiry with care, respect and a considered next step.' },
];

const steps = [
  { title: 'Discover & compare', body: 'Search and filter properties. Explore the Sunrise collection and owner marketplace listings, then review details and estimate your EMI.' },
  { title: 'Inquire & understand', body: 'Share a property reference and your requirements. Review owner or agent information and ask about availability, price and next steps.' },
  { title: 'Reserve & follow up', body: 'Use the property’s reservation option when you’re ready to express interest. Track your reserved properties and discuss the next steps.' },
];

const audiences = [
  { title: 'For buyers', body: 'Explore locations and property details that fit your needs and budget.', link: 'Explore Properties', href: '/properties' },
  { title: 'For investors', body: 'Discuss your objectives, valuation questions and opportunities of interest.', link: 'Discuss an investment', href: '/contact' },
  { title: 'For property owners', body: 'List your property in the marketplace or ask about marketing and management.', link: 'List Properties', href: '/marketplace?list=1' },
];

const container = 'mx-auto max-w-[1320px] px-5 sm:px-8 xl:px-0';
const eyebrow = 'text-xs font-bold tracking-[0.02em] text-[#cc7654]';
const sectionTitle = 'text-3xl font-bold tracking-[0.01em] sm:text-[34px]';

function TextLink({ href, children }: { href: string; children: string }) {
  return <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#cc7654] hover:underline">{children}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>;
}

export default function AboutSection() {
  return (
    <div className={`${container} pb-16 pt-2 text-[#2a2723]`}>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />

      <section className="grid items-center gap-10 pt-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className={eyebrow}>ABOUT SUNRISE</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-[0.01em] sm:text-[55px]">Property decisions.<br /><span className="text-[#cc7654]">Built on trust.</span></h1>
          <p className="mt-6 max-w-[520px] text-base leading-[1.65] text-[#6b665f]">At Sunrise, we bring people and property opportunities together — with clear guidance and a thoughtful approach to every next step.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/properties" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#cc7654] px-6 text-sm font-semibold text-white hover:bg-[#b66545]">Explore Properties<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#e3ded6] bg-white px-6 text-sm font-semibold hover:border-[#cc7654]">Contact Us<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#e8e4db]">
          <Image src="/images/about/hero.webp" alt="Plotted land with roads and the Annapurna range behind it" fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 px-5 py-4 backdrop-blur sm:inset-x-5 sm:bottom-5">
            <p className="text-[11px] font-bold tracking-[0.02em] text-[#cc7654]">ESTABLISHED IN</p>
            <p className="mt-1 text-lg font-semibold">2066 B.S. (2009/2010 A.D.)</p>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-10 border-y border-[#e6e1d8] py-12 md:grid-cols-2 md:gap-16" aria-label="Our story and mission">
        <div>
          <p className={eyebrow}>OUR STORY</p>
          <h2 className="mt-3 text-[26px] font-semibold leading-tight">Rooted in service.<br />Growing with your needs.</h2>
          <p className="mt-4 text-sm leading-[1.7] text-[#6b665f]">Established in 2066 B.S. (2009/2010 A.D.), our work has grown across property consultation, investment support, marketing, valuation, negotiation, rental, and management support.</p>
        </div>
        <div>
          <p className={eyebrow}>OUR MISSION</p>
          <h2 className="mt-3 text-[26px] font-semibold leading-tight">The right opportunity.<br />A shared understanding.</h2>
          <p className="mt-4 text-sm leading-[1.7] text-[#6b665f]">We aim to connect clients with suitable opportunities at reasonable and mutually agreed prices, with trust, transparency, and professionalism at the heart of the process.</p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="about-services">
        <p className={eyebrow}>WHAT WE DO</p>
        <h2 id="about-services" className={`mt-3 ${sectionTitle}`}>Support across your property journey.</h2>
        <p className="mt-2 text-sm text-[#6b665f]">From an initial conversation to ongoing property needs, start with the support that matters to you.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ title, body, icon: Icon }) => (
            <li key={title} className="rounded-2xl bg-white p-5">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-[10px] bg-[#fbe9e1] text-[#cc7654]"><Icon className="h-4 w-4" /></span>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#6b665f]">{body}</p>
            </li>
          ))}
          <li className="rounded-2xl bg-[#e8e4db] p-5">
            <h3 className="text-lg font-semibold leading-snug">Not sure where<br />to begin?</h3>
            <p className="mt-3 text-[13px] leading-[1.6] text-[#6b665f]">Tell us what you have in mind. We’ll help you discuss a suitable next step.</p>
            <div className="mt-4"><TextLink href="/contact">Let’s talk</TextLink></div>
          </li>
        </ul>
      </section>

      <section className="mt-12 rounded-[32px] bg-[#2a2723] px-7 py-9 text-white sm:px-10" aria-labelledby="about-approach">
        <p className={eyebrow}>OUR APPROACH</p>
        <h2 id="about-approach" className="mt-2 text-2xl font-semibold sm:text-[28px]">Good relationships come before transactions.</h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {approach.map((item) => <div key={item.title}><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#cfc9bf]">{item.body}</p></div>)}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="about-steps">
        <p className={eyebrow}>HOW IT WORKS</p>
        <h2 id="about-steps" className={`mt-3 ${sectionTitle}`}>A clearer path to your next move.</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <p className="border-b border-[#e6e1d8] pb-3 text-2xl font-semibold text-[#cc7654]">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b665f]">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex items-start gap-2.5 rounded-xl bg-[#f4e6e0] px-4 py-3 text-[13px] text-[#4b4740]"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#cc7654]" />A reservation expresses interest; it is not a completed purchase or a purchase guarantee. Availability and final terms must be confirmed with the relevant owner or agent.</p>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-3" aria-label="Who we help">
        {audiences.map((audience) => (
          <div key={audience.title} className="rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold">{audience.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b665f]">{audience.body}</p>
            <div className="mt-4"><TextLink href={audience.href}>{audience.link}</TextLink></div>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-[40px] bg-[#e8e4db] px-7 py-14 text-center" aria-labelledby="about-cta">
        <h2 id="about-cta" className="text-2xl font-semibold tracking-[0.01em] sm:text-[32px]">Your next chapter starts with a conversation.</h2>
        <p className="mt-3 text-sm text-[#6b665f]">Share your goals, explore your options and take a considered next step.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#cc7654] px-6 text-sm font-semibold text-white hover:bg-[#b66545]">Contact Us<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          <Link href="/properties" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold hover:text-[#cc7654]">Explore Properties<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
