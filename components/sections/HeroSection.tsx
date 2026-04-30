export default function HeroSection({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <section className="bg-blush text-ink py-24">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <h1 className="text-5xl font-bold">{title}</h1>
        {subtitle && <p className="text-xl mt-4">{subtitle}</p>}
      </div>
    </section>
  )
}
