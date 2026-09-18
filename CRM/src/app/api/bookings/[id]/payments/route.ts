import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const { type, method, amount, reference, note } = await request.json();

  if (!type || !method || amount == null) {
    return NextResponse.json({ error: 'type, method and amount are required' }, { status: 400 });
  }

  const { data: record, error: dbError } = await db
    .from('PaymentRecord')
    .insert({
      id: crypto.randomUUID(),
      bookingId: id,
      type,
      method,
      amount: Number(amount),
      reference: reference || null,
      note: note || null,
      recordedBy: session.user?.name ?? 'Staff',
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message || 'Failed to record payment' }, { status: 500 });
  return NextResponse.json({ payment: record }, { status: 201 });
}
