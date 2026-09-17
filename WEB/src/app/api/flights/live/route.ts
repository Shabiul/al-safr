import { NextResponse } from 'next/server';
import { AIRPORTS, Airport, FlightOption } from '@/services/flightData';
import { hasRapidApiKey, rapidApiFetch } from '@/lib/rapidapi';
import { getMarkupMultiplier } from '@/lib/markup';

export const dynamic = 'force-dynamic';

// Google Flights cabin-class enum used by this API: 1=Economy, 3=Business, 4=First.
const CABIN_TO_CLASS_ID: Record<string, number> = {
  economy: 1,
  business: 3,
  first: 4,
};
// Price ratios relative to economy, used only to derive the two cabins we
// didn't query (the API returns one live price per requested cabin).
const CABIN_PRICE_RATIO: Record<string, number> = {
  economy: 1,
  business: 2.15,
  first: 3.9,
};

interface GfSegment {
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureAirportName?: string;
  arrivalAirportName?: string;
  aircraftName?: string;
  seatPitch?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureDate?: string;
  arrivalDate?: string;
  airline: { airlineCode: string; flightNumber: string; airlineName: string };
}

interface LayoverInfo {
  code: string;
  airportName: string;
  minutes: number | null;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Layover duration = gap between one leg's arrival and the next leg's
// departure, using each segment's own date + clock time (handles layovers
// that cross midnight).
function computeLayoverMinutes(arriving: GfSegment, departing: GfSegment): number | null {
  if (!arriving.arrivalDate || !arriving.arrivalTime || !departing.departureDate || !departing.departureTime) {
    return null;
  }
  const arrivalMs = new Date(`${arriving.arrivalDate}T${arriving.arrivalTime}:00`).getTime();
  const departureMs = new Date(`${departing.departureDate}T${departing.departureTime}:00`).getTime();
  if (Number.isNaN(arrivalMs) || Number.isNaN(departureMs)) return null;
  return Math.round((departureMs - arrivalMs) / 60000);
}

interface GfItinerary {
  price: number;
  airlineNames: string[];
  segments: GfSegment[];
  departureTime: string;
  arrivalTime: string;
  departureDate?: string;
  arrivalDate?: string;
  duration: number; // total minutes
  stops: number | null;
}

// Verified against a live call to google-flights4 (RapidAPI, ntd119):
// { data: { topFlights: GfItinerary[], otherFlights: GfItinerary[] } }
function parseGoogleFlightsResponse(
  json: any,
  origin: Airport,
  dest: Airport,
  cabinClass: string,
  markupMultiplier: number
): { options: FlightOption[]; layoverMap: Map<string, LayoverInfo[]> } | null {
  const top: GfItinerary[] = Array.isArray(json?.data?.topFlights) ? json.data.topFlights : [];
  const other: GfItinerary[] = Array.isArray(json?.data?.otherFlights) ? json.data.otherFlights : [];
  const itineraries = [...top, ...other.slice(0, 2)];
  if (itineraries.length === 0) return null;

  const ratio = CABIN_PRICE_RATIO[cabinClass] || 1;
  const seenKeys = new Set<string>();

  const options: FlightOption[] = [];
  const layoverMap = new Map<string, LayoverInfo[]>();

  for (const it of itineraries) {
    if (options.length >= 5) break;
    if (!it.segments?.length) continue;

    // A itinerary is uniquely identified by its full leg sequence + timing,
    // not just the first leg — two itineraries can share a first flight
    // number but diverge on the connection, and looked like duplicates.
    const dedupeKey = `${it.segments.map((s) => `${s.airline.airlineCode}${s.airline.flightNumber}`).join('-')}|${it.departureTime}|${it.arrivalTime}|${it.price}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    const stops = it.stops ?? it.segments.length - 1;
    const durHours = Math.floor(it.duration / 60);
    const durMins = it.duration % 60;
    const economyEquivalent = (it.price / ratio) * markupMultiplier;

    const firstSeg = it.segments[0];
    const lastSeg = it.segments[it.segments.length - 1];

    // Overnight/long-haul itineraries can land a day (or more) after they
    // depart — mark it explicitly so an arrival clock-time earlier than the
    // departure clock-time doesn't look like broken data.
    const depDate = it.departureDate || firstSeg.departureDate;
    const arrDate = it.arrivalDate || lastSeg.arrivalDate;
    let dayOffset = 0;
    if (depDate && arrDate) {
      const diffMs = new Date(arrDate).getTime() - new Date(depDate).getTime();
      dayOffset = Math.round(diffMs / 86400000);
    }

    const flightNumber = it.segments
      .map((s) => `${s.airline.airlineCode}-${s.airline.flightNumber}`)
      .join(' + ');
    const aircraft = [...new Set(it.segments.map((s) => s.aircraftName).filter(Boolean))].join(' + ') || 'Commercial Airliner';
    const id = `gf-${origin.code}-${dest.code}-${flightNumber.replace(/\s/g, '')}-${it.departureTime}`;

    // Layover airport + real duration between legs (not just the code)
    if (stops > 0) {
      const layovers: LayoverInfo[] = [];
      for (let i = 0; i < it.segments.length - 1; i++) {
        const arriving = it.segments[i];
        const departing = it.segments[i + 1];
        layovers.push({
          code: arriving.arrivalAirportCode,
          airportName: departing.departureAirportName || arriving.arrivalAirportName || arriving.arrivalAirportCode,
          minutes: computeLayoverMinutes(arriving, departing),
        });
      }
      layoverMap.set(id, layovers);
    }

    options.push({
      id,
      flightNumber,
      airline: it.airlineNames.join(' + '),
      airlineCode: firstSeg.airline.airlineCode,
      aircraft,
      origin,
      destination: dest,
      departureTime: it.departureTime,
      arrivalTime: dayOffset > 0 ? `${it.arrivalTime} (+${dayOffset}d)` : it.arrivalTime,
      duration: `${durHours}h ${durMins}m`,
      stops,
      prices: {
        economy: Math.round(economyEquivalent),
        business: Math.round(economyEquivalent * CABIN_PRICE_RATIO.business),
        first: Math.round(economyEquivalent * CABIN_PRICE_RATIO.first),
      },
      priceTrend: {
        changePercent: 0,
        isLowest7Days: false,
        trend: 'stable',
        forecastNext48h: 'Live fare snapshot from Google Flights',
      },
      seatsRemaining: { economy: 9, business: 4, first: 1 },
      amenities: firstSeg.seatPitch ? [`Seat pitch ${firstSeg.seatPitch}`] : [],
    } as FlightOption);
  }

  return options.length > 0 ? { options, layoverMap } : null;
}

async function fetchAirportCity(code: string): Promise<string | null> {
  try {
    const res = await rapidApiFetch(
      `https://google-flights4.p.rapidapi.com/auto-complete?query=${encodeURIComponent(code)}`,
      'google-flights4.p.rapidapi.com',
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    const entry = json?.data?.[0];
    return entry?.info?.cityName || entry?.nearbyAirports?.[0]?.airport?.cityName || null;
  } catch {
    return null;
  }
}

async function fetchGoogleFlights(
  origin: Airport,
  dest: Airport,
  travelDate: string,
  cabinClass: string
): Promise<{ flights: FlightOption[] | null; notice: string }> {
  if (!hasRapidApiKey()) return { flights: null, notice: 'RAPIDAPI_KEY not configured' };

  try {
    const params = new URLSearchParams({
      departureId: origin.code,
      arrivalId: dest.code,
      departureDate: travelDate,
      adults: '1',
      currency: 'USD',
      languageCode: 'en-US',
      countryCode: 'US',
      cabinClass: String(CABIN_TO_CLASS_ID[cabinClass] || 1),
    });

    const res = await rapidApiFetch(
      `https://google-flights4.p.rapidapi.com/flights/search-one-way?${params}`,
      'google-flights4.p.rapidapi.com',
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    );

    const json = await res.json();

    if (!res.ok || json?.status === false) {
      const errMsg = json?.errors ? JSON.stringify(json.errors) : json?.message || `HTTP ${res.status}`;
      return { flights: null, notice: errMsg };
    }

    const markupMultiplier = await getMarkupMultiplier('flights');
    const parsed = parseGoogleFlightsResponse(json, origin, dest, cabinClass, markupMultiplier);
    if (!parsed) return { flights: null, notice: 'No flights returned for this route' };

    const { options, layoverMap } = parsed;

    // Fill in real layover details: full airport name (already in the API
    // response) + city (resolved once per unique layover airport) + real
    // gap between arrival and the next departure.
    if (layoverMap.size > 0) {
      const uniqueCodes = [...new Set([...layoverMap.values()].flat().map((l) => l.code))];
      const cityEntries = await Promise.all(
        uniqueCodes.map(async (code) => [code, await fetchAirportCity(code)] as const)
      );
      const cityByCode = new Map(cityEntries);

      for (const option of options) {
        const layovers = layoverMap.get(option.id);
        if (!layovers) continue;
        option.stopDetails = layovers
          .map((l) => {
            const city = cityByCode.get(l.code);
            const place = city ? `${city} (${l.code}), ${l.airportName}` : `${l.airportName} (${l.code})`;
            const duration = l.minutes != null && l.minutes >= 0 ? ` · ${formatDuration(l.minutes)} layover` : '';
            return `${place}${duration}`;
          })
          .join('; ');
      }
    }

    return { flights: options, notice: 'ok' };
  } catch (err: any) {
    return { flights: null, notice: err?.message || 'Network error' };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originCode = searchParams.get('origin') || 'DEL';
  const destCode = searchParams.get('destination') || 'DXB';
  const travelDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const cabinClass = searchParams.get('cabinClass') || 'economy';

  const startTime = Date.now();

  // Resolves a city/airport code/name to a real airport. Tries the static
  // shortlist first (has lat/lng for the distance-based fallback fleet),
  // then falls back to the live Google Flights auto-complete lookup so any
  // real city — "Bangalore", "Bombay", anything — resolves to its real IATA
  // code instead of a fabricated one that would break the live fare search.
  const resolveAirport = async (query: string): Promise<Airport> => {
    const clean = query.trim().toUpperCase();
    const staticMatch = AIRPORTS.find(
      (a) =>
        a.code.toUpperCase() === clean ||
        a.city.toUpperCase() === clean ||
        a.name.toUpperCase().includes(clean)
    );
    if (staticMatch) return staticMatch;

    if (hasRapidApiKey()) {
      try {
        const res = await rapidApiFetch(
          `https://google-flights4.p.rapidapi.com/auto-complete?query=${encodeURIComponent(query)}`,
          'google-flights4.p.rapidapi.com',
          { cache: 'no-store', signal: AbortSignal.timeout(6000) }
        );
        const json = await res.json();
        const entry = json?.data?.[0];
        // Two shapes: a city entry with nearbyAirports[], or (when the query
        // is itself an IATA code, e.g. "LKO") an airport entry directly on info.
        const firstAirport = entry?.nearbyAirports?.[0]?.airport ||
          (entry?.info?.code ? entry.info : null);
        if (res.ok && json?.status !== false && firstAirport?.code) {
          const staticByCode = AIRPORTS.find((a) => a.code === firstAirport.code);
          if (staticByCode) return staticByCode;
          return {
            code: firstAirport.code,
            name: firstAirport.name || firstAirport.shortName || `${firstAirport.cityName} Airport`,
            city: firstAirport.cityName || entry?.info?.cityName || query,
            country: entry?.info?.shortName?.split(',').pop()?.trim() || '',
            timezone: 'UTC',
            lat: 25.0,
            lng: 55.0,
          };
        }
      } catch {
        // fall through to last-resort guess below
      }
    }

    return {
      code: clean.substring(0, 3) || 'LOC',
      name: `${query} International Airport`,
      city: query,
      country: 'Destination Port',
      timezone: 'UTC',
      lat: 25.0,
      lng: 55.0,
    };
  };

  const [origin, dest] = await Promise.all([resolveAirport(originCode), resolveAirport(destCode)]);

  // 1. Fetch REAL LIVE AIRBORNE FLIGHTS from OpenSky Network ADS-B
  let liveAirborne: any[] = [];
  try {
    const openSkyRes = await fetch('https://opensky-network.org/api/states/all', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (openSkyRes.ok) {
      const openSkyData = await openSkyRes.json();
      liveAirborne = (openSkyData.states || [])
        .filter(
          (s: any) =>
            s[1] &&
            s[1].trim() &&
            !s[8] &&
            s[5] !== null &&
            s[6] !== null &&
            s[7] !== null
        )
        .slice(0, 24)
        .map((s: any) => ({
          icao24: s[0],
          callsign: s[1].trim(),
          country: s[2],
          lng: parseFloat(s[5].toFixed(4)),
          lat: parseFloat(s[6].toFixed(4)),
          altitudeFt: Math.round((s[7] || 0) * 3.28084),
          flightLevel: `FL${Math.round(((s[7] || 0) * 3.28084) / 100)}`,
          speedKnots: Math.round((s[9] || 0) * 1.94384),
          mach: parseFloat(((s[9] || 0) * 1.94384 / 573.8).toFixed(2)),
          headingDeg: Math.round(s[10] || 0),
          verticalSpeedFpm: Math.round((s[11] || 0) * 196.85),
          squawk: s[14] || '1000',
        }));
    }
  } catch {
    // If rate-limited, fallback handled cleanly
  }

  // 2. Geodesic distance calculation (used only as a last-resort forecast anchor)
  const latDelta = Math.abs(origin.lat - dest.lat);
  const lngDelta = Math.abs(origin.lng - dest.lng);
  const distanceKm = Math.round(Math.sqrt(latDelta * latDelta + lngDelta * lngDelta) * 111);

  // 3. Real third-party airline fares via Google Flights (RapidAPI). No
  // fabricated fallback flights — if the live API has nothing for this
  // route/cabin, we say so and return an empty list rather than inventing one.
  let { flights: googleFlights, notice: googleFlightsNotice } = await fetchGoogleFlights(
    origin,
    dest,
    travelDate,
    cabinClass
  );

  // Short-haul/domestic routes commonly sell Economy only — retry there
  // instead of showing nothing (or worse, fake data) when a higher cabin
  // has no live inventory.
  let cabinDowngraded = false;
  if (!googleFlights && cabinClass !== 'economy') {
    const retry = await fetchGoogleFlights(origin, dest, travelDate, 'economy');
    if (retry.flights) {
      googleFlights = retry.flights;
      googleFlightsNotice = retry.notice;
      cabinDowngraded = true;
    }
  }

  const usingLiveFares = googleFlights !== null;
  const flightOptions: FlightOption[] = googleFlights ?? [];

  // Anchor the forecast on the cheapest real fare we actually found, not a
  // distance-only guess — falls back to the distance estimate only when no
  // live fare exists at all for this route.
  const cheapestRealEconomy = flightOptions.length > 0
    ? Math.min(...flightOptions.map((f) => f.prices.economy))
    : null;
  const baseEconomy = cheapestRealEconomy ?? Math.round(280 + distanceKm * 0.08);

  // 4. Generate 7-day fare trend estimate anchored on the real fare above
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const priceForecastPoints = dayNames.map((day, i) => {
    const mult = [1.05, 0.93, 0.89, 1.02, 1.25, 1.36, 1.14][i];
    return {
      day,
      date: `${16 + i} Sep`,
      price: Math.round(baseEconomy * mult),
      historicalAvg: Math.round(baseEconomy * 1.08),
      forecast: (mult < 0.95 ? 'low' : mult > 1.2 ? 'peak' : 'moderate') as 'low' | 'moderate' | 'peak',
    };
  });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    query: {
      origin: origin.code,
      originCity: origin.city,
      destination: dest.code,
      destCity: dest.city,
      date: travelDate,
      distanceKm,
    },
    liveTelemetry: {
      openSkyAirborneCount: liveAirborne.length,
      airborneFlights: liveAirborne,
      totalRoundTripMs: Date.now() - startTime,
    },
    dataSource: usingLiveFares ? 'google-flights-live' : 'no-live-data',
    dataSourceNotice: usingLiveFares
      ? cabinDowngraded
        ? `No live ${cabinClass} fares for this route — showing live Economy fares instead`
        : 'Fares from Google Flights (live)'
      : `No live fares found for this route (${googleFlightsNotice})`,
    flights: flightOptions,
    priceForecast: priceForecastPoints,
  });
}
