'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentResultPage from '@/components/payment/PaymentResultPage';
function Confirmation() {
  const params = useSearchParams();
  const status = (params.get('status') || params.get('payment_status') || params.get('transaction_status') || '').toLowerCase();
  return <PaymentResultPage success={!['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(status)} />;
}
export default function ConfirmationPage() {
  return <Suspense fallback={<p className="p-10 text-center">Loading reservation…</p>}><Confirmation /></Suspense>;
}
