'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    window.setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400&family=DM+Sans:wght@300;400;500&display=swap');.font-cormorant{font-family:'Cormorant Garamond',serif}.font-dm{font-family:'DM Sans',sans-serif}`}</style>
      <div className="min-h-screen bg-white font-dm text-stone-900">
        <div className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
          {/* Heading */}
          <div className="mb-12 text-center">
            <h1 className="mb-3 font-cormorant text-[clamp(2rem,4vw,2.8rem)] font-normal tracking-tight text-stone-900">
              Get in touch
            </h1>
            <p className="text-[0.9rem] font-light text-stone-500">
              Have a question or want to schedule a viewing? Send us a message.
            </p>
          </div>

          {/* Quick contact info, inline */}
          <div className="mb-12 flex flex-col items-center gap-3 text-[0.85rem] text-stone-600 sm:flex-row sm:justify-center sm:gap-6">
            <a href="mailto:info@sunrisembh.com" className="flex items-center gap-2 transition hover:text-[#B89B4E]">
              <Mail className="h-4 w-4 text-[#B89B4E]" />
              info@sunrisembh.com
            </a>
            <a href="tel:5551234567" className="flex items-center gap-2 transition hover:text-[#B89B4E]">
              <Phone className="h-4 w-4 text-[#B89B4E]" />
              (555) 123-4567
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#B89B4E]" />
              84 Meridian Ave, Suite 200
            </span>
          </div>

          {/* Form */}
          {submitted && (
            <div className="mb-6 flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-5 py-4 text-[0.85rem] text-stone-600">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#B89B4E]" />
              Thank you — we&apos;ll be in touch shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#B89B4E] focus:bg-white"
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#B89B4E] focus:bg-white"
            />
            <textarea
              name="message"
              placeholder="How can we help?"
              value={formData.message}
              onChange={handleChange}
              required
              className="min-h-[120px] w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[0.9rem] text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#B89B4E] focus:bg-white"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-stone-900 py-3.5 text-[0.8rem] font-medium uppercase tracking-[0.15em] text-stone-100 transition-colors hover:bg-[#B89B4E]"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
}