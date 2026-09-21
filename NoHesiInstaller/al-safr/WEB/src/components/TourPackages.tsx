'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { MapPin, ArrowRight, RefreshCw, Compass, Search, CheckCircle2, UtensilsCrossed, Heart, Flame } from 'lucide-react';

interface TourPackagesProps {
  currency: CurrencyCode;
}

const WISHLIST_KEY = 'al-safr-wishlist';

function loadWishlist(): Set<string> {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

type SortKey = 'relevance' | 'price_low' | 'price_high' | 'duration_short' | 'duration_long';

const SORT_OPTIONS: [SortKey, string][] = [
  ['relevance', 'Relevance'],
  ['price_low', 'Price: Low to High'],
  ['price_high', 'Price: High to Low'],
  ['duration_short', 'Duration: Short to Long'],
  ['duration_long', 'Duration: Long to Short'],
];

const MEAL_KEYWORDS = ['meal', 'breakfast', 'lunch', 'dinner'];

export const TourPackages: React.FC<TourPackagesProps> = ({ currency }) => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('relevance');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Per-browser saved list — genuinely persists (localStorage), not a
  // decorative heart that resets on refresh. Deliberately an effect rather
  // than a lazy useState initializer: this component renders on the server
  // first (no localStorage there), so reading it during render would make
  // the client's hydrated output diverge from the server-rendered HTML for
  // any package already saved from a past visit — a real hydration
  // mismatch, not just a lint nag. Loading it post-mount avoids that.
  useEffect(() => {
    setWishlist(loadWishlist());
  }, []);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify([...next]));
      } catch {
        // Private browsing / storage disabled — the toggle still works for
        // this render, it just won't survive a refresh.
      }
      return next;
    });
  };

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

  const filteredSorted = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = packages;
    if (term) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(term) || p.destination.toLowerCase().includes(term)
      );
    }

    const sorted = [...list];
    if (sortKey === 'price_low') sorted.sort((a, b) => a.priceUsd - b.priceUsd);
    else if (sortKey === 'price_high') sorted.sort((a, b) => b.priceUsd - a.priceUsd);
    else if (sortKey === 'duration_short') sorted.sort((a, b) => a.durationDays - b.durationDays);
    else if (sortKey === 'duration_long') sorted.sort((a, b) => b.durationDays - a.durationDays);
    return sorted;
  }, [packages, query, sortKey]);

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-2xl space-y-3 soft-border">
        <RefreshCw className="w-7 h-7 animate-spin mx-auto" style={{ color: 'var(--color-ticket-orange)' }} />
        <div className="font-black text-sm text-slate-700">Loading tour packages…</div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-2">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
          <Compass className="w-7 h-7 text-white" />
        </div>
        <div className="font-black text-sm text-slate-700">No tour packages available right now</div>
        {notice && <p className="text-sm text-slate-500 max-w-md mx-auto">{notice}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">
          Showing {filteredSorted.length} of {packages.length} {packages.length === 1 ? 'package' : 'packages'}
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <label htmlFor="package-search" className="sr-only">Search packages</label>
            <input
              id="package-search"
              type="text"
              placeholder="Search packages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="focus-ring pl-9 pr-3 py-2 bg-cream rounded-xl text-sm text-slate-900 font-bold soft-border w-full sm:w-56"
            />
          </div>
          <div className="relative">
            <label htmlFor="package-sort" className="sr-only">Sort by</label>
            <select
              id="package-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="focus-ring appearance-none pl-3 pr-8 py-2 bg-cream rounded-xl text-sm text-slate-900 font-bold soft-border cursor-pointer"
            >
              {SORT_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredSorted.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-2">
          <div className="font-black text-sm text-slate-700">No packages match &quot;{query}&quot;</div>
          <p className="text-sm text-slate-500">Try a different destination or package name.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSorted.map((pkg, i) => {
            const nights = Math.max(0, pkg.durationDays - 1);
            const hasMeals = pkg.inclusions.some((item) =>
              MEAL_KEYWORDS.some((kw) => item.toLowerCase().includes(kw))
            );
            const highlights = pkg.itinerary.slice(0, 6);
            const isSaved = wishlist.has(pkg.id);
            const hasDiscount = pkg.originalPriceUsd != null && pkg.originalPriceUsd > pkg.priceUsd;
            const discountPct = hasDiscount
              ? Math.round((1 - pkg.priceUsd / pkg.originalPriceUsd!) * 100)
              : 0;

            return (
              <Link
                key={pkg.id}
                href={`/tour-packages/${pkg.slug}?currency=${currency}`}
                className={`group bg-cream rounded-2xl hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col soft-border soft-shadow-sm ${i % 3 === 1 ? 'sm:-translate-y-2' : ''}`}
              >
                <div className="h-44 bg-slate-100 overflow-hidden relative border-b-[1.5px]" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
                  {pkg.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Compass className="w-10 h-10" />
                    </div>
                  )}

                  {pkg.featured && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase text-white bg-rose-600">
                      <Flame className="w-3 h-3" />
                      Hot
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(e, pkg.id)}
                    aria-label={isSaved ? 'Remove from saved' : 'Save package'}
                    aria-pressed={isSaved}
                    className="focus-ring absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-600 text-rose-600' : 'text-slate-500'}`} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base text-slate-900 leading-snug">{pkg.name}</h3>
                    <span className="shrink-0 text-[11px] font-black text-slate-600 px-2 py-1 rounded-full soft-border whitespace-nowrap">
                      {nights}N / {pkg.durationDays}D
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--color-ticket-orange)' }} />
                      {pkg.destination}
                    </span>
                    {pkg.tourType && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-bold text-violet-600">{pkg.tourType}</span>
                      </>
                    )}
                    {hasMeals && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <UtensilsCrossed className="w-3 h-3 shrink-0" />
                          Meals Included
                        </span>
                      </>
                    )}
                  </div>

                  {highlights.length > 0 && (
                    <div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-1">
                        {highlights.map((day) => (
                          <li key={day.day} className="flex items-start gap-1.5 text-xs text-slate-600 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--color-ticket-orange)' }} />
                            {day.title}
                          </li>
                        ))}
                      </ul>
                      {pkg.itinerary.length > highlights.length && (
                        <div className="text-xs text-slate-400 font-bold pt-1">
                          +{pkg.itinerary.length - highlights.length} more days
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <div>
                      {hasDiscount && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 line-through">{formatPrice(pkg.originalPriceUsd!, currency)}</span>
                          <span className="text-[11px] font-black text-emerald-600">{discountPct}% off</span>
                        </div>
                      )}
                      <div className="text-lg font-black text-slate-900">{formatPrice(pkg.priceUsd, currency)}</div>
                      <div className="text-[11px] text-slate-400">per person</div>
                    </div>
                    <span
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-black text-white transition-colors soft-border"
                      style={{ backgroundColor: 'var(--color-ticket-orange)' }}
                    >
                      View details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
