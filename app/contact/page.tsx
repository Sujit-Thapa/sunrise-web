'use client';

import { useState } from 'react';

const contactDetails = [
  {
    label: "Address",
    value: "84 Meridian Ave, Suite 200\nCity, State 12345",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "(555) 123-4567",
    href: "tel:5551234567",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
      </svg>
    ),
  },
  {
    label: "Email",
    value: "info@sunriserealty.com",
    href: "mailto:info@sunriserealty.com",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    label: "Hours",
    value: "Mon–Fri: 9AM – 6PM\nSat: 10AM – 4PM\nSun: Closed",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="font-dm min-h-screen bg-white text-stone-900">
        <div className="max-w-6xl mx-auto px-10 py-28">

          {/* Header */}
          <div className="mb-20">
            <p className="text-[0.68rem] tracking-[0.22em] uppercase text-stone-400 mb-4">
              Sunrise Realty · Get in Touch
            </p>
            <h1 className="font-cormorant font-light text-[clamp(2.6rem,4.5vw,3.8rem)] leading-[1.08] text-stone-900 mb-5 tracking-tight">
              Let's find your<br />
              <em className="italic text-stone-500">next chapter.</em>
            </h1>
            <p className="text-[0.95rem] leading-relaxed text-stone-500 max-w-md font-light">
              Whether you're buying, selling, or simply exploring — our team is here to guide you with clarity and care.
            </p>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-12 md:gap-20 items-start">

            {/* Info */}
            <div className="flex flex-col">
              {contactDetails.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex gap-4 py-6 border-b border-stone-200 ${i === 0 ? 'border-t border-stone-200' : ''}`}
                >
                  <span className="text-stone-300 mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-[0.65rem] tracking-[0.18em] uppercase text-stone-400 mb-1.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-[0.9rem] leading-relaxed text-stone-700 whitespace-pre-line hover:text-stone-900 transition-colors no-underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[0.9rem] leading-relaxed text-stone-700 whitespace-pre-line">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white border border-stone-200 p-10">
              <h2 className="font-cormorant font-normal text-[1.6rem] text-stone-900 mb-8 tracking-wide">
                Send a message
              </h2>

              {submitted && (
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-5 py-4 mb-6 text-[0.85rem] text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                  Thank you — we'll be in touch shortly.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-[0.65rem] tracking-[0.16em] uppercase text-stone-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Jane Smith"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-stone-50 border border-stone-200 rounded-none px-4 py-3 font-dm font-light text-[0.9rem] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-[0.65rem] tracking-[0.16em] uppercase text-stone-400">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-stone-50 border border-stone-200 rounded-none px-4 py-3 font-dm font-light text-[0.9rem] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="email" className="text-[0.65rem] tracking-[0.16em] uppercase text-stone-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-stone-50 border border-stone-200 rounded-none px-4 py-3 font-dm font-light text-[0.9rem] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white w-full"
                  />
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="message" className="text-[0.65rem] tracking-[0.16em] uppercase text-stone-400">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about the property you're looking for, or how we can help…"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="bg-stone-50 border border-stone-200 rounded-none px-4 py-3 font-dm font-light text-[0.9rem] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white w-full resize-none min-h-[130px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-stone-900 text-stone-100 border-none py-4 font-dm font-light text-[0.75rem] tracking-[0.2em] uppercase cursor-pointer transition-colors hover:bg-stone-700 mt-2"
                >
                  Send Message →
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}