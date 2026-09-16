import { NextResponse } from 'next/server';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  if (!query) return NextResponse.json({ airports: [] });

  if (!hasRapidApiKey()) return NextResponse.json({ airports: [], error: 'RAPIDAPI_KEY not configured' });

  try {
    const res = await rapidApiFetch(
      `https://google-flights4.p.rapidapi.com/auto-complete?query=${encodeURIComponent(query)}`,
      'google-flights4.p.rapidapi.com',
      { cache: 'no-store', signal: AbortSignal.timeout(6000) }
    );
    const json = await res.json();
    if (!res.ok || json?.status === false) {
      return NextResponse.json({ airports: [], error: json?.message || `HTTP ${res.status}` });
    }

    const airports: { code: string; name: string; city: string; country: string }[] = [];
    const seen = new Set<string>();

    for (const entry of json?.data || []) {
      const nearby = entry?.nearbyAirports || [];
      const isDirectAirportQuery = nearby.length === 0 && !!entry?.info?.code;
      // When the query itself is an IATA code (e.g. "LKO"), the API returns
      // the airport directly on `info` with an empty nearbyAirports list —
      // country there lives in `description` ("...in Lucknow, India"), not
      // `shortName` (which is the airport/terminal name for this shape).
      const candidates = isDirectAirportQuery ? [entry.info] : nearby.map((n: any) => n?.airport);
      const country = isDirectAirportQuery
        ? entry?.info?.description?.split(',').pop()?.trim() || ''
        : entry?.info?.shortName?.split(',').pop()?.trim() || '';

      for (const a of candidates) {
        if (!a?.code || seen.has(a.code)) continue;
        seen.add(a.code);
        airports.push({
          code: a.code,
          name: a.name || a.shortName || `${a.cityName} Airport`,
          city: a.cityName || entry?.info?.cityName || a.cityName,
          country,
        });
      }
    }

    return NextResponse.json({ airports });
  } catch (err: any) {
    return NextResponse.json({ airports: [], error: err?.message || 'Network error' });
  }
}
