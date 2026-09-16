import { NextResponse } from 'next/server';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';
import { HotelOption } from '@/services/hotelData';
import { CURRENCIES, CurrencyCode } from '@/services/flightData';

export const dynamic = 'force-dynamic';

const HOST = 'booking-com.p.rapidapi.com';

// Booking.com's `filter_by_currency` param is a display hint only — it
// actually always returns the hotel's local currency (see their own FAQ).
// Convert to a genuine USD figure so downstream price filtering/formatting
// (which assumes `priceUsd` really is USD) isn't comparing INR against a
// USD threshold. Unrecognized currencies pass through unconverted rather
// than silently dropping the price.
function toUsd(amount: number, currencyCode: string | undefined): number {
  const rate = currencyCode ? CURRENCIES[currencyCode as CurrencyCode]?.rate : undefined;
  return rate ? amount / rate : amount;
}

async function resolveDestination(name: string): Promise<{ dest_id: string; dest_type: string } | null> {
  const res = await rapidApiFetch(
    `https://${HOST}/v1/hotels/locations?${new URLSearchParams({ name, locale: 'en-gb' })}`,
    HOST,
    { cache: 'no-store', signal: AbortSignal.timeout(6000) }
  );
  const json = await res.json();
  const first = Array.isArray(json) ? json[0] : null;
  if (!first?.dest_id) return null;
  return { dest_id: first.dest_id, dest_type: first.dest_type };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination')?.trim();
  const destIdParam = searchParams.get('destId');
  const destTypeParam = searchParams.get('destType');
  const checkinDate = searchParams.get('checkinDate');
  const checkoutDate = searchParams.get('checkoutDate');
  const adults = searchParams.get('adults') || '2';
  const rooms = searchParams.get('rooms') || '1';

  if ((!destination && !destIdParam) || !checkinDate || !checkoutDate) {
    return NextResponse.json({ hotels: [], error: 'destination, checkinDate and checkoutDate are required' }, { status: 400 });
  }
  if (!hasRapidApiKey()) {
    return NextResponse.json({ hotels: [], error: 'RAPIDAPI_KEY not configured' });
  }

  try {
    // A destination picked from the autocomplete dropdown already carries its
    // exact dest_id/dest_type — resolving by name again could match a
    // different place with the same name.
    const dest = destIdParam && destTypeParam
      ? { dest_id: destIdParam, dest_type: destTypeParam }
      : await resolveDestination(destination!);
    if (!dest) {
      return NextResponse.json({ hotels: [], error: `No destination found for "${destination}"` });
    }

    const params = new URLSearchParams({
      locale: 'en-gb',
      dest_id: dest.dest_id,
      dest_type: dest.dest_type,
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      room_number: rooms,
      adults_number: adults,
      filter_by_currency: 'USD',
      order_by: 'popularity',
      units: 'metric',
    });

    const res = await rapidApiFetch(
      `https://${HOST}/v1/hotels/search?${params}`,
      HOST,
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    );
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ hotels: [], error: json?.message || `HTTP ${res.status}` });
    }

    // The result array also carries non-hotel banner/ranking-disclosure
    // entries with no hotel_id — filter those out.
    const results: any[] = (json?.result || []).filter((h: any) => h.hotel_id);
    const hotels: HotelOption[] = results.map((h) => ({
      id: String(h.hotel_id),
      name: h.hotel_name || h.hotel_name_trans || 'Unnamed Hotel',
      address: h.address || '',
      city: h.city || destination || '',
      stars: h.class || 0,
      reviewScore: typeof h.review_score === 'number' ? h.review_score : null,
      reviewCount: h.review_nr ?? null,
      priceUsd:
        h.min_total_price != null
          ? toUsd(h.min_total_price, h.currency_code)
          : h.composite_price_breakdown?.gross_amount?.value != null
            ? toUsd(h.composite_price_breakdown.gross_amount.value, h.composite_price_breakdown.gross_amount.currency)
            : null,
      photoUrl: h.max_photo_url || h.main_photo_url || null,
      distanceToCenterKm: typeof h.distance_to_cc === 'number' ? h.distance_to_cc : null,
      bookingUrl: h.url || `https://www.booking.com/hotel/${h.hotel_id}.html`,
    }));

    return NextResponse.json({ hotels, destination: dest });
  } catch (err: any) {
    return NextResponse.json({ hotels: [], error: err?.message || 'Network error' });
  }
}
