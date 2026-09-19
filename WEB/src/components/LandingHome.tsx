'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  Building2,
  Compass,
  Car,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  MapPin,
  Calendar,
  Plus,
  Minus,
  Star,
  Headset,
  Search,
  Globe2,
  MousePointerClick,
} from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { CountUpStat } from '@/components/CountUpStat';

type TabId = 'book' | 'hotels' | 'tours' | 'cabs' | 'bookings';

interface LandingHomeProps {
  currency: CurrencyCode;
  onNavigate: (tab: TabId) => void;
}

const SERVICE_TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: 'book', icon: Plane, label: 'Flights' },
  { id: 'hotels', icon: Building2, label: 'Hotels' },
  { id: 'tours', icon: Compass, label: 'Tours' },
  { id: 'cabs', icon: Car, label: 'Cabs' },
];

// Real data sources, not client logos — nothing here is fabricated. Every
// price shown anywhere on the site actually comes from one of these.
const DATA_SOURCES = ['Google Flights', 'Booking.com', 'RapidAPI live inventory'];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Search a real service', description: 'Pick flights, hotels, tours or cabs — no dummy demo mode.' },
  { icon: Globe2, title: 'Compare live results', description: 'Prices and availability pulled fresh from the supplier, every search.' },
  { icon: MousePointerClick, title: 'Book it in a few taps', description: 'Straight into your booking, tracked in our own system end to end.' },
];

const SERVICE_PILLS: { id: TabId; title: string; description: string }[] = [
  { id: 'tours', title: 'Tour Packages', description: '10 curated holidays, full itinerary' },
  { id: 'hotels', title: 'Hotel Stays', description: 'Budget to overwater villas' },
  { id: 'book', title: 'Best Price, Always', description: 'Live fares, never inflated' },
];

const WHY_BOOK = [
  { icon: Plane, title: 'Real fares to any destination', description: 'Live pricing, sourced at the moment you search.' },
  { icon: Building2, title: 'Thousands of hotels', description: 'From budget stays to luxury resorts.' },
  { icon: Compass, title: 'Curated holiday packages', description: '10 handpicked packages across 4 continents.' },
  { icon: Car, title: 'Self-drive rentals', description: 'Real supplier pricing across Europe and parts of Asia.' },
  { icon: ShieldCheck, title: 'No invented prices, ever', description: 'Every fare and rate comes straight from a live supplier.' },
  { icon: Headset, title: 'A real Bengaluru team', description: 'Call us anytime — we actually pick up.' },
];

const TESTIMONIALS = [
  {
    quote: 'Booked our Dubai family trip through Sajid bhai. Visa came through in four days and the hotel was exactly as promised. He even rearranged our return flight when my son fell ill — no extra fuss, no arguing about fees.',
    name: 'Rahul Kulkarni',
    location: 'Indiranagar, Bengaluru',
    rating: 5,
  },
  {
    quote: 'We did our Umrah with them last Ramadan. The hotel was a five-minute walk from the Haram, exactly as they said, and the group co-ordinator stayed with us the whole time. For first-timers that mattered more than the price.',
    name: 'Fatima Anwar',
    location: 'Shivaji Nagar, Bengaluru',
    rating: 5,
  },
  {
    quote: 'Our company routes all international ticketing here now. Quotes come back the same day, invoices are clean for accounts, and someone always answers after office hours. That is genuinely rare in this business.',
    name: 'Suresh Menon',
    location: 'Admin Head, IT services firm',
    rating: 5,
  },
  {
    quote: 'Our Kerala houseboat trip was planned perfectly for my parents — slow pace, good food, no long drives. They thought of things we did not even ask about.',
    name: 'Priya Nair',
    location: 'Whitefield, Bengaluru',
    rating: 5,
  },
  {
    quote: 'Schengen visa approved on the first attempt. They rewrote my covering letter and caught two mistakes in my bank statements before submission. Worth every rupee of the service fee.',
    name: 'Mohammed Irfan',
    location: 'Frazer Town, Bengaluru',
    rating: 4,
  },
  {
    quote: 'Honeymoon in Maldives. The water villa was exactly the one shown to us, not a downgrade on arrival like friends had warned. Everything was confirmed in writing beforehand.',
    name: 'Anitha Reddy',
    location: 'Jayanagar, Bengaluru',
    rating: 5,
  },
];

const FAQS = [
  {
    q: 'Are the prices I see actually real?',
    a: 'Yes. Flights come from Google Flights, hotels and cabs from Booking.com — all live at the moment you search. We never show a fabricated or estimated price.',
  },
  {
    q: 'Which cities does cab / car rental cover?',
    a: "Self-drive car rental currently covers Europe and parts of Asia, via our supplier's live inventory. It does not yet cover India, the UAE or the US — we show that clearly before you search.",
  },
  {
    q: 'How are the tour packages priced?',
    a: 'Each of our 10 packages lists inclusions, exclusions and a full day-by-day itinerary with one clear per-person price — no hidden tiers.',
  },
];

