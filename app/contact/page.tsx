'use client';

import { useState } from 'react';

const contactDetails = [
  { label: 'Address', value: '84 Meridian Ave, Suite 200\nCity, State 12345', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  { label: 'Phone', value: '(555) 123-4567', href: 'tel:5551234567', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg> },
  { label: 'Email', value: 'info@sunriserealty.com', href: 'mailto:info@sunriserealty.com', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
  { label: 'Hours', value: 'Mon–Fri: 9AM – 6PM\nSat: 10AM – 4PM\nSun: Closed', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
];

const inputClass = 'w-full rounded-none border border-stone-200 bg-stone-50 px-4 py-3 font-dm text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-300 focus:border-stone-400 focus:bg-white';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    window.setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');.font-cormorant{font-family:'Cormorant Garamond',serif}.font-dm{font-family:'DM Sans',sans-serif}`}</style>
      <div className="min-h-screen bg-white font-dm text-stone-900">
        <div className="mx-auto max-w-6xl px-10 py-28">
          <div className="mb-20">
            <p className="mb-4 text-[0.68rem] uppercase tracking-[0.22em] text-stone-400">Sunrise Realty · Get in Touch</p>
            <h1 className="mb-5 font-cormorant text-[clamp(2.6rem,4.5vw,3.8rem)] font-light leading-[1.08] tracking-tight text-stone-900">
              Let's find your<br />
              <em className="italic text-stone-500">next chapter.</em>
            </h1>
            <p className="max-w-md text-[0.95rem] font-light leading-relaxed text-stone-500">
              Whether you're buying, selling, or simply exploring — our team is here to guide you with clarity and care.
            </p>
          </div>

          <div className="grid items-start gap-12 md:grid-cols-[1fr_1.6fr] md:gap-20">
            <div className="flex flex-col">
              {contactDetails.map((item, i) => (
                <div key={item.label} className={`flex gap-4 border-b border-stone-200 py-6 ${i === 0 ? 'border-t' : ''}`}>
                  <span className="mt-0.5 shrink-0 text-stone-300">{item.icon}</span>
                  <div>
                    <p className="mb-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="whitespace-pre-line text-[0.9rem] leading-relaxed text-stone-700 no-underline transition-colors hover:text-stone-900">{item.value}</a>
                    ) : (
                      <p className="whitespace-pre-line text-[0.9rem] leading-relaxed text-stone-700">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-stone-200 bg-white p-10">
              <h2 className="mb-8 font-cormorant text-[1.6rem] font-normal tracking-wide text-stone-900">Send a message</h2>
              {submitted && (
                <div className="mb-6 flex items-center gap-3 border border-stone-200 bg-stone-50 px-5 py-4 text-[0.85rem] text-stone-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                  Thank you — we'll be in touch shortly.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-stone-400">
                    Full Name
                    <input type="text" id="name" name="name" placeholder="Jane Smith" value={formData.name} onChange={handleChange} required className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-stone-400">
                    Phone
                    <input type="tel" id="phone" name="phone" placeholder="(555) 000-0000" value={formData.phone} onChange={handleChange} className={inputClass} />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-stone-400">
                  Email Address
                  <input type="email" id="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleChange} required className={inputClass} />
                </label>
                <label className="flex flex-col gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-stone-400">
                  Message
                  <textarea id="message" name="message" placeholder="Tell us about the property you're looking for, or how we can help…" value={formData.message} onChange={handleChange} required className={`${inputClass} min-h-[130px] resize-none`} />
                </label>
                <button type="submit" className="mt-2 w-full border-none bg-stone-900 py-4 text-[0.75rem] font-light uppercase tracking-[0.2em] text-stone-100 transition-colors hover:bg-stone-700">
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
