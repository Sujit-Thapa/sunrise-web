'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReservationDialog from '@/components/payment/ReservationDialog';
import { propertiesApi } from '@/lib/backend';
import type { PropertyResponseDto } from '@/types';

function Booking() {
  const params = useSearchParams();
  const propertyId = params.get('propertyId');
  const [property, setProperty] = useState<PropertyResponseDto | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!propertyId) return;
    let active = true;
    propertiesApi.findOne(propertyId).then(result => {
      if (!active) return;
      if (result.status !== 'ACTIVE') setError('This property is no longer available.');
      else setProperty(result);
    }).catch(() => { if (active) setError('This property is no longer available. Please browse current listings.'); });
    return () => { active = false; };
  }, [propertyId]);
  return <div className="min-h-[60vh] bg-[#f8f6f1] px-5 py-16 text-center text-[#2A2723]">
    <h1 className="text-3xl font-bold">Reserve a property</h1>
    <p className="mt-4 text-sm text-stone-500">{error || (property ? property.title : propertyId ? 'Loading property…' : 'Choose an available property to start your reservation.')}</p>
    {property ? <button onClick={() => setOpen(true)} className="mt-6 rounded-xl bg-[#ca7653] px-5 py-3 text-white">Reserve Property</button> : null}
    <Link href="/properties" className="mx-auto mt-5 block w-fit text-sm text-[#ca7653] underline">Browse Properties</Link>
    {property && open ? <ReservationDialog property={property} onClose={() => setOpen(false)} /> : null}
  </div>;
}
export default function BookingPage() {
  return <Suspense fallback={<p className="p-10 text-center">Loading booking…</p>}><Booking /></Suspense>;
}