export const LandingHome: React.FC<LandingHomeProps> = ({ currency, onNavigate }) => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('book');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/tour-packages', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setPackages(data.packages || []);
      } catch {
        // Landing page degrades gracefully — destinations/featured sections
        // simply don't render if the catalogue can't be reached.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const destinations = packages.slice(0, 8);
  const featured = packages.slice(0, 4);

  return (
    <div className="space-y-20 pb-4" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Hero — light "paper" background, headline left, a service switcher
          styled like a boarding-pass stub (ticket-notch + barcode) standing
          in for the reference's single search bar: pick a real service and
          you land straight in that service's live search, not a mock form. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden border-b-4 border-black bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide max-border bg-black text-white">
              SINCE 2009 · BENGALURU
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-[0.92]">
              (the)
              <br />
              <span className="text-ticket-orange">Travel</span> Desk
              <br />
              <span className="inline-block px-2 mt-1 -rotate-1 bg-black text-white">this is yours</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md font-medium">
              Flights, hotels, tour packages and cabs — searched from real live suppliers. No guesswork, no invented prices.
            </p>
          </div>

          <div className="relative h-64 sm:h-80 lg:h-[22rem] rounded-full overflow-hidden max-border max-shadow mx-auto w-64 sm:w-80 lg:w-[22rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="A traveller enjoying a scenic mountain view"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black bg-ticket-orange text-black max-border">
              (enjoy your moment)
            </div>
          </div>
        </div>

        {/* Service switcher — the "one simple search" bar, shaped like a
            boarding pass stub via the existing .ticket-notch utility. */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="ticket-notch max-border max-shadow bg-black flex flex-col sm:flex-row items-stretch overflow-hidden">
            <div className="flex flex-1">
              {SERVICE_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`focus-ring flex-1 flex flex-col items-center gap-1.5 py-4 text-xs font-black transition-colors ${
                      active ? 'bg-ticket-orange text-black' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onNavigate(activeTab)}
              className="focus-ring flex items-center justify-center gap-2 px-8 py-4 text-sm font-black bg-white text-black border-t-2 sm:border-t-0 sm:border-l-2 border-black"
            >
              Search now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick trio — mirrors a reference row of three small stat/feature
          pills sitting right under the hero. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 max-border max-shadow-sm bg-white flex items-center gap-3">
            <CountUpStat value="10,000+" className="text-2xl font-black text-black" />
            <span className="text-xs font-bold text-slate-500">Travellers served</span>
          </div>
          <div className="rounded-2xl p-5 max-border max-shadow-sm bg-black text-white flex items-center gap-3">
            <Globe2 className="w-6 h-6 text-ticket-orange shrink-0" />
            <span className="text-xs font-bold">Live pricing, every search — no cached estimates</span>
          </div>
          <Link href="/about" className="max-press rounded-2xl p-5 max-border max-shadow-sm bg-ticket-orange text-black flex items-center justify-between gap-3">
            <span className="text-xs font-black">Our story — 16+ years in travel</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Popular destinations — "Discover the World" style photo grid, real
          catalogue data. */}
      {destinations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Popular destinations</h2>
            <p className="text-sm text-slate-500 font-medium max-w-sm">Real packages, real itineraries — pulled straight from our catalogue.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {destinations.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                className="max-press group relative rounded-2xl overflow-hidden h-48 block max-border max-shadow-sm"
              >
                {pkg.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pkg.images[0]} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <span className="absolute top-3 right-3 text-[11px] font-black text-black bg-ticket-orange px-2 py-1 rounded-full max-border">
                  {pkg.durationDays}D
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                  </div>
                  <div className="font-black text-sm leading-tight mt-0.5">{pkg.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Data source strip — the reference's "working with 50+ clients" band,
          but honest: these are the actual live suppliers behind every price
          on the site, not fabricated client logos. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-6 bg-black">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <span className="text-[11px] font-black tracking-widest uppercase text-ticket-orange">Live pricing sourced from</span>
          {DATA_SOURCES.map((s) => (
            <span key={s} className="text-sm font-black text-white">{s}</span>
          ))}
        </div>
      </div>

      {/* How it works — three-step row, mirrors the reference's icon trio. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 text-center">How booking with us works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative rounded-2xl p-6 max-border max-shadow-sm bg-cream text-center space-y-3">
                <span className="absolute -top-4 -left-4 w-9 h-9 rounded-full bg-ticket-orange text-black font-black text-sm flex items-center justify-center max-border">
                  {i + 1}
                </span>
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-black">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-black text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured packages — the reference's horizontal offer-card row,
          built from the real tour package catalogue. */}
      {featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Handpicked holidays</h2>
            <button onClick={() => onNavigate('tours')} className="focus-ring text-sm font-black text-black underline underline-offset-4 decoration-ticket-orange decoration-2">
              View all packages
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden flex flex-col max-border max-shadow-sm">
                <div className="h-36 bg-slate-100 border-b-[3px] border-black">
                  {pkg.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                    <span className="text-slate-300">·</span>
                    <Calendar className="w-3 h-3" />
                    {pkg.durationDays}D
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">{pkg.name}</h3>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="text-sm font-black text-slate-900">from {formatPrice(pkg.priceUsd, currency)}</div>
                    <Link
                      href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                      className="focus-ring max-press px-3 py-1.5 rounded-full text-black text-xs font-black max-border bg-ticket-orange"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why Book — trust icon grid, mirrors the reference's "Top Rated
          Providers" row but built from our own real trust points. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 text-center">
          Why book with{' '}
          <span className="inline-block px-2 -rotate-1 bg-ticket-orange text-black max-border">Al-Safr</span>?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_BOOK.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="flex items-start gap-4 rounded-2xl p-5 max-border max-shadow-sm bg-white">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-black">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-snug">{point.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service pills — the reference's three colored category band
          (VIP Packages / Travel Packages / Best Price Guarantee), mapped to
          our own real service categories. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SERVICE_PILLS.map((pill, i) => (
            <button
              key={pill.id}
              onClick={() => onNavigate(pill.id)}
              className={`max-press text-left rounded-2xl p-6 max-border max-shadow ${i === 0 ? 'bg-ticket-orange text-black' : i === 1 ? 'bg-black text-white' : 'bg-cream text-black'}`}
            >
              <div className="font-black text-lg">{pill.title}</div>
              <div className="text-sm font-medium opacity-80 mt-1">{pill.description}</div>
              <ArrowRight className="w-4 h-4 mt-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Stats + CTA block — mirrors the reference's closing "comfort meets
          elegance" section with big stats. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden py-16 sm:py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-[0.98]">Where every trip is handled properly.</h2>
            <p className="text-slate-300 font-medium max-w-md">
              Search real live fares, real hotel rates, real tour packages, and real car rental — right now.
            </p>
            <button
              onClick={() => onNavigate('book')}
              className="focus-ring max-press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm max-border-invert max-shadow-invert bg-ticket-orange text-black mt-2"
            >
              Start planning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '16+', label: 'Years of experience' },
              { value: '10,000+', label: 'Travellers served' },
              { value: '10', label: 'Curated tour packages' },
              { value: '500+', label: 'Cars per search' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 max-border-invert bg-white/5">
                <CountUpStat value={stat.value} className="block text-2xl sm:text-3xl font-black text-white" />
                <div className="text-xs font-bold text-slate-300 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 text-center">What our travellers actually say</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-5 flex flex-col gap-3 max-border max-shadow-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-ticket-orange text-ticket-orange" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed" style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto pt-2 border-t-2 border-black flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 bg-black">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About, folded in as a compact strip rather than a full section —
          the "who we are" content still needs a home on the landing page. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-3xl overflow-hidden h-64 sm:h-80 max-border max-shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
            alt="Travel planning"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-3">
          <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border bg-black text-white">
            Who we are
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            A Bengaluru travel desk that actually picks up the phone
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Al-Safr (السفر) is the booking platform for Al Safar Tours N Travels — a Bengaluru travel consultancy serving customers since 2009. We handle everything a traveller needs under one roof: the ticket, the hotel, the tour, and now, real live pricing you can search yourself.
          </p>
          <ul className="space-y-2">
            {[
              'Flights and hotels priced live at the moment you search',
              'Tour packages with a full itinerary, not a brochure summary',
              'Honest about coverage — we say when a service has limits',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                <BadgeCheck className="w-4 h-4 text-ticket-orange shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border bg-ticket-orange text-black">
            Good to know
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Frequently asked questions</h2>
          <p className="text-sm text-slate-500 font-medium">Everything about how our live pricing actually works.</p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={faq.q} className="rounded-2xl overflow-hidden max-border max-shadow-sm">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="focus-ring w-full flex items-center justify-between gap-4 p-5 text-left bg-white"
                  aria-expanded={isOpen}
                >
                  <span className="font-black text-slate-900">{faq.q}</span>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 max-border ${isOpen ? 'bg-ticket-orange text-black' : 'bg-white text-black'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed bg-white">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
