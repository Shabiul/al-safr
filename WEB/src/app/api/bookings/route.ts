import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

async function resolveCustomerId(): Promise<string | null> {
  // Link to a registered Customer account when the buyer is logged in;
  // the booking still goes through for a guest with just contact details.
  const session = await auth();
  if (!session?.user?.email) return null;
  const { data: customer } = await db.from('Customer').select('id').eq('email', session.user.email).maybeSingle();
  return customer?.id ?? null;
}

function validateContact(body: any): string | null {
  if (!body.name || typeof body.name !== 'string') return 'name is required';
  if (!body.email || typeof body.email !== 'string') return 'email is required';
  if (!body.phone || typeof body.phone !== 'string') return 'phone is required';
  return null;
}

async function bookPackage(body: any) {
  const { tourPackageId, travelDate, travelers, name, email, phone, notes } = body;

  if (!tourPackageId || typeof tourPackageId !== 'string') {
    return NextResponse.json({ error: 'tourPackageId is required' }, { status: 400 });
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
  const customerId = await resolveCustomerId();

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

async function bookHotel(body: any) {
  const { hotelName, hotelAddress, checkinDate, checkoutDate, rooms, adults, priceUsd, name, email, phone, notes } = body;

  if (!hotelName || typeof hotelName !== 'string') {
    return NextResponse.json({ error: 'hotelName is required' }, { status: 400 });
  }
  if (!checkinDate || !checkoutDate) {
    return NextResponse.json({ error: 'checkinDate and checkoutDate are required' }, { status: 400 });
  }
  const roomCount = Number(rooms) || 1;
  const adultCount = Number(adults) || 1;
  // Booking.com's search API is read-only (no live "create booking" endpoint
  // available on this plan), so unlike tour packages there's no row in our
  // own DB to re-check the price against — the live search result is the
  // only source of truth, so we trust the client-supplied nightly rate here.
  const nights = Math.max(1, Math.round((new Date(checkoutDate).getTime() - new Date(checkinDate).getTime()) / 86400000));
  const nightlyRate = Number(priceUsd) || 0;
  const amount = nightlyRate * nights * roomCount;

  const customerId = await resolveCustomerId();

  const { data: booking, error } = await db
    .from('Booking')
    .insert({
      id: crypto.randomUUID(),
      customerId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceType: 'HOTEL',
      details: `${hotelName}${hotelAddress ? ` (${hotelAddress})` : ''} — ${roomCount} room${roomCount === 1 ? '' : 's'}, ${adultCount} guest${adultCount === 1 ? '' : 's'}, ${nights} night${nights === 1 ? '' : 's'}${notes ? ` — ${notes}` : ''}`,
      travelDate: new Date(checkinDate).toISOString(),
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

export async function POST(request: Request) {
  const body = await request.json();

  const contactError = validateContact(body);
  if (contactError) {
    return NextResponse.json({ error: contactError }, { status: 400 });
  }

  if (body.serviceType === 'HOTEL') {
    return bookHotel(body);
  }
  return bookPackage(body);
}
