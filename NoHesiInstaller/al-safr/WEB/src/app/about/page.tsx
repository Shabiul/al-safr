import Link from 'next/link';
import { StaticPageShell } from '@/components/StaticPageShell';
import { ShieldCheck, Globe2, BadgeCheck, MapPin, ArrowRight, Flag, Plane, Rocket } from 'lucide-react';
import { CountUpStat } from '@/components/CountUpStat';

export const metadata = {
  title: 'About Us | Al-Safr',
  description: 'Al-Safr is the booking platform for Al Safar Tours N Travels, a Bengaluru travel consultancy serving customers since 2009.',
};

const VALUES = [
  { icon: ShieldCheck, title: 'No invented prices', description: 'Every fare, room rate and car price shown comes straight from a live supplier — never a placeholder or estimate.', color: 'var(--color-max-yellow)' },
  { icon: Globe2, title: 'Four services, one place', description: 'Flights, hotels, tour packages and cabs — search and compare without switching between apps.', color: 'var(--color-max-orange)' },
  { icon: BadgeCheck, title: 'Transparent, always', description: 'When a service has limits — like car rental not covering India yet — we say so up front, before you search.', color: 'var(--color-max-blue)' },
];

const STATS = [
  { value: '16+', label: 'Years in travel', color: 'var(--color-max-yellow)' },
  { value: '10,000+', label: 'Travellers served', color: 'var(--color-max-orange)' },
  { value: '10', label: 'Curated tour packages', color: 'var(--color-max-blue)' },
  { value: '500+', label: 'Cars available per search', color: 'var(--color-max-blue)' },
];

const MILESTONES = [
  { year: '2009', icon: Flag, title: 'Al Safar Tours N Travels founded', description: 'Started as a Bengaluru walk-in travel desk booking domestic flights, hotels and Gulf visas for the local community.', color: 'var(--color-max-yellow)' },
  { year: '2015', icon: Plane, title: 'International packages added', description: 'Grew into full holiday packages across the Gulf, Southeast Asia and Europe, with in-house itineraries instead of reseller brochures.', color: 'var(--color-max-orange)' },
  { year: '2026', icon: Rocket, title: 'Al-Safr goes online', description: 'Brought the same live-pricing, no-nonsense approach to the web — flights, hotels, tour packages and cabs, searched from real suppliers.', color: 'var(--color-max-blue)' },
];

export default function AboutPage() {
  return (
    <StaticPageShell
      title="A Bengaluru travel desk that actually picks up the phone"
      subtitle="Who we are, and why Al-Safr exists."
      wide
    >
      {/* Intro banner */}
      <div className="relative rounded-3xl overflow-hidden max-border max-shadow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,24,44,0.85) 0%, rgba(4,24,44,0.7) 60%, rgba(4,24,44,0.5) 100%)' }} />
        <div className="relative p-8 sm:p-12 space-y-4 text-white">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-wide max-border max-shadow-sm -rotate-3"
            style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
          >
            SINCE 2009
          </span>
          <p className="text-lg sm:text-xl leading-relaxed max-w-2xl font-medium">
            Al-Safr (السفر) is the booking platform for <strong>Al Safar Tours N Travels</strong>, a Bengaluru travel
            consultancy serving customers since 2009. For most of that time, booking a trip through us meant a phone
            call or a walk-in visit — Al-Safr brings that same real-live-pricing, no-nonsense approach online.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat, i) => (
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

      <div className="space-y-6 text-slate-600 leading-relaxed">
        <p>
          We built Al-Safr around one rule: if we can&apos;t get a real live price from a real supplier, we don&apos;t
          show one. Flights come from Google Flights, hotels and cabs from Booking.com, all live at the moment you
          search. Our tour packages are curated in-house with a full day-by-day itinerary, not a marketing brochure
          summary.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {VALUES.map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className={`p-5 rounded-2xl bg-white max-border max-shadow space-y-3 ${i === 1 ? 'sm:-translate-y-3' : ''}`}>
              <div className="w-11 h-11 rounded-xl max-border flex items-center justify-center" style={{ backgroundColor: v.color }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
              </div>
              <h3 className="font-black text-slate-900">{v.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{v.description}</p>
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div className="space-y-6">
        <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-max-blue)', color: 'white' }}>
          Our story
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Our story so far</h2>
        <div className="space-y-6">
          {MILESTONES.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={m.year} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 rounded-full max-border flex items-center justify-center" style={{ backgroundColor: m.color }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
                  </div>
                  {i < MILESTONES.length - 1 && <div className="w-[3px] flex-1 mt-2" style={{ backgroundColor: 'var(--color-ink)' }} />}
                </div>
                <div className="pb-6">
                  <div className="text-xs font-black" style={{ color: 'var(--color-max-blue)' }}>{m.year}</div>
                  <h3 className="font-black text-slate-900 mt-0.5">{m.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-xl">{m.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Office */}
      <div className="p-5 rounded-2xl bg-white max-border max-shadow-sm flex items-start gap-3 rotate-1">
        <div className="w-10 h-10 rounded-xl max-border flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-max-blue)' }}>
          <MapPin className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
        </div>
        <div>
          <h3 className="font-black text-slate-900 mb-1">Registered office</h3>
          <p className="text-sm text-slate-500">
            No-06, Classic Complex, Opp Mahindra Apts, Near Wipro, Shikaripalya, Hulimangala Post, Bengaluru — 560105
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Operational office: A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white max-border max-shadow relative overflow-hidden" style={{ backgroundColor: 'var(--color-navy-900)' }}>
        <div className="absolute inset-0 max-dots opacity-10 text-white" aria-hidden="true" />
        <div className="relative">
          <h3 className="text-lg font-black">Have a trip in mind?</h3>
          <p className="text-sm text-slate-200 mt-1 font-medium">Tell us what you need and we&apos;ll put together a quote — no obligation.</p>
        </div>
        <Link
          href="/get-a-quote"
          className="focus-ring max-press relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm shrink-0 max-border max-shadow-sm"
          style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
        >
          Get a Quote
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </StaticPageShell>
  );
}
