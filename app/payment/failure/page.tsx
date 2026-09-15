'use client';

import { Suspense } from 'react';
import PaymentResultPage from '@/components/payment/PaymentResultPage';

export default function PaymentFailurePage() {
  return <Suspense fallback={<PaymentLoading />}><PaymentResultPage success={false} /></Suspense>;
}

function PaymentLoading() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] text-sm text-slate-500">Checking your payment...</main>;
}
