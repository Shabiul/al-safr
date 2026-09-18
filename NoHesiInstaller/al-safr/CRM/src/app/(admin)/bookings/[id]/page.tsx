import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import { BookingStatusControl } from '@/components/BookingStatusControl';
import { PaymentPanel } from '@/components/PaymentPanel';
import { DocumentsPanel } from '@/components/DocumentsPanel';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = { FLIGHT: 'Flight', HOTEL: 'Hotel', CAB: 'Cab', PACKAGE: 'Package' };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: booking } = await db.from('Booking').select('*').eq('id', id).maybeSingle();
  if (!booking) notFound();

  const [{ data: tourPackage }, { data: promoCode }, { data: payments }, { data: documents }] = await Promise.all([
    booking.tourPackageId
      ? db.from('TourPackage').select('name').eq('id', booking.tourPackageId).maybeSingle()
      : Promise.resolve({ data: null }),
    booking.promoCodeId
      ? db.from('PromoCode').select('code').eq('id', booking.promoCodeId).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from('PaymentRecord').select('*').eq('bookingId', id).order('createdAt', { ascending: false }),
    db.from('Document').select('*').eq('bookingId', id).order('createdAt', { ascending: false }),
  ]);

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
            {SERVICE_LABELS[booking.serviceType]}{tourPackage ? ` · ${tourPackage.name}` : ''}
            {promoCode ? ` · Promo: ${promoCode.code}` : ''}
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

      <PaymentPanel bookingId={booking.id} payments={payments ?? []} />

      <DocumentsPanel bookingId={booking.id} documents={documents ?? []} />
    </div>
  );
}
