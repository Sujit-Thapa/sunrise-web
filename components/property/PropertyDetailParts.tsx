'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Images, X, type LucideIcon } from 'lucide-react';
import { resolveImageSrcFromProperty } from '@/lib/image';

type GalleryImage = { id: string; url: string };

// Main photo plus three thumbnails (Figma "Property details"); the last thumbnail shows "+N" when
// more photos exist. Any photo opens the full-screen viewer at that photo.
export function PropertyGallery({ images, fallback, title }: { images: GalleryImage[]; fallback: Parameters<typeof resolveImageSrcFromProperty>[0]; title: string }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const thumbs = images.slice(1, 4);
  const hidden = images.length - 3;
  const open = (index: number) => { if (images.length) setViewerIndex(index); };

  return (
    <section aria-label="Property photos">
      <button type="button" onClick={() => open(0)} disabled={!images.length} aria-label={images.length ? `Open photo viewer (${images.length} photo${images.length === 1 ? '' : 's'})` : undefined} className="group relative block aspect-[660/402] w-full overflow-hidden rounded-2xl bg-[#e8e4db] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc7654] disabled:cursor-default">
        <Image src={resolveImageSrcFromProperty(images[0]?.url ?? fallback)} alt={title} fill priority sizes="(min-width: 1024px) 660px, 100vw" className="object-cover transition duration-500 group-enabled:group-hover:scale-[1.02]" />
        {images.length > 1 ? <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"><Images aria-hidden="true" className="h-3.5 w-3.5" />{images.length} photos</span> : null}
      </button>
      {thumbs.length ? (
        <div className="mt-12 grid grid-cols-3 gap-6">
          {thumbs.map((image, index) => {
            const more = index === 2 && hidden > 0 && images.length > 4;
            return (
              <button key={image.id} type="button" onClick={() => open(index + 1)} aria-label={more ? `View all ${images.length} photos` : `View photo ${index + 2}`} className="group relative aspect-[204/146] overflow-hidden rounded-[12.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc7654]">
                <Image src={resolveImageSrcFromProperty(image.url)} alt="" fill sizes="(min-width: 1024px) 204px, 30vw" className="object-cover transition duration-500 group-hover:scale-105" />
                {more ? <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-5xl uppercase text-white sm:text-[68px]">+{hidden}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {viewerIndex !== null ? <PhotoViewer images={images} title={title} index={viewerIndex} onIndexChange={setViewerIndex} onClose={() => setViewerIndex(null)} /> : null}
    </section>
  );
}

// Full-screen photo viewer over a blurred backdrop: arrows, keyboard (← → Esc), swipe and thumbnails.
function PhotoViewer({ images, title, index, onIndexChange, onClose }: { images: GalleryImage[]; title: string; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  const count = images.length;
  const go = useCallback((step: number) => onIndexChange((index + step + count) % count), [count, index, onIndexChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go]);

  // Keep the active thumbnail in view as the visitor moves through the photos.
  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  const arrow = 'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2a2723] shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-white';

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
      aria-label={`${title} photos`}
      className="fixed inset-0 m-0 h-svh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[rgba(29,27,24,0.6)] backdrop:backdrop-blur-md motion-safe:animate-[auth-pop_180ms_ease-out]"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-5 sm:px-10" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <div className="flex w-full max-w-[1100px] items-center justify-between text-white">
          <p className="truncate text-sm font-medium"><span className="tabular-nums">{index + 1} / {count}</span><span className="ml-3 hidden text-white/70 sm:inline">{title}</span></p>
          <button type="button" onClick={onClose} aria-label="Close photo viewer" className="grid size-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"><X className="h-5 w-5" /></button>
        </div>

        <div
          className="relative w-full max-w-[1100px] flex-1 touch-pan-y select-none"
          style={{ maxHeight: '74svh' }}
          onPointerDown={(event) => { swipeStart.current = event.clientX; }}
          onPointerUp={(event) => {
            if (swipeStart.current === null) return;
            const delta = event.clientX - swipeStart.current;
            swipeStart.current = null;
            if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
          }}
        >
          <Image key={images[index].id} src={resolveImageSrcFromProperty(images[index].url)} alt={`${title} — photo ${index + 1} of ${count}`} fill sizes="(min-width: 1100px) 1100px, 100vw" className="rounded-2xl object-contain motion-safe:animate-[auth-pop_200ms_ease-out]" draggable={false} />
          {count > 1 ? (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${arrow} left-2 sm:-left-5`}><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${arrow} right-2 sm:-right-5`}><ChevronRight className="h-5 w-5" /></button>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div ref={stripRef} className="flex w-full max-w-[1100px] justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
            {images.map((image, thumbIndex) => (
              <button key={image.id} type="button" data-index={thumbIndex} onClick={() => onIndexChange(thumbIndex)} aria-label={`Show photo ${thumbIndex + 1}`} aria-current={thumbIndex === index ? 'true' : undefined} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${thumbIndex === index ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}>
                <Image src={resolveImageSrcFromProperty(image.url)} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

export function DetailSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-4 text-xl font-bold text-[#2a2723]">{title}</h2>
      {children}
    </section>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(2,300px)]">{children}</div>;
}

export function DetailTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-h-[92px] items-center gap-3 rounded-xl border border-[#efe7de] bg-white p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#fff4f1] text-[#cc7654]"><Icon aria-hidden="true" size={20} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium capitalize tracking-[0.01em] text-[#989898]">{label}</p>
        <p className="mt-1 break-words text-base font-semibold text-[#2a2723]">{value}</p>
      </div>
    </div>
  );
}

export function DescriptionSection({ category, description }: { category: string; description: string }) {
  return (
    <DetailSection id="property-description" title={category === 'LAND' ? 'Plot Description' : 'Property Description'}>
      <p className="whitespace-pre-line break-words text-sm font-medium leading-[22px] text-[#989898]">{description}</p>
    </DetailSection>
  );
}

export function LocationMapSection({ title, query, exact }: { title: string; query: string; exact: boolean }) {
  return (
    <DetailSection id="property-map-heading" title="Location Map">
      {query ? (
        <>
          <div className="h-[300px] overflow-hidden rounded-xl border border-[#efe7de] bg-white">
            <iframe title={`Location of ${title}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-full w-full" />
          </div>
          {!exact ? <p className="mt-2 text-xs text-[#989898]">Showing the listed address. An exact property pin has not been provided.</p> : null}
          <a href={`https://www.google.com/maps?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-medium text-[#cc7654] hover:underline">Open in Google Maps</a>
        </>
      ) : (
        <p className="rounded-xl border border-[#efe7de] bg-white p-5 text-sm text-[#989898]">A location has not been provided for this property.</p>
      )}
    </DetailSection>
  );
}
