export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
}

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

export const AIRPORTS: Airport[] = [
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', timezone: 'UTC+4', lat: 25.2532, lng: 55.3657 },
  { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia', timezone: 'UTC+3', lat: 24.9576, lng: 46.6988 },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', timezone: 'UTC+3', lat: 25.2731, lng: 51.6081 },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', timezone: 'UTC+0', lat: 51.4700, lng: -0.4543 },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', timezone: 'UTC-5', lat: 40.6413, lng: -73.7781 },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Int\'l', city: 'Mumbai', country: 'India', timezone: 'UTC+5:30', lat: 19.0896, lng: 72.8656 },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', timezone: 'UTC+5:30', lat: 28.5562, lng: 77.1000 },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', timezone: 'UTC+5:30', lat: 13.1986, lng: 77.7066 },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', timezone: 'UTC+9', lat: 35.5494, lng: 139.7798 },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', timezone: 'UTC+8', lat: 1.3644, lng: 103.9915 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', timezone: 'UTC+7', lat: 13.6900, lng: 100.7501 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', timezone: 'UTC+3', lat: 41.2753, lng: 28.7519 },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', timezone: 'UTC+1', lat: 49.0097, lng: 2.5479 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', timezone: 'UTC+1', lat: 50.0379, lng: 8.5622 },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', timezone: 'UTC+1', lat: 47.4582, lng: 8.5555 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', timezone: 'UTC-8', lat: 33.9416, lng: -118.4085 },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', timezone: 'UTC-8', lat: 37.6213, lng: -122.3790 },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', timezone: 'UTC+10', lat: -33.9399, lng: 151.1753 },
];

export const LIVE_FLIGHTS: LiveFlightTelemetry[] = [
  {
    flightNumber: 'AS-701',
    callsign: 'SAFRAIR 701 HEAVY',
    aircraft: 'Airbus A350-1000 Neo Precision',
    origin: AIRPORTS[0], // DXB
    destination: AIRPORTS[3], // LHR
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
    origin: AIRPORTS[1], // RUH
    destination: AIRPORTS[4], // JFK
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
    origin: AIRPORTS[2], // DOH
    destination: AIRPORTS[5], // HND
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
    origin: AIRPORTS[0], // DXB
    destination: AIRPORTS[6], // SIN
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
    origin: AIRPORTS[7], // ZRH
    destination: AIRPORTS[0], // DXB
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

