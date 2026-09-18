import { prisma } from '@/lib/db';
import { BookingForm } from '@/components/BookingForm';

export const dynamic = 'force-dynamic';

export default async function NewBookingPage() {
  const [tourPackages, promoCodes] = await Promise.all([
    prisma.tourPackage.findMany({ where: { published: true }, select: { id: true, name: true, priceUsd: true }, orderBy: { name: 'asc' } }),
    prisma.promoCode.findMany({ where: { active: true }, select: { id: true, code: true }, orderBy: { code: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New booking</h1>
        <p className="text-slate-500 text-sm mt-1">Record a booking made over phone, walk-in, or from a converted lead.</p>
      </div>
      <BookingForm tourPackages={tourPackages} promoCodes={promoCodes} />
    </div>
  );
}
