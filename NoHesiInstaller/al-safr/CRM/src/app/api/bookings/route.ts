import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { data: bookings, error: dbError } = await db.from('Booking').select('*').order('createdAt', { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
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

  const { data: booking, error: dbError } = await db
    .from('Booking')
    .insert({
      id: crypto.randomUUID(),
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      serviceType,
      tourPackageId: tourPackageId || null,
      details: details || null,
      travelDate: travelDate ? new Date(travelDate).toISOString() : null,
      amount: Number(amount),
      currency: currency || 'USD',
      promoCodeId: promoCodeId || null,
      notes: notes || null,
      assignedToName: session.user?.name ?? 'Staff',
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError || !booking) {
    return NextResponse.json({ error: dbError?.message || 'Failed to create booking' }, { status: 500 });
  }

  if (promoCodeId) {
    const { data: promo } = await db.from('PromoCode').select('timesUsed').eq('id', promoCodeId).maybeSingle();
    if (promo) {
      await db.from('PromoCode').update({ timesUsed: promo.timesUsed + 1, updatedAt: new Date().toISOString() }).eq('id', promoCodeId);
    }
  }

  return NextResponse.json({ booking }, { status: 201 });
}
