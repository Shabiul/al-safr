import { NextResponse } from 'next/server';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';
import { searchAirports } from '@/services/flightData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim() || '';

  // 1. Instant local search from comprehensive curated dataset
  const localMatches = searchAirports(query, 12).map((a) => ({
    code: a.code,
    name: a.name,
    city: a.city,
    country: a.country,
  }));

  // If no API key or we have sufficient high-quality local matches, return immediately
  if (!hasRapidApiKey() || localMatches.length >= 6) {
    return NextResponse.json({ airports: localMatches });
  }

  // 2. Supplement with Google Flights live auto-complete if key available
  try {
    const res = await rapidApiFetch(
      `https://google-flights4.p.rapidapi.com/auto-complete?query=${encodeURIComponent(query)}`,
      'google-flights4.p.rapidapi.com',
      { cache: 'no-store', signal: AbortSignal.timeout(4000) }
    );
    const json = await res.json();
    if (!res.ok || json?.status === false) {
      // RapidAPI quota exceeded or failed — return local matches safely
      return NextResponse.json({ airports: localMatches });
    }

    const airports = [...localMatches];
    const seen = new Set<string>(airports.map((a) => a.code.toUpperCase()));

    for (const entry of json?.data || []) {
      const nearby = entry?.nearbyAirports || [];
      const isDirectAirportQuery = nearby.length === 0 && !!entry?.info?.code;
      const candidates = isDirectAirportQuery ? [entry.info] : nearby.map((n: any) => n?.airport);
      const country = isDirectAirportQuery
        ? entry?.info?.description?.split(',').pop()?.trim() || ''
        : entry?.info?.shortName?.split(',').pop()?.trim() || '';

      for (const a of candidates) {
        if (!a?.code) continue;
        const codeUpper = a.code.toUpperCase();
        if (seen.has(codeUpper)) continue;
        seen.add(codeUpper);
        airports.push({
          code: codeUpper,
          name: a.name || a.shortName || `${a.cityName} Airport`,
          city: a.cityName || entry?.info?.cityName || a.cityName,
          country,
        });
      }
    }

    return NextResponse.json({ airports });
  } catch {
    // Network / timeout error — always fall back safely to local matches
    return NextResponse.json({ airports: localMatches });
  }
}

