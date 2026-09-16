import { NextResponse } from 'next/server';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';

export const dynamic = 'force-dynamic';

const HOST = 'booking-com.p.rapidapi.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  if (!query) return NextResponse.json({ locations: [] });
  if (!hasRapidApiKey()) return NextResponse.json({ locations: [], error: 'RAPIDAPI_KEY not configured' });

  try {
    const res = await rapidApiFetch(
      `https://${HOST}/v1/hotels/locations?${new URLSearchParams({ name: query, locale: 'en-gb' })}`,
      HOST,
      { cache: 'no-store', signal: AbortSignal.timeout(6000) }
    );
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ locations: [], error: json?.message || `HTTP ${res.status}` });

    const locations = (Array.isArray(json) ? json : []).map((l: any) => ({
      destId: l.dest_id,
      destType: l.dest_type,
      name: l.name,
      label: l.label,
      country: l.country,
      hotelCount: l.nr_hotels ?? 0,
    }));

    return NextResponse.json({ locations });
  } catch (err: any) {
    return NextResponse.json({ locations: [], error: err?.message || 'Network error' });
  }
}
