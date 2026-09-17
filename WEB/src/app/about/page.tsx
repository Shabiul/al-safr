import { StaticPageShell } from '@/components/StaticPageShell';
import { ShieldCheck, Globe2, BadgeCheck, MapPin } from 'lucide-react';

export const metadata = {
  title: 'About Us | Al-Safr',
  description: 'Al-Safr is the booking platform for Al Safar Tours N Travels, a Bengaluru travel consultancy serving customers since 2009.',
};

const VALUES = [
  { icon: ShieldCheck, title: 'No invented prices', description: 'Every fare, room rate and car price shown comes straight from a live supplier — never a placeholder or estimate.' },
  { icon: Globe2, title: 'Four services, one place', description: 'Flights, hotels, tour packages and cabs — search and compare without switching between apps.' },
  { icon: BadgeCheck, title: 'Transparent, always', description: 'When a service has limits — like car rental not covering India yet — we say so up front, before you search.' },
];

export default function AboutPage() {
  return (
    <StaticPageShell
      title="A Bengaluru travel desk that actually picks up the phone"
      subtitle="Who we are, and why Al-Safr exists."
    >
      <div className="space-y-6 text-slate-600 leading-relaxed">
        <p>
          Al-Safr (السفر) is the booking platform for <strong className="text-slate-900">Al Safar Tours N Travels</strong>, a
          Bengaluru travel consultancy serving customers since 2009. For most of that time, booking a trip through us
          meant a phone call or a walk-in visit. Al-Safr is our attempt to bring the same real-live-pricing, no-nonsense
          approach online — flights, hotels, tour packages and cabs, searched from real suppliers, not invented numbers.
        </p>
        <p>
          We built it around one rule: if we can&apos;t get a real live price from a real supplier, we don&apos;t show one.
          Flights come from Google Flights, hotels and cabs from Booking.com, all live at the moment you search. Our tour
          packages are curated in-house with a full day-by-day itinerary, not a marketing brochure summary.
        </p>
      </div>

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
    </StaticPageShell>
  );
}
