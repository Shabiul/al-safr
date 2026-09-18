import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const { data: booking } = await db.from('Booking').select('*').eq('id', id).maybeSingle();
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const [{ data: payments }, { data: documents }] = await Promise.all([
    db.from('PaymentRecord').select('*').eq('bookingId', id).order('createdAt', { ascending: false }),
    db.from('Document').select('*').eq('bookingId', id).order('createdAt', { ascending: false }),
  ]);

  return NextResponse.json({ booking: { ...booking, payments: payments ?? [], documents: documents ?? [] } });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const { status, notes } = await request.json();

  const { data: booking, error: dbError } = await db
    .from('Booking')
    .update({
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json({ booking });
}
