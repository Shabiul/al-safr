import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@al-safr/db';
import { CurrencyCode, CURRENCIES, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { ArrowLeft, MapPin, Calendar, Check, X, Compass } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ currency?: string }>;
}

export default async function TourPackageDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { currency: currencyParam } = await searchParams;
  const currency: CurrencyCode = currencyParam && currencyParam in CURRENCIES ? (currencyParam as CurrencyCode) : 'INR';

  const row = await prisma.tourPackage.findUnique({ where: { slug } });
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
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Al-Safr
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-64 sm:h-96 rounded-3xl bg-slate-100 overflow-hidden">
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
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{pkg.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              {pkg.destination}
              <span className="text-slate-300">·</span>
              <Calendar className="w-4 h-4 shrink-0" />
              {pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-semibold text-slate-900">{formatPrice(pkg.priceUsd, currency)}</div>
            <div className="text-xs text-slate-400">per person</div>
          </div>
        </div>

        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">{pkg.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Itinerary</h2>
            <ol className="space-y-4">
              {pkg.itinerary.map((day) => (
                <li key={day.day} className="flex gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-semibold text-sm flex items-center justify-center">
                    {day.day}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">{day.title}</div>
                    <p className="text-sm text-slate-500 mt-0.5">{day.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Inclusions</h2>
              <ul className="space-y-1.5">
                {pkg.inclusions.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Exclusions</h2>
              <ul className="space-y-1.5">
                {pkg.exclusions.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
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
