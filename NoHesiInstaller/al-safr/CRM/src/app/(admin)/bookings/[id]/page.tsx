import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import { BookingStatusControl } from '@/components/BookingStatusControl';
import { PaymentPanel } from '@/components/PaymentPanel';
import { DocumentsPanel } from '@/components/DocumentsPanel';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = { FLIGHT: 'Flight', HOTEL: 'Hotel', CAB: 'Cab', PACKAGE: 'Package' };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tourPackage: { select: { name: true } },
      promoCode: { select: { code: true } },
      payments: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!booking) notFound();

  return (
    <div className="space-y-6">
      <Link href="/bookings" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Back to bookings
      </Link>

      <div className="card p-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{booking.customerName}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {SERVICE_LABELS[booking.serviceType]}{booking.tourPackage ? ` · ${booking.tourPackage.name}` : ''}
            {booking.promoCode ? ` · Promo: ${booking.promoCode.code}` : ''}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
            {booking.customerEmail && <span>{booking.customerEmail}</span>}
            {booking.customerPhone && <span>{booking.customerPhone}</span>}
            {booking.travelDate && <span>Travel: {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          </div>
          {booking.details && <p className="text-sm text-slate-600 mt-2">{booking.details}</p>}
          {booking.notes && <p className="text-sm text-slate-500 mt-1 italic">Note: {booking.notes}</p>}
        </div>
        <div className="text-right space-y-2">
          <div className="text-2xl font-bold text-slate-900">${booking.amount.toFixed(2)}</div>
          <BookingStatusControl bookingId={booking.id} status={booking.status} />
          <p className="text-xs text-slate-400">Booked by {booking.assignedToName} · {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      <PaymentPanel
        bookingId={booking.id}
        payments={booking.payments.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
      />

      <DocumentsPanel
        bookingId={booking.id}
        documents={booking.documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
      />
    </div>
  );
}
