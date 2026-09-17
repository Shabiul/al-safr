import { NextResponse } from 'next/server';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';
import { CAR_RENTAL_COUNTRIES, CabOption } from '@/services/cabData';
import { getMarkupMultiplier } from '@/lib/markup';

export const dynamic = 'force-dynamic';

const HOST = 'booking-com.p.rapidapi.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const country = searchParams.get('country');
  const pickupDateTime = searchParams.get('pickupDateTime');
  const dropoffDateTime = searchParams.get('dropoffDateTime');

  if (!latitude || !longitude || !country || !pickupDateTime || !dropoffDateTime) {
    return NextResponse.json(
      { cabs: [], error: 'latitude, longitude, country, pickupDateTime and dropoffDateTime are required' },
      { status: 400 }
    );
  }
  if (!(CAR_RENTAL_COUNTRIES as readonly string[]).includes(country)) {
    return NextResponse.json({ cabs: [], error: `Car rental isn't available in this location yet` });
  }
  if (!hasRapidApiKey()) {
    return NextResponse.json({ cabs: [], error: 'RAPIDAPI_KEY not configured' });
  }

  try {
    const params = new URLSearchParams({
      locale: 'en-gb',
      currency: 'USD',
      sort_by: 'recommended',
      from_country: country,
      pick_up_latitude: latitude,
      pick_up_longitude: longitude,
      pick_up_datetime: pickupDateTime,
      drop_off_latitude: latitude,
      drop_off_longitude: longitude,
      drop_off_datetime: dropoffDateTime,
    });

    const res = await rapidApiFetch(
      `https://${HOST}/v1/car-rental/search?${params}`,
      HOST,
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    );
    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json?.detail) ? json.detail[0]?.msg : json?.message || `HTTP ${res.status}`;
      return NextResponse.json({ cabs: [], error: errMsg });
    }

    const items: any[] = json?.content?.items || [];
    const markupMultiplier = await getMarkupMultiplier('cabs');
    const cabs: CabOption[] = items
      .filter((item) => item.type === 'CAR_CARD')
      .map((item) => {
        const c = item.content;
        const transmissionSpec = (c.vehicleSpecs || []).find((s: any) => String(s.icon).startsWith('TRANSMISSION_'));
        const priceMatch = String(c.pricing?.finalPriceDisplay || '').match(/[\d,.]+/);
        const rawPrice = priceMatch ? Number(priceMatch[0].replace(/,/g, '')) : null;
        return {
          id: String(c.metadata?.vehicleId ?? crypto.randomUUID()),
          name: c.title || 'Rental car',
          subtitle: c.subtitle || '',
          imageUrl: c.imageUrl || null,
          specs: c.specs || '',
          transmission: transmissionSpec?.text || null,
          supplierName: c.supplier?.name || 'Unknown supplier',
          supplierRating: c.supplier?.rating?.score ? Number(c.supplier.rating.score) : null,
          pickupLocationLabel: c.location?.pickup?.location || '',
          freeCancellation: (c.badges || []).some((b: any) => b.id?.includes('free-cancellation')),
          priceUsd: rawPrice != null ? rawPrice * markupMultiplier : null,
        };
      });

    return NextResponse.json({ cabs });
  } catch (err: any) {
    return NextResponse.json({ cabs: [], error: err?.message || 'Network error' });
  }
}
