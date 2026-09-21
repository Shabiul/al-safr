'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plane,
  Compass,
  ArrowRight,
  ArrowLeftRight,
  MapPin,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Expand,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';

type TabId = 'book' | 'hotels' | 'tours' | 'cabs' | 'bookings';

interface LandingHomeProps {
  currency: CurrencyCode;
  onNavigate: (tab: TabId) => void;
  onQuickSearch?: (origin: string, destination: string, date: string, cabin: 'economy' | 'business' | 'first') => void;
  onOpenGallery: () => void;
}

const AIRPORT_OPTIONS = [
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi Intnl' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy' },
  { code: 'KIN', city: 'Jamaica', name: 'Norman Manley Intnl' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
  { code: 'MLE', city: 'Maldives', name: 'Velana International' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport' },
  { code: 'LHR', city: 'London', name: 'Heathrow' },
  { code: 'SIN', city: 'Singapore', name: 'Changi' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda' },
];

const TESTIMONIALS = [
  {
    name: 'Rahul Kulkarni',
    role: 'Indiranagar, Bengaluru',
    quote:
      'Booked our Dubai family trip through Sajid bhai — flights and the hotel both came in exactly as quoted. He even rearranged our return flight when my son fell ill, no extra fuss.',
  },
  {
    name: 'Suresh Menon',
    role: 'Admin Head, IT services firm',
    quote:
      'Our company routes all international ticketing here now. Quotes come back the same day, invoices are clean for accounts, and someone always answers after office hours.',
  },
  {
    name: 'Priya Nair',
    role: 'Whitefield, Bengaluru',
    quote:
      'Our Kerala houseboat trip was planned perfectly for my parents — slow pace, good food, no long drives. They thought of things we did not even ask about.',
  },
  {
    name: 'Mohammed Irfan',
    role: 'Frazer Town, Bengaluru',
    quote:
      'Rented a car for our Europe road trip through them — real pricing, no surprise charges at pickup, and the itinerary suggestions actually matched our route.',
  },
  {
    name: 'Anitha Reddy',
    role: 'Jayanagar, Bengaluru',
    quote:
      'Honeymoon in Maldives. The water villa was exactly the one shown to us, not a downgrade on arrival like friends had warned. Everything was confirmed in writing beforehand.',
  },
];

const FAQS = [
  {
    q: 'How does the live flight pricing work?',
    a: 'We query wholesale airline telemetry and global distribution systems in real-time. When you click Find Ticket, fares reflect live seat inventories with zero hidden markups.',
  },
  {
    q: 'Can I book hotels, tour packages, and cabs together?',
    a: 'Yes! You can explore individual services from the Services tab, or bundle international flights with luxury resort transfers and guided itineraries.',
  },
  {
    q: 'What happens if my flight schedule changes?',
    a: 'Our registered Bengaluru desk operates 24/7. In case of airline reschedules or delays, our concierge coordinates directly with the carriers to ensure alternate routing at no extra hassle.',
  },
  {
    q: 'Are the displayed prices final?',
    a: 'Yes. All prices shown include taxes, airline surcharges, and live seat reservation privileges in your chosen currency.',
  },
];

export const LandingHome: React.FC<LandingHomeProps> = ({
  currency,
  onNavigate,
  onQuickSearch,
  onOpenGallery,
}) => {
  // Flight Ticket Search Widget state
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [cabinClass, setCabinClass] = useState<'economy' | 'business' | 'first'>('economy');
  const [passengers, setPassengers] = useState<number>(1);
  const [originCode, setOriginCode] = useState<string>('JFK');
  const [destCode, setDestCode] = useState<string>('KIN');
  const [departureDate, setDepartureDate] = useState<string>('2026-10-15');

  // Interactive states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Real tour package catalogue — the "Discover the world" grid below used
  // to show fictional destinations that weren't actually bookable; this
  // pulls the same real packages that power the Tour Packages tab.
  const [packages, setPackages] = useState<TourPackage[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/tour-packages', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setPackages(data.packages || []);
      } catch {
        // Section simply doesn't render if the catalogue can't be reached.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSwapAirports = () => {
    const temp = originCode;
    setOriginCode(destCode);
    setDestCode(temp);
  };

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onQuickSearch) {
      onQuickSearch(originCode, destCode, departureDate, cabinClass);
    } else {
      onNavigate('book');
    }
  };

  return (
    <div className="w-full bg-[#f4f3ec] text-[#1c1817] selection:bg-[#f36f0f]/20 selection:text-[#f36f0f] overflow-x-hidden">
      {/* =========================================================================
          SECTION 1: HERO SECTION (With Signature Arch + Flight Ticket Search Widget)
         ========================================================================= */}
      <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-10 lg:pb-14">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1c1817]/60 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Direct Wholesale Airline Feeds</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          {/* -----------------------------------------------------------------------
              LEFT COLUMN: EXPLORE + WORLD + FLIGHT SEARCH TICKET CARD
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
            {/* Display Headline */}
            <div className="space-y-2">
              {/* Line 1: EXPLORE + Rotating Video Badge */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black tracking-tight text-[#1c1817] leading-[0.94] uppercase">
                  EXPLORE
                </h1>

                {/* Rotating Gallery Sphere Trigger — sized as a real focal
                    visual rather than a small icon-sized badge. */}
                <button
                  type="button"
                  onClick={() => onOpenGallery()}
                  className="relative group cursor-pointer inline-flex items-center justify-center shrink-0 w-24 sm:w-32 h-24 sm:h-32"
                  aria-label="View travel photo gallery"
                >
                  <div className="absolute inset-0 animate-spin-slow group-hover:scale-105 transition-transform">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <path
                        id="heroVideoCirclePath"
                        d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                        fill="none"
                        stroke="transparent"
                      />
                      <text fill="#1c1817" fontSize="9.2" fontWeight="800" letterSpacing="0.18em" className="uppercase opacity-80">
                        <textPath href="#heroVideoCirclePath">VIEW GALLERY • VIEW GALLERY •</textPath>
                      </text>
                    </svg>
                  </div>
                  <div
                    className="w-16 sm:w-20 h-16 sm:h-20 rounded-full overflow-hidden border-2 border-white relative flex items-center justify-center"
                    style={{ boxShadow: '0 10px 22px rgba(28,24,23,0.4), 0 3px 6px rgba(28,24,23,0.28)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/uixshuvo/hero_video_thumb.jpg" alt="Travel gallery preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {/* Two radial gradients (a soft highlight top-left, a
                        shadow bottom-right) painted over the flat photo to
                        read as a lit sphere rather than a flat disc. */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.65), rgba(255,255,255,0) 45%), radial-gradient(circle at 72% 78%, rgba(0,0,0,0.45), rgba(0,0,0,0) 55%)',
                      }}
                    />
                    <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Persistent "click to open" indicator — the rotating
                      text already says VIEW GALLERY, but a lot of people
                      skim past ring text, so this badge makes the
                      click-to-expand affordance unmissable at a glance. */}
                  <span
                    className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white z-10"
                    style={{ backgroundColor: 'var(--color-ticket-orange)' }}
                    aria-hidden="true"
                  >
                    <Expand className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>
              </div>

              {/* Line 2: Orange Rounded Pill Arrow Button + WORLD */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('ticket-search');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-24 sm:w-32 h-12 sm:h-16 rounded-[24px] sm:rounded-[32px] bg-[#f36f0f] hover:bg-[#dc6009] active:scale-98 text-white flex items-center justify-center orange-pill-glow transition-all duration-300 cursor-pointer group"
                  aria-label="Find flights"
                >
                  <ArrowRight className="w-6 sm:w-7 h-6 sm:h-7 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <span className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black tracking-tight text-[#1c1817] leading-[0.94] uppercase">
                  WORLD
                </span>
              </div>
            </div>

            {/* Geometric Symbols + Description */}
            <div className="flex items-start gap-4 max-w-xl">
              <div className="flex items-center gap-2 text-[#1c1817] shrink-0 pt-0.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="7.5" cy="7.5" r="4.5" />
                  <circle cx="16.5" cy="7.5" r="4.5" />
                  <circle cx="7.5" cy="16.5" r="4.5" />
                  <circle cx="16.5" cy="16.5" r="4.5" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                  <line x1="5.6" y1="18.4" x2="18.4" y2="5.6" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#1c1817]/75 leading-relaxed">
                Al-Safr (السفر) connects you to flights, hotels and tours worldwide with live wholesale fares and 24/7 dedicated support.
              </p>
            </div>

            {/* =========================================================================
                FLIGHT TICKET SEARCH CARD (Image 3 Ticket Widget)
               ========================================================================= */}
            <div id="ticket-search" className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#1c1817]/10 text-left space-y-4">
              {/* Trip type selector & travelers */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dashed border-[#1c1817]/15">
                <div className="inline-flex p-1 rounded-full bg-[#f4f3ec] border border-[#1c1817]/10">
                  <button
                    type="button"
                    onClick={() => setTripType('oneway')}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      tripType === 'oneway' ? 'bg-[#1c1817] text-white shadow-2xs' : 'text-[#1c1817]/70 hover:text-[#1c1817]'
                    }`}
                  >
                    One Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('roundtrip')}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      tripType === 'roundtrip' ? 'bg-[#1c1817] text-white shadow-2xs' : 'text-[#1c1817]/70 hover:text-[#1c1817]'
                    }`}
                  >
                    Round Trip
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value as 'economy' | 'business' | 'first')}
                      className="appearance-none bg-[#f4f3ec] border border-[#1c1817]/10 text-xs font-bold text-[#1c1817] pl-3 pr-6 py-1.5 rounded-xl cursor-pointer focus:outline-none"
                    >
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#1c1817]/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="appearance-none bg-[#f4f3ec] border border-[#1c1817]/10 text-xs font-bold text-[#1c1817] pl-3 pr-6 py-1.5 rounded-xl cursor-pointer focus:outline-none"
                    >
                      <option value={1}>1 Traveler</option>
                      <option value={2}>2 Travelers</option>
                      <option value={3}>3 Travelers</option>
                      <option value={4}>4+ Travelers</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#1c1817]/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Main inputs row */}
              <form onSubmit={handleExecuteSearch} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* From Field */}
                  <div className="sm:col-span-4 bg-[#f4f3ec] hover:bg-[#edeade] border border-[#1c1817]/10 rounded-2xl p-2.5 transition-colors">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#1c1817]/50 font-bold uppercase tracking-wider mb-0.5">
                      <MapPin className="w-3 h-3 text-[#f36f0f]" />
                      <span>From</span>
                    </div>
                    <select
                      value={originCode}
                      onChange={(e) => setOriginCode(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-[#1c1817] focus:outline-none cursor-pointer"
                    >
                      {AIRPORT_OPTIONS.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.city} ({a.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap Button */}
                  <div className="sm:col-span-1 flex justify-center -my-1 sm:my-0">
                    <button
                      type="button"
                      onClick={handleSwapAirports}
                      title="Swap Origin and Destination"
                      className="w-8 h-8 rounded-full bg-white border border-[#1c1817]/15 shadow-2xs hover:border-[#f36f0f] hover:text-[#f36f0f] text-[#1c1817] flex items-center justify-center transition-transform active:rotate-180 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* To Field */}
                  <div className="sm:col-span-4 bg-[#f4f3ec] hover:bg-[#edeade] border border-[#1c1817]/10 rounded-2xl p-2.5 transition-colors">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#1c1817]/50 font-bold uppercase tracking-wider mb-0.5">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      <span>To</span>
                    </div>
                    <select
                      value={destCode}
                      onChange={(e) => setDestCode(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-[#1c1817] focus:outline-none cursor-pointer"
                    >
                      {AIRPORT_OPTIONS.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.city} ({a.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Field */}
                  <div className="sm:col-span-3 bg-[#f4f3ec] hover:bg-[#edeade] border border-[#1c1817]/10 rounded-2xl p-2.5 transition-colors">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#1c1817]/50 font-bold uppercase tracking-wider mb-0.5">
                      <Calendar className="w-3 h-3 text-[#f36f0f]" />
                      <span>Date</span>
                    </div>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-[#1c1817] focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Find ticket action button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#f36f0f] hover:bg-[#dc6009] active:scale-98 text-white font-black text-sm tracking-wide orange-pill-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Find ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Featured Route Shortcut */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[#1c1817]/50 font-bold uppercase text-[10px]">Popular:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOriginCode('JFK');
                    setDestCode('KIN');
                    if (onQuickSearch) onQuickSearch('JFK', 'KIN', departureDate, cabinClass);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f3ec] border border-[#1c1817]/10 hover:border-[#f36f0f] text-[#1c1817] font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plane className="w-3 h-3 text-[#f36f0f] -rotate-45" />
                  <span>NEW YORK (JFK) ➔ JAMAICA (KIN)</span>
                  <span className="text-[#f36f0f] font-extrabold">• Direct</span>
                </button>
              </div>
            </div>

            {/* Bottom 2-Part Widget Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <div className="flex items-center gap-3 bg-white/70 p-2.5 rounded-2xl border border-[#1c1817]/5 shadow-2xs">
                <div className="flex -space-x-2.5 shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/uixshuvo/dest_frostveil.jpg" alt="Bora Bora" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/uixshuvo/dest_dunes.jpg" alt="Maldives" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="text-base font-black text-[#1c1817] leading-none">10,000+</div>
                  <div className="text-[10px] font-semibold text-[#1c1817]/60 mt-0.5">Travel places</div>
                </div>
              </div>

              <div className="bg-white rounded-full py-2 px-3.5 shadow-2xs border border-[#1c1817]/5 flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-[10px] font-black text-[#1c1817] uppercase tracking-wider">Features</div>
                  <div className="text-[9px] font-semibold text-[#1c1817]/65 line-clamp-1">Places people love to visit</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#1c1817] text-white flex items-center justify-center shrink-0 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/uixshuvo/dest_obsidian.jpg" alt="Villa" className="w-full h-full object-cover opacity-85" />
                  <ChevronRight className="w-3 h-3 text-white absolute z-10" />
                </div>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: SIGNATURE ARCHITECTURAL ARCH WINDOW (With Curved Text)
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-center relative w-full">
            <div className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] xl:max-w-[580px] flex flex-col items-center">
              <div className="relative w-full aspect-[560/680] flex items-center justify-center">
                <svg viewBox="0 0 560 680" className="w-full h-full overflow-visible">
                  <defs>
                    <clipPath id="heroArchClip">
                      <path d="M 90 250 A 190 190 0 0 1 470 250 L 470 580 L 90 580 Z" />
                    </clipPath>
                    <path id="heroArchTextPath" d="M 90 383 A 232 232 0 1 1 498 329" fill="none" stroke="transparent" />
                  </defs>

                  {/* High-Resolution Photographic Beach Image inside Arch */}
                  <image
                    href="/uixshuvo/hero_beach_arch.jpg"
                    x="90"
                    y="60"
                    width="380"
                    height="520"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#heroArchClip)"
                  />

                  {/* Curved Text Path around the arch */}
                  <text fill="#1c1817" fontSize="12" fontWeight="800" letterSpacing="0.22em" className="uppercase select-none">
                    <textPath href="#heroArchTextPath" startOffset="50%" textAnchor="middle">
                      FIND THE BEST PLACE TO TRAVEL AND RELAX YOURSELF
                    </textPath>
                  </text>

                  {/* Baseline underline beneath the arch */}
                  <line x1="240" y1="583" x2="480" y2="583" stroke="#1c1817" strokeWidth="1.8" />
                </svg>
              </div>

              {/* Under-arch "Our Story" banner exactly matching UIXSHUVO reference */}
              <div className="w-full max-w-[380px] mt-4 flex items-center justify-between gap-4 pt-1">
                <div className="text-left">
                  <h3 className="text-base sm:text-lg font-black text-[#1c1817]">Our story</h3>
                  <p className="text-xs text-[#1c1817]/65 font-medium leading-relaxed max-w-[240px]">
                    A Bengaluru travel desk, serving customers since 2009.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('who-we-are');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-12 h-14 rounded-t-full rounded-br-full bg-[#f36f0f] hover:bg-[#dc6009] text-white flex items-center justify-center shrink-0 orange-pill-glow transition-all active:scale-95 cursor-pointer shadow-md"
                  aria-label="Read our story"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: DISCOVER THE WORLD — real packages from the catalogue,
          not the fictional stock destinations this used to show.
         ========================================================================= */}
      {packages.length > 0 && (
        <section id="discover" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="text-center space-y-3 mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1c1817] tracking-tight">
              Discover the world
            </h2>
            <p className="text-sm sm:text-base text-[#1c1817]/65 font-medium max-w-lg mx-auto">
              Real packages, real itineraries — pulled straight from our catalogue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {packages.slice(0, 6).map((pkg) => (
              <Link
                key={pkg.id}
                href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-[#1c1817]/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group flex flex-col justify-between"
              >
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative bg-[#f4f3ec]">
                  {pkg.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pkg.images[0]}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1c1817]/20">
                      <Compass className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#1c1817]/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f36f0f]" />
                    <span>{pkg.destination}</span>
                  </div>
                  {pkg.featured && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-black uppercase text-white bg-rose-600">
                      Hot
                    </span>
                  )}
                </div>

                <div className="pt-4 pb-2 text-left">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1c1817] tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#1c1817]/50 mt-1">
                    {pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1c1817]/5">
                  <div className="text-left">
                    <span className="text-lg font-black text-[#1c1817]">
                      {formatPrice(pkg.priceUsd, currency)}
                    </span>
                    <span className="text-xs font-semibold text-[#1c1817]/60 ml-1">/person</span>
                  </div>

                  <span className="px-5 py-2 rounded-full bg-[#f36f0f] group-hover:bg-[#dc6009] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <span>View details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION: WHERE COMFORT MEETS ELEGANCE (Hospitality & Airline Providers)
         ========================================================================= */}
      <section id="comfort-elegance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-14 border border-[#1c1817]/10 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f3ec] text-[#f36f0f] text-xs font-black tracking-wider uppercase">
                <Plane className="w-3.5 h-3.5 -rotate-45" />
                <span>Hospitality & Comfort</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1817] tracking-tight leading-[1.2]">
                <span className="relative inline-block border-b-4 border-[#f36f0f] pb-1 mr-2">Where comfort</span>
                <span>meets elegance and every guest is treated like family.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#1c1817]/70 font-medium leading-relaxed max-w-xl">
                Our mission is to create memorable experiences for our guests. We believe that every stay should feel special, whether you&apos;re here for business, leisure, or a special occasion.
              </p>

              <div className="flex flex-wrap items-center gap-8 sm:gap-12 pt-6 border-t border-[#1c1817]/10">
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-[#1c1817] tracking-tight">10,000+</div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1c1817]/60 mt-1">Travellers served</div>
                </div>
                <div className="w-px h-10 bg-[#1c1817]/10" />
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-[#1c1817] tracking-tight">10</div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1c1817]/60 mt-1">Curated tour packages</div>
                </div>
                <div className="w-px h-10 bg-[#1c1817]/10 hidden sm:block" />
                <div className="hidden sm:block">
                  <div className="text-3xl sm:text-4xl font-black text-[#f36f0f] tracking-tight">16+</div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1c1817]/60 mt-1">Years in Electronic City, Bengaluru</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('ticket-search');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full bg-[#1c1817] hover:bg-[#f36f0f] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <span>Book Your Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Plane Graphic with Halo */}
            <div className="lg:col-span-5 flex items-end justify-center lg:justify-end relative self-end -mb-8 sm:-mb-12 lg:-mb-14 -mr-4 sm:-mr-8">
              <div className="relative w-full max-w-[500px] flex items-end justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/uixshuvo/plane_comfort.png"
                  alt="Where comfort meets elegance airplane"
                  className="w-full h-auto object-contain object-bottom drop-shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUR BEST FEATURE (Connected 3-Node Cloud Capsule)
         ========================================================================= */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
        <div className="space-y-3 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1817] tracking-tight leading-tight max-w-xl mx-auto">
            Our best feature <br />
            <span className="text-[#1c1817]/85 font-extrabold">for the customer who believe in us</span>
          </h2>
        </div>

        <div className="bg-white rounded-3xl sm:rounded-[40px] p-5 sm:p-6 lg:p-7 shadow-sm border border-[#1c1817]/5 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
            <div className="flex flex-col items-center text-center gap-1 px-4">
              <span className="text-[10px] font-black text-[#1c1817]/40 uppercase tracking-widest">01</span>
              <h3 className="text-base font-extrabold text-[#1c1817]">Tour guide</h3>
              <p className="text-xs text-[#1c1817]/65 font-medium leading-snug max-w-[15rem]">
                Certified local guides on every journey.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-1 px-4 md:border-x md:border-[#1c1817]/10">
              <span className="text-[10px] font-black text-[#1c1817]/40 uppercase tracking-widest">02</span>
              <h3 className="text-base font-extrabold text-[#1c1817]">Reliable tour</h3>
              <p className="text-xs text-[#1c1817]/65 font-medium leading-snug max-w-[15rem]">
                24/7 ground support, guaranteed connections.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-1 px-4">
              <span className="text-[10px] font-black text-[#1c1817]/40 uppercase tracking-widest">03</span>
              <h3 className="text-base font-extrabold text-[#1c1817]">Friendly price</h3>
              <p className="text-xs text-[#1c1817]/65 font-medium leading-snug max-w-[15rem]">
                Wholesale rates, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ADVENTURES CAN FILL YOUR SOUL (Panoramic Stadium Feature)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10 sm:mb-12">
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1c1817] tracking-tight leading-[1.02] uppercase">
              ADVENTURES CAN FILL <br />
              YOUR SOUL
            </h2>
          </div>
          <div className="lg:col-span-5 text-left lg:text-right">
            <p className="text-xs sm:text-sm text-[#1c1817]/75 font-medium leading-relaxed max-w-md ml-auto">
              From alpine chalets to overwater villas — real trips we&apos;ve planned for real travellers, not stock photography.
            </p>
          </div>
        </div>

        <div className="relative">
          <div
            className="w-full aspect-[16/7] sm:aspect-[21/8] rounded-[40px] sm:rounded-[70px] lg:rounded-[90px] overflow-hidden shadow-lg border-4 border-white relative group cursor-pointer"
            onClick={() => onOpenGallery()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uixshuvo/panoramic_boats.jpg"
              alt="Tropical boats in emerald lagoon"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#f36f0f] shadow-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#1c1817]/70 font-medium leading-relaxed max-w-2xl mx-auto text-center mt-6">
            Every destination shown here is a real place from our tour package catalogue, not a generic stock scene.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: WHO WE ARE / STORYTELLING ARCH (Al-Safr Legacy & Promise)
         ========================================================================= */}
      <section id="who-we-are" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Arch Frame */}
          <div className="lg:col-span-6 flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] aspect-[560/680] flex items-center justify-center">
              <svg viewBox="0 0 560 680" className="w-full h-full overflow-visible">
                <defs>
                  <clipPath id="storyArchClip">
                    <path d="M 90 250 A 190 190 0 0 1 470 250 L 470 580 L 90 580 Z" />
                  </clipPath>
                  <path id="storyArchTextPath" d="M 90 383 A 232 232 0 1 1 498 329" fill="none" stroke="transparent" />
                </defs>

                <text fill="#1c1817" fontSize="12" fontWeight="800" letterSpacing="0.22em" className="uppercase select-none">
                  <textPath href="#storyArchTextPath" startOffset="50%" textAnchor="middle">
                    FIND THE BEST PLACE TO TRAVEL AND RELAX YOURSELF
                  </textPath>
                </text>

                <image
                  href="/uixshuvo/story_temple_arch.jpg"
                  x="90"
                  y="60"
                  width="380"
                  height="520"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#storyArchClip)"
                />

                <line x1="240" y1="583" x2="480" y2="583" stroke="#1c1817" strokeWidth="1.8" />
              </svg>
            </div>
          </div>

          {/* Right Narrative Content */}
          <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
            <div className="inline-block text-xs font-black tracking-widest uppercase px-3.5 py-1 rounded-full bg-[#1c1817] text-white">
              Who we are
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1c1817] tracking-tight leading-tight">
              An Electronic City, Bengaluru travel desk that actually picks up the phone
            </h2>

            <p className="text-sm sm:text-base text-[#1c1817]/80 font-medium leading-relaxed">
              <strong>Al-Safr (السفر)</strong> is the booking platform for Al Safar Tours N Travels — a premier Electronic City, Bengaluru travel consultancy serving customers since 2009. We handle everything a traveller needs under one roof: the ticket, the hotel, the tour, and now, real live wholesale pricing you can search yourself.
            </p>

            <ul className="space-y-3 pt-1">
              {[
                'Flights and hotels priced live at the moment you search with direct airline feeds',
                'Tour packages with full comprehensive day-by-day itineraries, not brochure summaries',
                'Honest about coverage — we say when a service has limits and provide 24/7 human support',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#1c1817] font-semibold">
                  <div className="w-5 h-5 rounded-full bg-[#f36f0f]/15 text-[#f36f0f] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => onNavigate('book')}
                className="w-36 sm:w-44 h-12 sm:h-14 rounded-full bg-[#f36f0f] hover:bg-[#dc6009] active:scale-98 text-white flex items-center justify-center orange-pill-glow transition-all duration-300 cursor-pointer group"
                aria-label="Book a Flight"
              >
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: OUR BEST CLIENTS WORDS (Testimonials)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
        <div className="space-y-3 mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1c1817] tracking-tight">
            Our best clients words
          </h2>
          <p className="text-sm text-[#1c1817]/65 font-medium">Real stories from travelers who fly with Al-Safr.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl p-8 shadow-sm border border-[#1c1817]/5 flex flex-col justify-between text-left"
            >
              <div className="space-y-4">
                <div className="text-[#f36f0f] font-serif text-4xl leading-none select-none">
                  ““
                </div>
                <p className="text-xs sm:text-sm text-[#1c1817]/75 font-medium leading-relaxed">
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-6 mt-4 border-t border-[#1c1817]/5">
                <div className="w-11 h-11 rounded-full bg-[#1c1817] text-white flex items-center justify-center shrink-0 text-xs font-black">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#1c1817]">{t.name}</div>
                  <div className="text-xs font-semibold text-[#1c1817]/55">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: STAY STYLES (4 Circular Gallery Cutouts)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
        <div className="space-y-3 mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1c1817] tracking-tight">
            Pick your kind of getaway
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { img: '/uixshuvo/gallery_mountain.jpg', title: 'Alpine Chalets' },
            { img: '/uixshuvo/gallery_bungalows.jpg', title: 'Overwater Lagoon' },
            { img: '/uixshuvo/gallery_lagoon.jpg', title: 'Emerald Cove' },
            { img: '/uixshuvo/gallery_pool.jpg', title: 'Ocean Villa Pool' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="w-full aspect-square rounded-full overflow-hidden border-4 border-white shadow-md hover:scale-105 transition-transform duration-500 cursor-pointer relative group"
              onClick={() => {
                const el = document.getElementById('discover');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS (Accordion)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-3 text-left">
            <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-[#f36f0f] text-white">
              Good to know
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1c1817]">
              Frequently asked questions
            </h2>
            <p className="text-sm text-[#1c1817]/65 font-medium">
              Everything about how our live pricing and booking consultancy operates.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-4 text-left">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={faq.q} className="rounded-2xl overflow-hidden bg-white border border-[#1c1817]/10 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left bg-white hover:bg-slate-50/50 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-extrabold text-[#1c1817] text-sm sm:text-base">{faq.q}</span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[#1c1817]/15 ${isOpen ? 'bg-[#f36f0f] text-white' : 'bg-[#f4f3ec] text-[#1c1817]'}`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-5 text-xs sm:text-sm text-[#1c1817]/75 leading-relaxed bg-white border-t border-[#1c1817]/5 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: COMPLETE AL-SAFR COMPANY FOOTER
         ========================================================================= */}
      <footer className="border-t border-[#1c1817]/10 bg-[#1c1817] text-[#f4f3ec] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
            {/* Column 1: Brand & Bio */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f36f0f] text-white flex items-center justify-center shadow-sm">
                  <Plane className="w-4.5 h-4.5 -rotate-45" />
                </div>
                <span className="text-xl font-black text-white">Al-Safr (السفر)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#f4f3ec]/70 leading-relaxed">
                One-stop premier travel platform for flights, hotels, tour packages, and cabs — backed by real, live wholesale pricing and dedicated 24/7 assistance.
              </p>
            </div>

            {/* Column 2: Explore */}
            <div>
              <h3 className="font-extrabold text-white text-sm mb-4 uppercase tracking-wider">Explore</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#f4f3ec]/70">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
                <li><button onClick={() => onNavigate('book')} className="hover:text-white transition-colors cursor-pointer">Flights</button></li>
                <li><button onClick={() => onNavigate('hotels')} className="hover:text-white transition-colors cursor-pointer">Hotels</button></li>
                <li><button onClick={() => onNavigate('tours')} className="hover:text-white transition-colors cursor-pointer">Tour Packages</button></li>
                <li><button onClick={() => onNavigate('cabs')} className="hover:text-white transition-colors cursor-pointer">Cabs</button></li>
                <li><button onClick={() => onNavigate('bookings')} className="hover:text-white transition-colors cursor-pointer">My Trips</button></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h3 className="font-extrabold text-white text-sm mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#f4f3ec]/70">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/get-a-quote" className="hover:text-white transition-colors">Get a Quote</Link></li>
              </ul>
            </div>

            {/* Column 4: Reach us */}
            <div>
              <h3 className="font-extrabold text-white text-sm mb-4 uppercase tracking-wider">Reach us</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#f4f3ec]/70">
                <li className="leading-relaxed">
                  53/3, Abbaiah Reddy St, near Celebrity Arch, Doddathoguru, Electronic City Phase I, Electronic City, Bengaluru, Karnataka 560100
                </li>
                <li className="flex items-center gap-2 pt-1">
                  <span className="text-[#f4f3ec]/50 text-xs">Call:</span>
                  <a href="tel:+918904563397" className="hover:text-white transition-colors font-bold text-[#f36f0f]">
                    +91 89045 63397
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 text-xs font-bold">WhatsApp:</span>
                  <a href="https://wa.me/918904563396" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-bold text-emerald-400">
                    +91 89045 63396
                  </a>
                </li>
                <li>
                  <a href="mailto:alsafartoursntravels@gmail.com" className="hover:text-white transition-colors">
                    alsafartoursntravels@gmail.com
                  </a>
                </li>
                <li className="text-[11px] text-[#f4f3ec]/50 pt-1">
                  Serving Electronic City &amp; Greater Bengaluru travelers since 2009.
                </li>
              </ul>
            </div>
          </div>

          {/* Legal & Live Telemetry Note */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#f4f3ec]/50 text-left">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p>© 2026 Al-Safr Tours N Travels. All rights reserved.</p>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
            <span>Live wholesale fares via Google Flights &amp; Airline Telemetry</span>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-[#f4f3ec]/50">
            Designed and developed with{' '}
            <span aria-hidden="true">❤</span> by{' '}
            <a
              href="https://naazailabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#f4f3ec]/80 hover:text-white transition-colors"
            >
              Naaz AI Labs
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
