import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Plus } from 'lucide-react';
import { BookingStatusControl } from '@/components/BookingStatusControl';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = { FLIGHT: 'Flight', HOTEL: 'Hotel', CAB: 'Cab', PACKAGE: 'Package' };

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tourPackage: { select: { name: true } }, payments: true },
  });

  const totalPaid = (b: (typeof bookings)[number]) =>
    b.payments.reduce((sum, p) => sum + (p.type === 'PAYMENT' ? p.amount : -p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{bookings.length} bookings on record.</p>
        </div>
        <Link href="/bookings/new" className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20">
          <Plus className="w-4 h-4" />
          New booking
        </Link>
      </div>

      {bookings.length === 0 ? (
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
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/bookings/${b.id}`} className="font-medium text-slate-900 hover:text-brand-700">{b.customerName}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{SERVICE_LABELS[b.serviceType]}{b.tourPackage ? ` · ${b.tourPackage.name}` : ''}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-medium">${b.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-slate-500">${totalPaid(b).toFixed(2)}</td>
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
