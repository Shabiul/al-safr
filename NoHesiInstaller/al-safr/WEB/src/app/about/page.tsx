import Link from 'next/link';
import { StaticPageShell } from '@/components/StaticPageShell';
import { ShieldCheck, Globe2, BadgeCheck, MapPin, ArrowRight, Flag, Plane, Rocket } from 'lucide-react';

export const metadata = {
  title: 'About Us | Al-Safr',
  description: 'Al-Safr is the booking platform for Al Safar Tours N Travels, a Bengaluru travel consultancy serving customers since 2009.',
};

const VALUES = [
  { icon: ShieldCheck, title: 'No invented prices', description: 'Every fare, room rate and car price shown comes straight from a live supplier — never a placeholder or estimate.' },
  { icon: Globe2, title: 'Four services, one place', description: 'Flights, hotels, tour packages and cabs — search and compare without switching between apps.' },
  { icon: BadgeCheck, title: 'Transparent, always', description: 'When a service has limits — like car rental not covering India yet — we say so up front, before you search.' },
];

const STATS = [
  { value: '16+', label: 'Years in travel' },
  { value: '10,000+', label: 'Travellers served' },
  { value: '10', label: 'Curated tour packages' },
  { value: '500+', label: 'Cars available per search' },
];

const MILESTONES = [
  { year: '2009', icon: Flag, title: 'Al Safar Tours N Travels founded', description: 'Started as a Bengaluru walk-in travel desk booking domestic flights, hotels and Gulf visas for the local community.' },
  { year: '2015', icon: Plane, title: 'International packages added', description: 'Grew into full holiday packages across the Gulf, Southeast Asia and Europe, with in-house itineraries instead of reseller brochures.' },
  { year: '2026', icon: Rocket, title: 'Al-Safr goes online', description: 'Brought the same live-pricing, no-nonsense approach to the web — flights, hotels, tour packages and cabs, searched from real suppliers.' },
];

export default function AboutPage() {
  return (
    <StaticPageShell
      title="A Bengaluru travel desk that actually picks up the phone"
      subtitle="Who we are, and why Al-Safr exists."
      wide
    >
      {/* Intro banner */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/70 to-slate-900/50" />
        <div className="relative p-8 sm:p-12 space-y-4 text-white">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-brand-500 text-white">
            SINCE 2009
          </span>
          <p className="text-lg sm:text-xl leading-relaxed max-w-2xl">
            Al-Safr (السفر) is the booking platform for <strong>Al Safar Tours N Travels</strong>, a Bengaluru travel
            consultancy serving customers since 2009. For most of that time, booking a trip through us meant a phone
            call or a walk-in visit — Al-Safr brings that same real-live-pricing, no-nonsense approach online.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-7">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl sm:text-3xl font-bold text-brand-700">{stat.value}</div>
            <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6 text-slate-600 leading-relaxed">
        <p>
          We built Al-Safr around one rule: if we can&apos;t get a real live price from a real supplier, we don&apos;t
          show one. Flights come from Google Flights, hotels and cabs from Booking.com, all live at the moment you
          search. Our tour packages are curated in-house with a full day-by-day itinerary, not a marketing brochure
          summary.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <Icon className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-slate-900">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Our story so far</h2>
        <div className="space-y-6">
          {MILESTONES.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={m.year} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  {i < MILESTONES.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-2" />}
                </div>
                <div className="pb-6">
                  <div className="text-xs font-semibold text-brand-600">{m.year}</div>
                  <h3 className="font-medium text-slate-900 mt-0.5">{m.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-xl">{m.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Office */}
      <div className="p-5 rounded-2xl border border-slate-200 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">Registered office</h3>
          <p className="text-sm text-slate-500">
            No-06, Classic Complex, Opp Mahindra Apts, Near Wipro, Shikaripalya, Hulimangala Post, Bengaluru — 560105
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Operational office: A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-brand-600 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div>
          <h3 className="text-lg font-semibold">Have a trip in mind?</h3>
          <p className="text-sm text-brand-100 mt-1">Tell us what you need and we&apos;ll put together a quote — no obligation.</p>
        </div>
        <Link
          href="/get-a-quote"
          className="focus-ring inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-semibold text-sm shrink-0 hover:bg-brand-50 transition-colors"
        >
          Get a Quote
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </StaticPageShell>
  );
}
