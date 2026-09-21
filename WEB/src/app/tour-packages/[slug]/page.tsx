import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { CurrencyCode, CURRENCIES, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { MapPin, Calendar, Check, X, Compass } from 'lucide-react';
import { TourBookingFlow } from '@/components/TourBookingFlow';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ currency?: string }>;
}

export default async function TourPackageDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { currency: currencyParam } = await searchParams;
  const currency: CurrencyCode = currencyParam && currencyParam in CURRENCIES ? (currencyParam as CurrencyCode) : 'INR';

  const { data: row } = await db.from('TourPackage').select('*').eq('slug', slug).maybeSingle();
  if (!row || !row.published) notFound();

  const pkg: TourPackage = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    destination: row.destination,
    summary: row.summary,
    description: row.description,
    durationDays: row.durationDays,
    priceUsd: row.priceUsd,
    images: row.images,
    inclusions: row.inclusions,
    exclusions: row.exclusions,
    itinerary: row.itinerary as unknown as TourPackage['itinerary'],
    featured: row.featured ?? false,
    tourType: row.tourType ?? null,
    originalPriceUsd: row.originalPriceUsd ?? null,
    theme: row.theme ?? null,
    hotelCategory: row.hotelCategory ?? null,
    freeCancellation: row.freeCancellation ?? false,
  };

  return (
    <div className="min-h-screen bg-cream text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 space-y-8">
        <div className="h-64 sm:h-96 rounded-3xl bg-slate-100 overflow-hidden soft-border soft-shadow">
          {pkg.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Compass className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide soft-border"
              style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}
            >
              <Calendar className="w-3.5 h-3.5" />
              {pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">{pkg.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 font-semibold">
              <MapPin className="w-4 h-4 shrink-0" />
              {pkg.destination}
            </p>
          </div>
          <div className="text-right shrink-0 space-y-3 rounded-2xl p-4 soft-border soft-shadow-sm" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
            <div>
              <div className="text-2xl font-black" style={{ color: 'var(--color-dark-ink-muted)' }}>{formatPrice(pkg.priceUsd, currency)}</div>
              <div className="text-xs font-bold" style={{ color: 'var(--color-dark-ink-muted)' }}>per person</div>
            </div>
            <TourBookingFlow
              tourPackageId={pkg.id}
              packageName={pkg.name}
              destination={pkg.destination}
              priceUsd={pkg.priceUsd}
              currency={currency}
            />
          </div>
        </div>

        <p className="text-base text-slate-600 leading-relaxed max-w-3xl font-medium">{pkg.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}>
              Itinerary
            </span>
            <ol className="space-y-4 pt-2">
              {pkg.itinerary.map((day, i) => {
                const itineraryColors = ['var(--color-ticket-orange)', 'var(--color-ticket-orange)', 'var(--color-ticket-orange)', 'var(--color-ticket-orange)', 'var(--color-ticket-orange)', 'var(--color-ticket-orange)'];
                const color = itineraryColors[i % itineraryColors.length];
                return (
                  <li key={day.day} className="flex gap-4 rounded-2xl p-4 soft-border soft-shadow-sm bg-cream">
                    <div
                      className="shrink-0 w-9 h-9 rounded-full font-black text-sm flex items-center justify-center soft-border"
                      style={{ backgroundColor: color, color: 'var(--color-dark-ink-muted)' }}
                    >
                      {day.day}
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">{day.title}</div>
                      <p className="text-sm text-slate-500 mt-0.5 font-medium">{day.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-4 soft-border soft-shadow-sm bg-cream">
              <h2 className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full soft-border mb-3" style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-dark-ink-muted)' }}>
                Inclusions
              </h2>
              <ul className="space-y-2">
                {pkg.inclusions.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2 font-medium">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                      <Check className="w-3 h-3" style={{ color: 'var(--color-dark-ink-muted)' }} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-4 soft-border soft-shadow-sm bg-cream">
              <h2 className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full soft-border mb-3" style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}>
                Exclusions
              </h2>
              <ul className="space-y-2">
                {pkg.exclusions.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2 font-medium">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                      <X className="w-3 h-3 text-white" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
