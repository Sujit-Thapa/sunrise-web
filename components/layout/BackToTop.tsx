'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Appears once the visitor has scrolled down a screen or so; returns them to the top.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const scrollUp = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-5 z-40 grid size-12 place-items-center rounded-full bg-[#cc7654] text-white ring-1 ring-white/30 transition duration-200 hover:bg-[#b66545] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cc7654] sm:bottom-8 sm:right-8 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
