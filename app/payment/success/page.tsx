'use client';

import { Suspense } from 'react';
import PaymentResultPage from '@/components/payment/PaymentResultPage';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function PaymentSuccessPage() {
  return <Suspense fallback={<PaymentLoading />}><PaymentResultPage success /></Suspense>;
}

function PaymentLoading() {
  return <div className="bg-[#f7f5f1] px-5 py-10 sm:py-14"><CardSkeleton label="Checking your payment" /></div>;
}
