'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentResultPage from '@/components/payment/PaymentResultPage';
import { CardSkeleton } from '@/components/ui/Skeleton';
function Confirmation() {
  const params = useSearchParams();
  const status = (params.get('status') || params.get('payment_status') || params.get('transaction_status') || '').toLowerCase();
  return <PaymentResultPage success={!['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(status)} />;
}
export default function ConfirmationPage() {
  return <Suspense fallback={<div className="bg-[#f7f5f1] px-5 py-10 sm:py-14"><CardSkeleton label="Loading reservation" /></div>}><Confirmation /></Suspense>;
}
