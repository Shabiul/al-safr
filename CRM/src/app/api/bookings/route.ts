import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireStaffSession();
  if (error) return error;

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tourPackage: { select: { name: true } }, payments: true },
  });
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const { session, error } = await requireStaffSession();
  if (error) return error;

  const body = await request.json();
  const {
    customerName, customerEmail, customerPhone, serviceType, tourPackageId,
    details, travelDate, amount, currency, promoCodeId, notes,
  } = body;

  if (!customerName || !serviceType || amount == null) {
    return NextResponse.json({ error: 'customerName, serviceType and amount are required' }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        serviceType,
        tourPackageId: tourPackageId || null,
        details: details || null,
        travelDate: travelDate ? new Date(travelDate) : null,
        amount: Number(amount),
        currency: currency || 'USD',
        promoCodeId: promoCodeId || null,
        notes: notes || null,
        assignedToName: session.user?.name ?? 'Staff',
      },
    });

    if (promoCodeId) {
      await prisma.promoCode.update({ where: { id: promoCodeId }, data: { timesUsed: { increment: 1 } } });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create booking' }, { status: 500 });
  }
}
