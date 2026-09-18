'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plane,
  Building2,
  Compass,
  Car,
  Radio,
  ArrowRight,
  ShieldCheck,
  Globe2,
  BadgeCheck,
  MapPin,
  Calendar,
  Plus,
  Minus,
  Star,
} from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';

type TabId = 'book' | 'hotels' | 'tours' | 'cabs' | 'radar' | 'bookings';

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
}[] = [
  {
    id: 'book',
    icon: Plane,
    title: 'Flight Booking',
    tagline: 'Live domestic & international fares',
    points: ['Real-time fares via Google Flights, not cached estimates', 'Economy, Business and First cabin classes', 'Live aircraft radar for every route we search'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
  },
  {
    id: 'hotels',
    icon: Building2,
    title: 'Hotel Booking',
    tagline: 'Real inventory, worldwide',
    points: ['Live rates and availability via Booking.com', 'Filter by star rating, guest rating and price', 'From budget stays to overwater villas'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },
  {
    id: 'tours',
    icon: Compass,
    title: 'Tour Packages',
    tagline: 'Ready-to-book holidays',
    points: ['10 curated packages across 4 continents', 'Full day-by-day itinerary for every trip', 'Clear inclusions and exclusions, no fine print'],
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  },
  {
    id: 'cabs',
    icon: Car,
    title: 'Cab & Car Rental',
    tagline: 'Self-drive, real supplier pricing',
    points: ['Live pricing via Booking.com', 'Covers Europe and parts of Asia today', 'Real transmission, seats and cancellation terms'],
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
  },
];

const TOOLS: { id: TabId; icon: React.ElementType; title: string; description: string; image: string }[] = [
  {
    id: 'radar',
    icon: Radio,
    title: 'Live Flight Radar',
    description: 'Track real aircraft over the globe via OpenSky Network ADS-B data.',
    image: 'https://images.unsplash.com/photo-1436915359307-2a869c4a58ad?w=400',
  },
];

const WHY_US = [
  { icon: ShieldCheck, title: 'No invented prices', description: 'Every fare, room rate and car price shown comes straight from a live supplier — never a placeholder.' },
  { icon: Globe2, title: 'Four services, one place', description: 'Flights, hotels, tour packages and cabs — search and compare without switching apps.' },
  { icon: BadgeCheck, title: 'Transparent, always', description: 'When a service has limits — like car rental not covering India yet — we say so up front.' },
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
  {
    q: 'Can I track my flight after booking?',
    a: 'Yes — the Live Flight Radar tab tracks real aircraft in the sky using ADS-B data from OpenSky Network, independent of which airline you flew.',
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

  return (
    <div className="space-y-20" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Hero + stats bar wrapped together so the parent's space-y-20 treats
          them as one unit — the negative margin overlap between them is
          otherwise fragile against a sibling-spacing utility fighting it. */}
      <div>
      {/* Hero — the background image/gradient live in their own clipped
          layer so the stats card below can overlap the bottom edge without
          being cut off by this container's own rounded-corner clipping. */}
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-navy-900)]/90 via-[color:var(--color-navy-900)]/70 to-[color:var(--color-navy-900)]/40" />
        </div>

        <div className="relative p-8 sm:p-16 pb-14 sm:pb-16">
          <div className="max-w-2xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                style={{ backgroundColor: 'var(--color-gold-500)', color: 'var(--color-navy-900)' }}
              >
                SINCE 2009
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold border border-white/20 text-white">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-gold-400)' }} />
                Trusted by 10,000+ travellers from Bengaluru
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">
              One stop travel solutions
              <br />
              for{' '}
              <span style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', color: 'var(--color-gold-400)' }}>
                all your travel needs
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-lg">
              Flights, hotels, tour packages and cabs — searched from real live suppliers. No guesswork, no invented prices.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('book')}
                className="focus-ring flex items-center gap-2 px-6 py-3 rounded-full text-[color:var(--color-navy-900)] font-semibold text-sm transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: 'var(--color-gold-500)' }}
              >
                Search flights
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('tours')}
                className="focus-ring flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 backdrop-blur transition-colors"
              >
                Browse tour packages
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Stats bar — a normal-flow sibling pulled up over the hero's bottom
          edge with a negative margin, so its real height (2 rows on mobile,
          1 row from sm up) is never clipped and always reserves its own
          space in the layout, no manual spacer needed. */}
      <div className="relative z-10 px-4 sm:px-10 -mt-14 sm:-mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7">
          {[
            { value: '16+', label: 'Years of experience' },
            { value: '10,000+', label: 'Travellers served' },
            { value: '10', label: 'Curated tour packages' },
            { value: '500+', label: 'Cars available per search' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-gold-600)' }}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Why us */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {WHY_US.map((point) => {
          const Icon = point.icon;
          return (
            <div key={point.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Icon className="w-5 h-5" style={{ color: 'var(--color-gold-600)' }} />
              <h3 className="font-semibold text-slate-900">{point.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
            </div>
          );
        })}
      </div>

      {/* Services */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-600)' }}>
            What we do
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">Every trip, one platform</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Four services that cover a journey end to end — each backed by live data, not guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate(service.id)}
                className="group relative overflow-hidden text-left rounded-2xl text-white transition-transform hover:scale-[1.01]"
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
                  style={{ background: 'linear-gradient(180deg, rgba(4,24,44,0.55) 0%, rgba(4,24,44,0.88) 65%, var(--color-navy-900) 100%)' }}
                  aria-hidden="true"
                />

                {/* Everything below must live in this single positioned
                    wrapper — a static-position sibling would paint behind
                    the absolutely-positioned image/gradient above, not on
                    top of them, regardless of DOM order. */}
                <div className="relative p-6 flex flex-col gap-3 h-full">
                  <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-gold-400)' }} />
                  </div>
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-gold-400)' }}>
                    {service.tagline}
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {service.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-white/50 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-gold-400)' }}>
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 max-w-md gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="group text-left bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all p-4 flex items-center gap-4"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tool.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular destinations, pulled from the real tour package catalogue */}
      {destinations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-600)' }}>
              Where our travellers go
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">Popular destinations</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">Real packages, real itineraries — pulled straight from our catalogue.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {destinations.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                className="group relative rounded-2xl overflow-hidden h-56 block"
              >
                {pkg.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pkg.images[0]} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute top-3 right-3 text-[11px] font-semibold text-white bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                  {pkg.durationDays}D
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-gold-400)' }}>
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                  </div>
                  <div className="font-semibold leading-tight mt-0.5">{pkg.name}</div>
                  <div className="text-xs text-slate-200 mt-1">from {formatPrice(pkg.priceUsd, currency)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured packages */}
      {featured.length > 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-600)' }}>
              Handpicked holidays
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">Featured tour packages</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featured.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-100">
                  {pkg.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {pkg.destination}
                    <span className="text-slate-300">·</span>
                    <Calendar className="w-3 h-3" />
                    {pkg.durationDays}D
                  </div>
                  <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{pkg.summary}</p>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">from</div>
                      <div className="text-lg font-bold text-slate-900">{formatPrice(pkg.priceUsd, currency)}</div>
                    </div>
                    <Link
                      href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                      className="focus-ring px-4 py-2 rounded-full text-white text-sm font-semibold"
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
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-600)' }}>
            Client feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">What our travellers actually say</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: 'var(--color-navy-900)' }}
                >
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
            alt="Travel planning"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute bottom-4 left-4 rounded-2xl px-5 py-4 text-white"
            style={{ backgroundColor: 'var(--color-navy-900)' }}
          >
            <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-400)' }}>
              16+
            </div>
            <div className="text-xs text-slate-300">Years in travel</div>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-600)' }}>
            Who we are
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
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
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-gold-600)' }} />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onNavigate('book')}
            className="focus-ring inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm mt-2"
            style={{ backgroundColor: 'var(--color-navy-900)' }}
          >
            Explore our services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-600)' }}>
            Good to know
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>
          <p className="text-sm text-slate-500">Everything about how our live pricing actually works.</p>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={faq.q} className="rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="focus-ring w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isOpen ? 'var(--color-gold-500)' : '#f1f5f9', color: isOpen ? '#fff' : '#64748b' }}
                  >
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final CTA */}
      <div
        className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
        style={{ backgroundColor: 'var(--color-navy-900)' }}
      >
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600')" }}
          aria-hidden="true"
        />
        <div className="relative space-y-5">
          <h2 className="text-2xl sm:text-4xl font-bold text-white max-w-xl mx-auto">Ready when you are</h2>
          <p className="text-slate-300 max-w-lg mx-auto">
            Search real live fares, real hotel rates, real tour packages, and real car rental — right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('book')}
              className="focus-ring flex items-center gap-2 px-6 py-3 rounded-full text-[color:var(--color-navy-900)] font-semibold text-sm"
              style={{ backgroundColor: 'var(--color-gold-500)' }}
            >
              Start planning
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('tours')}
              className="focus-ring px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 backdrop-blur transition-colors"
            >
              Browse tour packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
