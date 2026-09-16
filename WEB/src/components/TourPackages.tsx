'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { MapPin, Calendar, ArrowRight, RefreshCw, Compass } from 'lucide-react';

interface TourPackagesProps {
  currency: CurrencyCode;
}

export const TourPackages: React.FC<TourPackagesProps> = ({ currency }) => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/tour-packages', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        setPackages(data.packages || []);
        setNotice(data.error || '');
      } catch {
        if (!cancelled) setNotice('Network error while loading tour packages');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <RefreshCw className="w-7 h-7 text-brand-600 animate-spin mx-auto" />
        <div className="font-medium text-sm text-slate-700">Loading tour packages…</div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
        <Compass className="w-8 h-8 text-slate-300 mx-auto" />
        <div className="font-medium text-sm text-slate-700">No tour packages available right now</div>
        {notice && <p className="text-sm text-slate-500 max-w-md mx-auto">{notice}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        {packages.length} {packages.length === 1 ? 'package' : 'packages'} available
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Link
            key={pkg.id}
            href={`/tour-packages/${pkg.slug}?currency=${currency}`}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
          >
            <div className="h-44 bg-slate-100 overflow-hidden">
              {pkg.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Compass className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2">
              <h3 className="font-semibold text-base text-slate-900 leading-snug">{pkg.name}</h3>

              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {pkg.destination}
                <span className="text-slate-300">·</span>
                <Calendar className="w-3 h-3 shrink-0" />
                {pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">{pkg.summary}</p>

              <div className="mt-auto pt-2 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{formatPrice(pkg.priceUsd, currency)}</div>
                  <div className="text-[11px] text-slate-400">per person</div>
                </div>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-700 text-sm font-medium text-slate-700 transition-colors">
                  View details
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
