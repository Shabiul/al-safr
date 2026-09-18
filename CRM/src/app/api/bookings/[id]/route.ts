import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

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
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json({ booking });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const { status, notes } = await request.json();

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });
    return NextResponse.json({ booking });
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json({ error: err?.message || 'Failed to update booking' }, { status: 500 });
  }
}
