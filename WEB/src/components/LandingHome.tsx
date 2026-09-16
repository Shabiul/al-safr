'use client';

import React from 'react';
import {
  Sparkles,
  Plane,
  Building2,
  Compass,
  Car,
  Radio,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Users,
} from 'lucide-react';

type TabId = 'book' | 'hotels' | 'tours' | 'cabs' | 'radar' | 'price' | 'bookings';

interface LandingHomeProps {
  onNavigate: (tab: TabId) => void;
}

const SERVICES: {
  id: TabId;
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
}[] = [
  {
    id: 'book',
    icon: Plane,
    title: 'Flights',
    description: 'Search real live domestic and international fares, pick a cabin, choose your seat, and get a boarding pass — no invented prices.',
    tag: 'Live fares via Google Flights',
  },
  {
    id: 'hotels',
    icon: Building2,
    title: 'Hotels',
    description: 'Real hotel inventory and pricing worldwide, with filters for star rating, guest rating, and price — powered by Booking.com.',
    tag: 'Live inventory via Booking.com',
  },
  {
    id: 'tours',
    icon: Compass,
    title: 'Tour Packages',
    description: '10 curated packages across Dubai, Kerala, the Swiss Alps, Paris, Bali, the Maldives, Tokyo, Santorini, Thailand, and Rajasthan.',
    tag: 'Full itinerary & inclusions',
  },
  {
    id: 'cabs',
    icon: Car,
    title: 'Cabs',
    description: 'Self-drive car rental search across Europe and parts of Asia, with real supplier pricing, transmission, and cancellation terms.',
    tag: 'Live pricing via Booking.com',
  },
];

const TOOLS: { id: TabId; icon: React.ElementType; title: string; description: string }[] = [
  { id: 'radar', icon: Radio, title: 'Live Flight Radar', description: 'Track real aircraft over the globe via OpenSky Network ADS-B data.' },
  { id: 'price', icon: TrendingUp, title: 'Fare Trends', description: '7-day fare forecasts anchored on the cheapest real fare we find.' },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'No fabricated prices — every fare and rate is live from a real supplier' },
  { icon: Globe2, label: 'Flights, hotels, tours, and cabs in one place' },
  { icon: Users, label: 'Built by Al-Safr Tours N Travels, Bengaluru' },
];

export const LandingHome: React.FC<LandingHomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-14">
      {/* Hero */}
      <div className="rounded-3xl p-8 sm:p-16 bg-gradient-to-br from-brand-50 via-white to-white border border-slate-200 text-center sm:text-left">
        <div className="max-w-2xl mx-auto sm:mx-0 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-brand-700 text-xs font-semibold border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            Real live fares, real live radar
          </span>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05]">
            Fly further, <span className="text-brand-600">for less.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto sm:mx-0">
            Al-Safr (السفر) is a complete travel booking platform — flights, hotels, tour packages, and cabs, all backed by real live pricing. No guesswork, no invented rates.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={() => onNavigate('book')}
              className="focus-ring flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm hover:shadow-md"
            >
              Search flights
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('tours')}
              className="focus-ring flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors"
            >
              Browse tour packages
            </button>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TRUST_POINTS.map((point, i) => {
          const Icon = point.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Icon className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-snug">{point.label}</p>
            </div>
          );
        })}
      </div>

      {/* Services */}
      <div className="space-y-5">
        <div className="text-center sm:text-left space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Our services</h2>
          <p className="text-sm text-slate-500">Everything we&apos;ve built so far — each backed by real, live data.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate(service.id)}
                className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all p-5 flex flex-col gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">{service.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">{service.tag}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-brand-700">
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-5">
        <div className="text-center sm:text-left space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Live tools</h2>
          <p className="text-sm text-slate-500">Extra ways to track fares and aircraft in real time.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="group text-left bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-brand-300 transition-all p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-white text-brand-600 border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
