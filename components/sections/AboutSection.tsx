import Link from 'next/link';
import { RiArrowRightLine, RiCheckLine, RiMapPinLine, RiHome4Line, RiShieldCheckLine, RiCompass3Line, RiHandHeartLine } from 'react-icons/ri';

const services = [
  'Property buying and selling',
  'Property rental and leasing',
  'Property consultation',
  'Real estate investment support',
  'Property valuation and market analysis',
  'Property marketing',
  'Negotiation and transaction support',
  'Property management support',
]

const strengths = [
  {
    heading: 'Trust',
    body: 'Clear information, honest advice, and no hidden surprises throughout the property process.',
  },
  {
    heading: 'Local knowledge',
    body: 'A practical understanding of property locations, pricing, and market conditions in Nepal.',
  },
  {
    heading: 'Long-term support',
    body: 'Personal guidance shaped around each client\'s goals, budget, preferences, and future plans.',
  },
]


export default function AboutSection() {
  const icons = [RiShieldCheckLine, RiCompass3Line, RiHandHeartLine];
  return (
    <div className="bg-[#f8f6f1] py-10 text-[#2A2723] sm:py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#ca7653]">About Sunrise</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Find your place.<br /><span className="text-[#ca7653]">Build your future.</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-stone-500">Sun Rise Multiple Business &amp; Housing brings together property buying, selling, rental, and consultation services in Nepal. We help you make informed decisions at every stage of your property journey.</p>
            <Link href="/properties" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#3E4A3D] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#303c2f]">Explore properties<RiArrowRightLine /></Link>
          </div>
          <div className="rounded-[36px] bg-[#e9e6dd] p-8 sm:p-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#ca7653]"><RiHome4Line size={38} /></div>
            <p className="mt-8 text-xs uppercase tracking-widest text-stone-500">Rooted in Nepal</p>
            <p className="mt-3 text-4xl font-bold">2066 B.S.</p>
            <p className="mt-2 text-sm text-stone-500">The beginning of our property journey.</p>
            <div className="mt-7 flex items-center gap-2 border-t border-stone-300 pt-5 text-sm"><RiMapPinLine className="text-[#ca7653]" />Kathmandu, Nepal</div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 rounded-[32px] bg-white p-7 sm:p-10 lg:grid-cols-2">
          <div><p className="text-xs uppercase tracking-widest text-[#ca7653]">Our story</p><h2 className="mt-4 text-3xl font-bold leading-tight">Built around informed<br />property decisions.</h2></div>
          <div className="space-y-4 text-sm leading-7 text-stone-500"><p>Established in 2066 B.S. (2009/2010 A.D.), our work has grown across property consultation, investment support, marketing, valuation, negotiation, rental, and management support.</p><p>We aim to connect clients with suitable opportunities at reasonable and mutually agreed prices, with trust, transparency, and professionalism at the heart of the process.</p></div>
        </section>

        <section className="mt-16" aria-labelledby="about-services">
          <p className="text-xs uppercase tracking-widest text-[#ca7653]">How we can help</p><h2 id="about-services" className="mt-3 text-3xl font-bold">Support for every next step.</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">{services.map(service => <div key={service} className="flex items-center gap-4 rounded-2xl bg-[#e9e6dd] p-5"><RiCheckLine className="shrink-0 rounded-full bg-white p-1 text-2xl text-[#ca7653]" /><span className="text-sm">{service}</span></div>)}</div>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-3" aria-label="Our values">{strengths.map((strength, index) => { const Icon = icons[index]; return <div key={strength.heading} className="rounded-[28px] bg-white p-7"><Icon className="mb-6 text-3xl text-[#ca7653]" /><h2 className="text-xl font-bold">{strength.heading}</h2><p className="mt-3 text-sm leading-7 text-stone-500">{strength.body}</p></div>; })}</section>

        <section className="mt-16 rounded-[36px] bg-[#2A2723] px-7 py-12 text-center text-white sm:rounded-[48px] sm:py-16">
          <p className="text-xs uppercase text-[#ce7c57]">Let’s find your next chapter</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">A little guidance. A clearer next move.</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-stone-300">Tell us about your goals, budget, and the place you have in mind.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#ca7653] px-7 py-3.5 text-sm font-bold hover:bg-[#b66545]">Speak with us<RiArrowRightLine /></Link>
        </section>
      </div>
    </div>
  );
}
