import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import { BookingStatusControl } from '@/components/BookingStatusControl';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = { FLIGHT: 'Flight', HOTEL: 'Hotel', CAB: 'Cab', PACKAGE: 'Package' };

export default async function BookingsPage() {
  const [{ data: bookings }, { data: tourPackages }, { data: payments }] = await Promise.all([
    db.from('Booking').select('*').order('createdAt', { ascending: false }),
    db.from('TourPackage').select('id, name'),
    db.from('PaymentRecord').select('bookingId, type, amount'),
  ]);

  const packageNameById = new Map((tourPackages ?? []).map((p) => [p.id, p.name]));
  const paidByBooking = new Map<string, number>();
  for (const p of payments ?? []) {
    const delta = p.type === 'PAYMENT' ? p.amount : -p.amount;
    paidByBooking.set(p.bookingId, (paidByBooking.get(p.bookingId) ?? 0) + delta);
  }

  const rows = bookings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} bookings on record.</p>
        </div>
        <Link href="/bookings/new" className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20">
          <Plus className="w-4 h-4" />
          New booking
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">No bookings yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Service</th>
                <th className="text-left px-5 py-3 font-medium">Travel date</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Paid</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/bookings/${b.id}`} className="font-medium text-slate-900 hover:text-brand-700">{b.customerName}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{SERVICE_LABELS[b.serviceType]}{b.tourPackageId && packageNameById.get(b.tourPackageId) ? ` · ${packageNameById.get(b.tourPackageId)}` : ''}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-medium">${b.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-slate-500">${(paidByBooking.get(b.id) ?? 0).toFixed(2)}</td>
                  <td className="px-5 py-3.5"><BookingStatusControl bookingId={b.id} status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
