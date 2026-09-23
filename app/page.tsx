import Link from 'next/link';
import HeroSection from '@/components/sections/HeroSection';
import PropertyCollection from '@/components/home/PropertyCollection';
import EmiCalculator from '@/components/home/EmiCalculator';
import { propertiesApi, userPropertiesApi } from '@/lib/backend';

export default async function Home() {
  const [companyResult, marketplaceResult] = await Promise.allSettled([
    propertiesApi.findAll({ page: 1, limit: 100 }),
    userPropertiesApi.findAll({ page: 1, limit: 4 }),
  ]);
  const properties = companyResult.status === 'fulfilled' && Array.isArray(companyResult.value.items) ? companyResult.value.items : [];
  const marketplace = marketplaceResult.status === 'fulfilled' && Array.isArray(marketplaceResult.value.items) ? marketplaceResult.value.items : [];
  const newlyListed = [...properties].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const featured = properties.slice(0, 4);

  return (
    <div className="bg-[#f8f6f1] text-[#2c2925]">
      <HeroSection properties={properties} />
      <div className="pt-6 sm:pt-10">
        <PropertyCollection id="featured" eyebrow="Explore the collection" title="Featured Sunrise Properties" properties={featured} href="/properties" error={companyResult.status === 'rejected'} />
        <PropertyCollection id="newly-listed" eyebrow="Latest market entries" title="Newly Listed" properties={newlyListed} href="/properties" inset error={companyResult.status === 'rejected'} />
        <EmiCalculator />
        <PropertyCollection id="marketplace" eyebrow="Marketplace" title="Properties Listed in Marketplace" properties={marketplace} href="/marketplace" marketplace error={marketplaceResult.status === 'rejected'} />
        <section aria-labelledby="list-property-heading" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="rounded-[36px] bg-[radial-gradient(ellipse_at_bottom_right,#564035_0%,#2a2722_55%)] px-6 py-14 text-center text-white sm:rounded-[48px] sm:px-14 sm:py-16">
            <p className="text-[11px] uppercase text-[#d1805c]">Partner with us</p>
            <h2 id="list-property-heading" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Ready to list your property?</h2>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-stone-300">Bring your property to the Sunrise marketplace. Create a listing, add your photos, and submit it for our team to review.</p>
            <Link href="/marketplace" className="mt-7 inline-flex rounded-full bg-[#ca7653] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#b66545] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Get Started Now</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
