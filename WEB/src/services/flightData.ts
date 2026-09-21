export type { Airport } from './airportsData';
export { AIRPORTS, POPULAR_AIRPORTS, searchAirports, findAirport } from './airportsData';
import { Airport, findAirport } from './airportsData';

export interface LiveFlightTelemetry {
  flightNumber: string;
  callsign: string;
  aircraft: string;
  // Route/schedule/fuel are only known for the demo fleet — OpenSky's
  // ADS-B feed gives position/velocity only, no filed route or fuel state.
  origin?: Airport;
  destination?: Airport;
  altitudeFt: number;
  flightLevel: string; // e.g. "FL380"
  speedKnots: number;
  mach: number;
  headingDeg: number;
  verticalSpeedFpm: number;
  progressPercent?: number;
  departureTimeUtc?: string;
  estimatedArrivalUtc?: string;
  status: 'EN ROUTE' | 'CLIMBING' | 'CRUISING' | 'DESCENDING' | 'APPROACH';
  lat: number;
  lng: number;
  fuelRemainingKg?: number;
  squawk: string;
  telemetrySignalDb: number;
}

export interface FlightOption {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode?: string;
  aircraft: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  prices: {
    economy: number;
    business: number;
    first: number;
  };
  priceTrend: {
    changePercent: number;
    isLowest7Days: boolean;
    trend: 'rising' | 'falling' | 'stable';
    forecastNext48h: string;
  };
  carbonOffsetKg: number;
  seatsRemaining: {
    economy: number;
    business: number;
    first: number;
  };
  amenities: string[];
}

export const LIVE_FLIGHTS: LiveFlightTelemetry[] = [
  {
    flightNumber: 'AS-701',
    callsign: 'SAFRAIR 701 HEAVY',
    aircraft: 'Airbus A350-1000 Neo Precision',
    origin: findAirport('DXB')!,
    destination: findAirport('LHR')!,
    altitudeFt: 38000,
    flightLevel: 'FL380',
    speedKnots: 514,
    mach: 0.86,
    headingDeg: 312,
    verticalSpeedFpm: 0,
    progressPercent: 64,
    departureTimeUtc: '08:15 UTC',
    estimatedArrivalUtc: '15:20 UTC',
    status: 'CRUISING',
    lat: 38.4,
    lng: 26.2,
    fuelRemainingKg: 42100,
    squawk: '4261',
    telemetrySignalDb: -42,
  },
  {
    flightNumber: 'AS-902',
    callsign: 'SAFRAIR 902 SUPER',
    aircraft: 'Overture Supersonic Mach 1.7',
    origin: findAirport('RUH')!,
    destination: findAirport('JFK')!,
    altitudeFt: 54000,
    flightLevel: 'FL540',
    speedKnots: 1040,
    mach: 1.68,
    headingDeg: 288,
    verticalSpeedFpm: +150,
    progressPercent: 48,
    departureTimeUtc: '11:00 UTC',
    estimatedArrivalUtc: '16:45 UTC',
    status: 'CRUISING',
    lat: 48.2,
    lng: -31.5,
    fuelRemainingKg: 61800,
    squawk: '7104',
    telemetrySignalDb: -38,
  },
  {
    flightNumber: 'AS-305',
    callsign: 'SAFRAIR 305',
    aircraft: 'Boeing 787-10 Quantum Liner',
    origin: findAirport('DOH')!,
    destination: findAirport('HND')!,
    altitudeFt: 39000,
    flightLevel: 'FL390',
    speedKnots: 502,
    mach: 0.84,
    headingDeg: 68,
    verticalSpeedFpm: -80,
    progressPercent: 78,
    departureTimeUtc: '03:40 UTC',
    estimatedArrivalUtc: '14:15 UTC',
    status: 'CRUISING',
    lat: 33.8,
    lng: 122.6,
    fuelRemainingKg: 28400,
    squawk: '2115',
    telemetrySignalDb: -45,
  },
  {
    flightNumber: 'AS-114',
    callsign: 'SAFRAIR 114',
    aircraft: 'Airbus A350-1000 Neo Precision',
    origin: findAirport('DXB')!,
    destination: findAirport('SIN')!,
    altitudeFt: 36000,
    flightLevel: 'FL360',
    speedKnots: 495,
    mach: 0.83,
    headingDeg: 124,
    verticalSpeedFpm: +300,
    progressPercent: 32,
    departureTimeUtc: '12:30 UTC',
    estimatedArrivalUtc: '19:40 UTC',
    status: 'CLIMBING',
    lat: 14.1,
    lng: 74.8,
    fuelRemainingKg: 54900,
    squawk: '5530',
    telemetrySignalDb: -40,
  },
  {
    flightNumber: 'AS-440',
    callsign: 'SAFRAIR 440',
    aircraft: 'Gulfstream G800 Apex Jet',
    origin: findAirport('ZRH')!,
    destination: findAirport('DXB')!,
    altitudeFt: 18500,
    flightLevel: 'FL185',
    speedKnots: 340,
    mach: 0.58,
    headingDeg: 136,
    verticalSpeedFpm: -1800,
    progressPercent: 91,
    departureTimeUtc: '07:20 UTC',
    estimatedArrivalUtc: '13:55 UTC',
    status: 'DESCENDING',
    lat: 25.8,
    lng: 54.9,
    fuelRemainingKg: 11200,
    squawk: '1402',
    telemetrySignalDb: -32,
  },
];

export const CURRENCIES = {
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)' },
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED (د.إ)' },
  SAR: { symbol: 'SAR ', rate: 3.75, label: 'SAR (ر.س)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
};

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatPrice(amountUsd: number, currency: CurrencyCode): string {
  const curr = CURRENCIES[currency] || CURRENCIES.INR;
  const converted = Math.round(amountUsd * curr.rate);
  if (currency === 'INR') {
    return `${curr.symbol}${converted.toLocaleString('en-IN')}`;
  }
  return `${curr.symbol}${converted.toLocaleString()}`;
}

