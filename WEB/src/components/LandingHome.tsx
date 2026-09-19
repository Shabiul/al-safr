'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plane,
  Building2,
  Compass,
  Car,
  ArrowRight,
  ShieldCheck,
  Globe2,
  BadgeCheck,
  MapPin,
  Calendar,
  Plus,
  Minus,
  Star,
  Zap,
} from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { CountUpStat } from '@/components/CountUpStat';

type TabId = 'book' | 'hotels' | 'tours' | 'cabs' | 'bookings';

interface LandingHomeProps {
  currency: CurrencyCode;
  onNavigate: (tab: TabId) => void;
}

const SERVICES: {
  id: TabId;
  icon: React.ElementType;
  title: string;
  tagline: string;
  points: string[];
  image: string;
  color: string;
}[] = [
  {
    id: 'book',
    icon: Plane,
    title: 'Flight Booking',
    tagline: 'Live domestic & international fares',
    points: ['Real-time fares via Google Flights, not cached estimates', 'Economy, Business and First cabin classes', 'Book directly into a real seat map'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    color: 'var(--color-max-pink)',
  },
  {
    id: 'hotels',
    icon: Building2,
    title: 'Hotel Booking',
    tagline: 'Real inventory, worldwide',
    points: ['Live rates and availability via Booking.com', 'Filter by star rating, guest rating and price', 'From budget stays to overwater villas'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    color: 'var(--color-max-blue)',
  },
  {
    id: 'tours',
    icon: Compass,
    title: 'Tour Packages',
    tagline: 'Ready-to-book holidays',
    points: ['10 curated packages across 4 continents', 'Full day-by-day itinerary for every trip', 'Clear inclusions and exclusions, no fine print'],
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    color: 'var(--color-max-orange)',
  },
  {
    id: 'cabs',
    icon: Car,
    title: 'Cab & Car Rental',
    tagline: 'Self-drive, real supplier pricing',
    points: ['Live pricing via Booking.com', 'Covers Europe and parts of Asia today', 'Real transmission, seats and cancellation terms'],
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    color: 'var(--color-max-green)',
  },
];

const WHY_US = [
  { icon: ShieldCheck, title: 'No invented prices', description: 'Every fare, room rate and car price shown comes straight from a live supplier — never a placeholder.', color: 'var(--color-max-yellow)' },
  { icon: Globe2, title: 'Four services, one place', description: 'Flights, hotels, tour packages and cabs — search and compare without switching apps.', color: 'var(--color-max-pink)' },
  { icon: BadgeCheck, title: 'Transparent, always', description: 'When a service has limits — like car rental not covering India yet — we say so up front.', color: 'var(--color-max-blue)' },
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
  const featured = packages.slice(0, 3);
  const destinationColors = ['var(--color-max-pink)', 'var(--color-max-yellow)', 'var(--color-max-blue)', 'var(--color-max-green)'];

  return (
    <div className="space-y-24 pb-4" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Hero + stats bar wrapped together so the parent's space-y treats
          them as one unit — the negative margin overlap between them is
          otherwise fragile against a sibling-spacing utility fighting it. */}
      <div>
      {/* Hero — full-bleed: breaks out of the page's centered max-w-7xl
          container to span the entire viewport width. A thick black bottom
          border + scattered sticker shapes give it the maximalist framing;
          the photo/gradient live in their own layer so the stats card below
          can overlap the bottom edge without being cut off by clipping. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-svh flex items-center overflow-hidden border-b-8" style={{ borderColor: 'var(--color-ink)' }}>
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-navy-900)]/90 via-[color:var(--color-navy-900)]/75 to-[color:var(--color-navy-900)]/50" />
        </div>

        {/* Scattered sticker shapes — decorative, hidden from a11y tree */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block" aria-hidden="true">
          <Zap className="absolute top-28 right-[12%] w-10 h-10 -rotate-12" style={{ color: 'var(--color-max-yellow)' }} />
          <Star className="absolute bottom-24 right-[22%] w-7 h-7 rotate-12 fill-current" style={{ color: 'var(--color-max-pink)' }} />
          <div className="absolute top-1/3 right-[6%] w-16 h-16 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-blue)' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-wide max-border max-shadow-sm -rotate-3"
                style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
              >
                SINCE 2009
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-white/60 text-white bg-white/10 backdrop-blur">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-max-yellow)' }} />
                Trusted by 10,000+ travellers from Bengaluru
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[0.95]">
              One stop travel
              <br />
              solutions for{' '}
              <span className="inline-block -rotate-2" style={{ color: 'var(--color-max-yellow)' }}>
                everything
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-lg font-medium">
              Flights, hotels, tour packages and cabs — searched from real live suppliers. No guesswork, no invented prices.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('book')}
                className="focus-ring max-press flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm max-border max-shadow"
                style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
              >
                Search flights
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('tours')}
                className="focus-ring max-press flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm text-white max-border max-shadow"
                style={{ backgroundColor: 'var(--color-max-pink)' }}
              >
                Browse tour packages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar — four chunky, alternately-rotated sticker tiles instead
          of one calm white card. */}
      <div className="relative z-10 px-4 sm:px-10 -mt-10 sm:-mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {[
            { value: '16+', label: 'Years of experience', color: 'var(--color-max-yellow)' },
            { value: '10,000+', label: 'Travellers served', color: 'var(--color-max-pink)' },
            { value: '10', label: 'Curated tour packages', color: 'var(--color-max-blue)' },
            { value: '500+', label: 'Cars available per search', color: 'var(--color-max-green)' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-2xl p-4 sm:p-5 max-border max-shadow-sm ${i % 2 === 0 ? '-rotate-2' : 'rotate-2'}`}
              style={{ backgroundColor: stat.color }}
            >
              <CountUpStat value={stat.value} className="block text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-ink)' } as React.CSSProperties} />
              <div className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: 'var(--color-ink)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Why us — color-blocked dot-textured section */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-16" style={{ backgroundColor: 'var(--color-navy-900)' }}>
        <div className="absolute inset-0 max-dots opacity-10 text-white" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {WHY_US.map((point, i) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className={`p-6 rounded-2xl bg-white max-border max-shadow space-y-3 ${i === 1 ? 'sm:-translate-y-3' : ''}`}>
                <div className="w-11 h-11 rounded-xl max-border flex items-center justify-center" style={{ backgroundColor: point.color }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
                </div>
                <h3 className="font-black text-slate-900 text-lg">{point.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* About */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 max-border max-shadow rotate-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
            alt="Travel planning"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute -bottom-4 -left-4 rounded-2xl px-5 py-4 text-white max-border max-shadow-sm -rotate-3"
            style={{ backgroundColor: 'var(--color-max-orange)' }}
          >
            <div className="text-2xl font-black">16+</div>
            <div className="text-xs font-bold">Years in travel</div>
          </div>
        </div>

        <div className="space-y-4">
          <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-blue)', color: 'white' }}>
            Who we are
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            A Bengaluru travel desk that actually picks up the phone
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Al-Safr (السفر) is the booking platform for Al Safar Tours N Travels — a Bengaluru travel consultancy serving customers since 2009. We handle everything a traveller needs under one roof: the ticket, the hotel, the tour, and now, real live pricing you can search yourself.
          </p>
          <ul className="space-y-2.5">
            {[
              'Flights and hotels priced live at the moment you search',
              'Tour packages with a full itinerary, not a brochure summary',
              'Honest about coverage — we say when a service has limits',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 max-border" style={{ backgroundColor: 'var(--color-max-yellow)' }}>
                  <BadgeCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-ink)' }} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate('book')}
            className="focus-ring max-press inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-black text-sm mt-2 max-border max-shadow"
            style={{ backgroundColor: 'var(--color-navy-900)' }}
          >
            Explore our services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-pink)', color: 'white' }}>
            What we do
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">Every trip, one platform</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Four services that cover a journey end to end — each backed by live data, not guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate(service.id)}
                className="max-press group relative overflow-hidden text-left rounded-2xl text-white max-border max-shadow"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(4,24,44,0.5) 0%, rgba(4,24,44,0.85) 65%, var(--color-navy-900) 100%)' }}
                  aria-hidden="true"
                />

                {/* Everything below must live in this single positioned
                    wrapper — a static-position sibling would paint behind
                    the absolutely-positioned image/gradient above, not on
                    top of them, regardless of DOM order. */}
                <div className="relative p-6 flex flex-col gap-3 h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center max-border" style={{ backgroundColor: service.color }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
                  </div>
                  <h3 className="text-xl font-black">{service.title}</h3>
                  <p className="text-sm font-bold" style={{ color: service.color }}>
                    {service.tagline}
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-200">
                    {service.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-2 flex items-center gap-1.5 text-sm font-black" style={{ color: service.color }}>
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular destinations, pulled from the real tour package catalogue */}
      {destinations.length > 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-blue)', color: 'white' }}>
              Where our travellers go
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">Popular destinations</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">Real packages, real itineraries — pulled straight from our catalogue.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {destinations.map((pkg, i) => (
              <Link
                key={pkg.id}
                href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                className="max-press group relative rounded-2xl overflow-hidden h-56 block max-border max-shadow-sm"
              >
                {pkg.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pkg.images[0]} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <span
                  className="absolute top-3 right-3 text-[11px] font-black text-white px-2 py-1 rounded-full max-border"
                  style={{ backgroundColor: destinationColors[i % destinationColors.length] }}
                >
                  {pkg.durationDays}D
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-max-yellow)' }}>
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                  </div>
                  <div className="font-black leading-tight mt-0.5">{pkg.name}</div>
                  <div className="text-xs text-slate-200 mt-1 font-semibold">from {formatPrice(pkg.priceUsd, currency)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured packages */}
      {featured.length > 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-green)', color: 'var(--color-ink)' }}>
              Handpicked holidays
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">Featured tour packages</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featured.map((pkg, i) => (
              <div key={pkg.id} className={`bg-white rounded-2xl overflow-hidden flex flex-col max-border max-shadow ${i === 1 ? 'sm:-translate-y-3' : ''}`}>
                <div className="h-44 bg-slate-100 border-b-[3px]" style={{ borderColor: 'var(--color-ink)' }}>
                  {pkg.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                    <span className="text-slate-300">·</span>
                    <Calendar className="w-3 h-3" />
                    {pkg.durationDays}D
                  </div>
                  <h3 className="font-black text-slate-900">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{pkg.summary}</p>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">from</div>
                      <div className="text-lg font-black text-slate-900">{formatPrice(pkg.priceUsd, currency)}</div>
                    </div>
                    <Link
                      href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                      className="focus-ring max-press px-4 py-2 rounded-full text-white text-sm font-black max-border max-shadow-sm"
                      style={{ backgroundColor: 'var(--color-navy-900)' }}
                    >
                      View package
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-16" style={{ backgroundColor: 'var(--color-max-yellow)' }}>
        <div className="absolute inset-0 max-dots opacity-15" style={{ color: 'var(--color-ink)' }} aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border bg-white">
              Client feedback
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">What our travellers actually say</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`bg-white rounded-2xl p-5 flex flex-col gap-3 max-border max-shadow-sm ${i % 3 === 1 ? 'sm:-translate-y-2' : ''}`}>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--color-max-orange)' }} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed" style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto pt-2 border-t-2 flex items-center gap-3" style={{ borderColor: 'var(--color-ink)' }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 max-border"
                    style={{ backgroundColor: 'var(--color-navy-900)' }}
                  >
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
      </div>

      {/* FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-purple)', color: 'white' }}>
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
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 max-border"
                    style={{ backgroundColor: isOpen ? 'var(--color-max-yellow)' : 'white', color: 'var(--color-ink)' }}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed bg-white">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final CTA */}
      <div
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden py-16 sm:py-20 text-center border-y-8"
        style={{ backgroundColor: 'var(--color-navy-900)', borderColor: 'var(--color-max-yellow)' }}
      >
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600')" }}
          aria-hidden="true"
        />
        <div className="relative space-y-6 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-6xl font-black text-white max-w-xl mx-auto leading-[0.95]">Ready when you are</h2>
          <p className="text-slate-200 max-w-lg mx-auto font-medium">
            Search real live fares, real hotel rates, real tour packages, and real car rental — right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('book')}
              className="focus-ring max-press flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm max-border max-shadow"
              style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
            >
              Start planning
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('tours')}
              className="focus-ring max-press px-7 py-3.5 rounded-xl text-white font-black text-sm max-border max-shadow"
              style={{ backgroundColor: 'var(--color-max-pink)' }}
            >
              Browse tour packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
