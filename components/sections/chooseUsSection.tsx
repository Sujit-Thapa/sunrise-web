const features = [
    {
        title: 'Find your home',
        body: 'Browse curated listings matched to your lifestyle and budget.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
    },
    {
        title: 'Meet an agent',
        body: 'Get paired with a local expert who negotiates on your behalf.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        title: 'Track progress',
        body: 'Real-time updates on offers, inspections, and closing steps.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
    {
        title: 'Secure closing',
        body: 'Payments held safely until delivery — refunded if anything falls through.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
];

export default function ServicesSection() {
    return (
        <section className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left — heading block */}
                <div>
                    <span className="inline-block border border-stone/30 text-stone text-xs font-normal uppercase tracking-widest px-4 py-1.5 rounded-brand-sm mb-6">
                        Our Services
                    </span>

                    <h2 className="text-4xl md:text-5xl font-bold text-ink leading-tight mb-6">
                        The smartest way<br />
                        to <span className="text-gold-primary">buy a home</span>
                    </h2>

                    <p className="text-base text-stone leading-relaxed max-w-xs">
                        Revolutionizing property ownership — search, connect, and close with
                        confidence in a trusted global network.
                    </p>
                </div>

                {/* Right — 2×2 card grid */}
                <div className="grid grid-cols-2 gap-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg border border-stone/20 hover:border-gold-primary rounded-brand-lg p-6 transition-all duration-250 group"
                        >
                            <div className="w-9 h-9 text-gold-primary mb-4 group-hover:text-gold-deep transition-colors duration-250">
                                {feature.icon}
                            </div>
                            <p className="text-base font-bold text-ink mb-1.5">{feature.title}</p>
                            <p className="text-sm text-stone leading-relaxed">{feature.body}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}