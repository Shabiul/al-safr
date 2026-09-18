import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const { tourPackageId, travelDate, travelers, name, email, phone, notes } = body;

  if (!tourPackageId || typeof tourPackageId !== 'string') {
    return NextResponse.json({ error: 'tourPackageId is required' }, { status: 400 });
  }
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }
  if (!phone || typeof phone !== 'string') {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }
  if (!travelDate) {
    return NextResponse.json({ error: 'travelDate is required' }, { status: 400 });
  }
  const travelerCount = Number(travelers);
  if (!Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 20) {
    return NextResponse.json({ error: 'travelers must be a number between 1 and 20' }, { status: 400 });
  }

  const { data: pkg } = await db
    .from('TourPackage')
    .select('id, name, priceUsd, published')
    .eq('id', tourPackageId)
    .maybeSingle();
  if (!pkg || !pkg.published) {
    return NextResponse.json({ error: 'Tour package not found' }, { status: 404 });
  }

  // Pricing comes from the package row we just fetched, never from the
  // client — the amount shown in the booking modal is a preview only.
  const amount = pkg.priceUsd * travelerCount;

  // Link to a registered Customer account when the buyer is logged in;
  // the booking still goes through for a guest with just contact details.
  const session = await auth();
  let customerId: string | null = null;
  if (session?.user?.email) {
    const { data: customer } = await db.from('Customer').select('id').eq('email', session.user.email).maybeSingle();
    customerId = customer?.id ?? null;
  }

  const { data: booking, error } = await db
    .from('Booking')
    .insert({
      id: crypto.randomUUID(),
      customerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceType: 'PACKAGE',
      tourPackageId,
      details: `${travelerCount} traveler${travelerCount === 1 ? '' : 's'}${notes ? ` — ${notes}` : ''}`,
      travelDate: new Date(travelDate).toISOString(),
      amount,
      currency: 'USD',
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: error?.message || 'Failed to create booking' }, { status: 500 });
  }
  return NextResponse.json({ id: booking.id });
}
