import { NextResponse } from 'next/server';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';
import { CAR_RENTAL_COUNTRIES, CabLocation } from '@/services/cabData';

export const dynamic = 'force-dynamic';

const HOST = 'booking-com.p.rapidapi.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  if (!query) return NextResponse.json({ locations: [] });
  if (!hasRapidApiKey()) return NextResponse.json({ locations: [], error: 'RAPIDAPI_KEY not configured' });

  try {
    // The car-rental module's own location-search endpoint
    // (/v1/car-rental/locations) is broken on this provider (404s on every
    // query), so we geocode via the static cities list instead and filter
    // to countries the car-rental search actually supports.
    const res = await rapidApiFetch(
      `https://${HOST}/v1/static/cities?${new URLSearchParams({ name: query })}`,
      HOST,
      { cache: 'no-store', signal: AbortSignal.timeout(6000) }
    );
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ locations: [], error: json?.message || `HTTP ${res.status}` });

    const supported = new Set<string>(CAR_RENTAL_COUNTRIES);
    const seen = new Set<string>();
    const candidates: (CabLocation & { nrHotels: number })[] = [];

    for (const c of json?.result || []) {
      if (!supported.has(c.country)) continue;
      const key = `${c.name}-${c.country}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({
        name: c.name,
        country: c.country,
        latitude: parseFloat(c.latitude),
        longitude: parseFloat(c.longitude),
        nrHotels: c.nr_hotels ?? 0,
      });
    }

    // The provider returns matches in an arbitrary order (small towns whose
    // name merely contains the query can outrank the actual major city) —
    // nr_hotels is a reasonable proxy for "how significant is this place".
    candidates.sort((a, b) => b.nrHotels - a.nrHotels);
    const locations: CabLocation[] = candidates
      .slice(0, 8)
      .map((c) => ({ name: c.name, country: c.country, latitude: c.latitude, longitude: c.longitude }));

    return NextResponse.json({ locations });
  } catch (err: any) {
    return NextResponse.json({ locations: [], error: err?.message || 'Network error' });
  }
}
