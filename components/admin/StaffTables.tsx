'use client';

import type { FinancePaymentResponseDto, PropertyResponseDto, ReservationResponseDto } from '@/types';
import { formatDay, formatNpr, StatusPill, tableHead } from './staff-ui';

const shortId = (prefix: string, id: string) => `${prefix}-${id.slice(-5).toUpperCase()}`;
const providerLabel: Record<string, string> = { ESEWA: 'eSewa', KHALTI: 'Khalti', CONNECTIPS: 'ConnectIPS' };

export function ReservationsTable({ reservations, properties = [], empty = 'No reservations yet.' }: { reservations: ReservationResponseDto[]; properties?: PropertyResponseDto[]; empty?: string }) {
  if (!reservations.length) return <p className="border-t border-[#ebe7e0] px-5 py-12 text-center text-sm text-[#77726b]">{empty}</p>;
  const cityOf = (id: string) => properties.find((property) => property.id === id)?.city;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className={tableHead}><tr><th className="px-5 py-3">Reservation</th><th className="px-3 py-3">Property</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Amount</th><th className="px-5 py-3 text-center">Status</th></tr></thead>
        <tbody className="divide-y divide-[#ebe7e0] border-t border-[#ebe7e0]">
          {reservations.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap px-5 py-4 text-[#2a2723]">{shortId('R', item.id)}</td>
              <td className="max-w-[160px] px-3 py-4"><p className="line-clamp-2 font-semibold text-[#2a2723]">{item.property.title}</p>{cityOf(item.property.id) ? <p className="mt-0.5 text-[11px] text-[#77726b]">{cityOf(item.property.id)}</p> : null}</td>
              <td className="px-3 py-4 text-[#4b4740]">{item.userNameSnapshot}</td>
              <td className="whitespace-nowrap px-3 py-4 text-[#77726b]">{formatDay(item.createdAt)}</td>
              <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#2a2723]">{formatNpr(item.reservationFeeAmount)}</td>
              <td className="px-5 py-4 text-center"><StatusPill status={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PaymentsTable({ payments, empty = 'No payments yet.' }: { payments: FinancePaymentResponseDto[]; empty?: string }) {
  if (!payments.length) return <p className="border-t border-[#ebe7e0] px-5 py-12 text-center text-sm text-[#77726b]">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className={tableHead}><tr><th className="px-5 py-3">Payment</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Provider</th><th className="px-3 py-3">Paid</th><th className="px-3 py-3">Amount</th><th className="px-5 py-3 text-center">Status</th></tr></thead>
        <tbody className="divide-y divide-[#ebe7e0] border-t border-[#ebe7e0]">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="whitespace-nowrap px-5 py-4 text-[#2a2723]">{shortId('PY', payment.id)}</td>
              <td className="px-3 py-4 text-[#4b4740]">{payment.user?.fullName ?? '—'}</td>
              <td className="px-3 py-4 text-[#77726b]">{providerLabel[payment.provider?.toUpperCase()] ?? payment.provider}</td>
              <td className="whitespace-nowrap px-3 py-4 text-[#77726b]">{formatDay(payment.succeededAt ?? payment.createdAt, true)}</td>
              <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#2a2723]">{formatNpr(payment.amount)}</td>
              <td className="px-5 py-4 text-center"><StatusPill status={payment.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
