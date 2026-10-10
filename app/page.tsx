import Image from 'next/image';
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
    <div className="bg-[#f7f5f1] text-[#2a2723]">
      <HeroSection properties={properties} />
      <div className="pt-6 sm:pt-10">
        <PropertyCollection id="featured" eyebrow="CURATED COLLECTION" title="Featured Sunrise Properties" properties={featured} href="/properties" error={companyResult.status === 'rejected'} />
        <PropertyCollection id="newly-listed" eyebrow="Latest Market Entry" title="Newly Listed" properties={newlyListed} href="/properties" inset error={companyResult.status === 'rejected'} />
        <EmiCalculator />
        <PropertyCollection id="marketplace" eyebrow="MARKETPLACE" title="Properties Listed in Marketplace" properties={marketplace} href="/marketplace" marketplace error={marketplaceResult.status === 'rejected'} />
        <section aria-labelledby="list-property-heading" className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16 xl:px-0">
          <div className="relative overflow-hidden rounded-[40px] bg-[#2a2723] px-6 py-14 text-center text-white sm:rounded-[62px] sm:px-14 sm:pb-[78px] sm:pt-[67px]">
            <Image src="/images/home/cta-glow.svg" alt="" aria-hidden="true" width={752} height={752} className="pointer-events-none absolute left-[calc(73.6%-182px)] top-[65px] h-[752px] w-[752px] max-w-none" />
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[0.01em] text-[#cc7654]">Partner with us</p>
              <h2 id="list-property-heading" className="mt-2 text-3xl font-bold tracking-[0.01em] sm:text-4xl lg:text-5xl">Ready to list your masterpiece?</h2>
              <p className="mx-auto mt-6 max-w-[633px] text-base leading-[22px] text-[#e8e4db] sm:text-lg">Exposure to high-net-worth individuals globally. List your property with the world&apos;s most sophisticated real estate marketplace.</p>
              <Link href="/marketplace" className="mt-8 inline-flex h-[69px] w-full max-w-[255px] items-center justify-center rounded-[33px] bg-[#cc7654] text-[22px] font-semibold text-white transition hover:bg-[#b66545] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Get Started Now</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
