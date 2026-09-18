import { db } from '@/lib/db';
import { BookingForm } from '@/components/BookingForm';

export const dynamic = 'force-dynamic';

export default async function NewBookingPage() {
  const [{ data: tourPackages }, { data: promoCodes }] = await Promise.all([
    db.from('TourPackage').select('id, name, priceUsd').eq('published', true).order('name', { ascending: true }),
    db.from('PromoCode').select('id, code').eq('active', true).order('code', { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New booking</h1>
        <p className="text-slate-500 text-sm mt-1">Record a booking made over phone, walk-in, or from a converted lead.</p>
      </div>
      <BookingForm tourPackages={tourPackages ?? []} promoCodes={promoCodes ?? []} />
    </div>
  );
}
