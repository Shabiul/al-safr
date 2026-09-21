'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { TourPackage } from '@/services/tourPackageData';
import { MapPin, ArrowRight, RefreshCw, Compass, Search, CheckCircle2, UtensilsCrossed, Heart, Flame, SlidersHorizontal, Star } from 'lucide-react';

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

function countBy<T>(items: T[], key: (item: T) => string | null | undefined): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export const TourPackages: React.FC<TourPackagesProps> = ({ currency }) => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('relevance');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Filters — all backed by real fields on the actual catalogue, never
  // fabricated categories.
  const [selectedDestinations, setSelectedDestinations] = useState<Set<string>>(new Set());
  const [maxNights, setMaxNights] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedHotelCategories, setSelectedHotelCategories] = useState<Set<number>>(new Set());
  const [selectedTourTypes, setSelectedTourTypes] = useState<Set<string>>(new Set());
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false);

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

  // Real facet data derived from the actual catalogue.
  const destinationCounts = useMemo(() => countBy(packages, (p) => p.destination), [packages]);
  const tourTypeCounts = useMemo(() => countBy(packages, (p) => p.tourType), [packages]);
  const themeCounts = useMemo(() => countBy(packages, (p) => p.theme), [packages]);
  const hotelCategoryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const p of packages) {
      if (p.hotelCategory) counts.set(p.hotelCategory, (counts.get(p.hotelCategory) ?? 0) + 1);
    }
    return counts;
  }, [packages]);
  const freeCancellationCount = useMemo(() => packages.filter((p) => p.freeCancellation).length, [packages]);

  const nightsBounds = useMemo(() => {
    if (packages.length === 0) return { min: 0, max: 1 };
    const nights = packages.map((p) => Math.max(0, p.durationDays - 1));
    return { min: Math.min(...nights), max: Math.max(...nights) };
  }, [packages]);

  const priceBounds = useMemo(() => {
    if (packages.length === 0) return { min: 0, max: 1 };
    const prices = packages.map((p) => p.priceUsd);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [packages]);

  const budgetBuckets = useMemo(() => {
    if (packages.length === 0) return [];
    const prices = packages.map((p) => p.priceUsd);
    const max = Math.max(...prices);
    const step = Math.max(1, Math.ceil(max / 4));
    return [0, 1, 2, 3].map((i) => {
      const lo = i * step;
      const hi = i === 3 ? Infinity : (i + 1) * step;
      const count = prices.filter((p) => p >= lo && p < hi).length;
      return { lo, hi, count };
    });
  }, [packages]);

  const effectiveMaxNights = maxNights ?? nightsBounds.max;
  const effectiveMaxPrice = maxPrice ?? priceBounds.max;

  const toggleSetValue = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const hasActiveFilters =
    selectedDestinations.size > 0 ||
    maxNights != null ||
    maxPrice != null ||
    selectedHotelCategories.size > 0 ||
    selectedTourTypes.size > 0 ||
    selectedThemes.size > 0 ||
    freeCancellationOnly;

  const clearFilters = () => {
    setSelectedDestinations(new Set());
    setMaxNights(null);
    setMaxPrice(null);
    setSelectedHotelCategories(new Set());
    setSelectedTourTypes(new Set());
    setSelectedThemes(new Set());
    setFreeCancellationOnly(false);
  };

  const filteredSorted = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = packages;
    if (term) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(term) || p.destination.toLowerCase().includes(term)
      );
    }
    if (selectedDestinations.size > 0) {
      list = list.filter((p) => selectedDestinations.has(p.destination));
    }
    if (maxNights != null) {
      list = list.filter((p) => Math.max(0, p.durationDays - 1) <= maxNights);
    }
    if (maxPrice != null) {
      list = list.filter((p) => p.priceUsd <= maxPrice);
    }
    if (selectedHotelCategories.size > 0) {
      list = list.filter((p) => p.hotelCategory != null && selectedHotelCategories.has(p.hotelCategory));
    }
    if (selectedTourTypes.size > 0) {
      list = list.filter((p) => p.tourType != null && selectedTourTypes.has(p.tourType));
    }
    if (selectedThemes.size > 0) {
      list = list.filter((p) => p.theme != null && selectedThemes.has(p.theme));
    }
    if (freeCancellationOnly) {
      list = list.filter((p) => p.freeCancellation);
    }

    const sorted = [...list];
    if (sortKey === 'price_low') sorted.sort((a, b) => a.priceUsd - b.priceUsd);
    else if (sortKey === 'price_high') sorted.sort((a, b) => b.priceUsd - a.priceUsd);
    else if (sortKey === 'duration_short') sorted.sort((a, b) => a.durationDays - b.durationDays);
    else if (sortKey === 'duration_long') sorted.sort((a, b) => b.durationDays - a.durationDays);
    return sorted;
  }, [
    packages,
    query,
    sortKey,
    selectedDestinations,
    maxNights,
    maxPrice,
    selectedHotelCategories,
    selectedTourTypes,
    selectedThemes,
    freeCancellationOnly,
  ]);

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
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
      {/* FILTERS SIDEBAR */}
      <aside className="bg-cream rounded-2xl p-5 space-y-6 h-fit lg:sticky lg:top-20 soft-border soft-shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-black text-slate-900 uppercase">
            <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--color-ticket-orange)' }} />
            Filters
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="focus-ring text-xs font-bold text-slate-400 hover:text-slate-700">
              Clear
            </button>
          )}
        </div>

        {destinationCounts.size > 1 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600">Destination</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {[...destinationCounts.entries()].sort((a, b) => b[1] - a[1]).map(([dest, count]) => (
                <label key={dest} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDestinations.has(dest)}
                    onChange={() => toggleSetValue(setSelectedDestinations, dest)}
                    className="rounded accent-[var(--color-ticket-orange)]"
                  />
                  <span className="flex-1 truncate">{dest}</span>
                  <span className="text-xs text-slate-400 font-bold">({count})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {nightsBounds.max > nightsBounds.min && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Duration (nights)</span>
              <span className="text-slate-900 font-black">up to {effectiveMaxNights}N</span>
            </div>
            <input
              type="range"
              min={nightsBounds.min}
              max={nightsBounds.max}
              step={1}
              value={effectiveMaxNights}
              onChange={(e) => setMaxNights(Number(e.target.value))}
              className="w-full accent-[var(--color-ticket-orange)]"
            />
          </div>
        )}

        {priceBounds.max > priceBounds.min && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Budget (per person)</span>
              <span className="text-slate-900 font-black">up to {formatPrice(effectiveMaxPrice, currency)}</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1}
              value={effectiveMaxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[var(--color-ticket-orange)]"
            />
            {budgetBuckets.length > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {budgetBuckets.map(({ lo, hi, count }) => {
                  const active = maxPrice === (hi === Infinity ? priceBounds.max : hi - 1);
                  return (
                    <button
                      key={lo}
                      type="button"
                      disabled={count === 0}
                      onClick={() => setMaxPrice(hi === Infinity ? priceBounds.max : hi - 1)}
                      className={`focus-ring px-2 py-1 rounded-full text-[11px] font-bold transition-colors soft-border disabled:opacity-40 disabled:cursor-not-allowed ${
                        active ? 'text-white' : 'bg-cream text-slate-600 hover:bg-slate-50'
                      }`}
                      style={active ? { backgroundColor: 'var(--color-ticket-orange)' } : undefined}
                    >
                      {hi === Infinity ? `> ${formatPrice(lo, currency)}` : `${formatPrice(lo, currency)}–${formatPrice(hi, currency)}`} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {hotelCategoryCounts.size > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600">Hotel category</span>
            <div className="flex flex-wrap gap-1.5">
              {[3, 4, 5].filter((n) => hotelCategoryCounts.has(n)).map((n) => {
                const active = selectedHotelCategories.has(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleSetValue(setSelectedHotelCategories, n)}
                    className={`focus-ring flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold soft-border transition-colors ${
                      active ? 'text-white' : 'bg-cream text-slate-600 hover:bg-slate-50'
                    }`}
                    style={active ? { backgroundColor: 'var(--color-ticket-orange)' } : undefined}
                  >
                    {n}
                    <Star className={`w-3 h-3 ${active ? 'fill-white' : 'fill-amber-400'}`} />
                    <span className="opacity-70">({hotelCategoryCounts.get(n)})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tourTypeCounts.size > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600">Type of tour</span>
            <div className="space-y-1.5">
              {[...tourTypeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <label key={type} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTourTypes.has(type)}
                    onChange={() => toggleSetValue(setSelectedTourTypes, type)}
                    className="rounded accent-[var(--color-ticket-orange)]"
                  />
                  <span className="flex-1 truncate">{type}</span>
                  <span className="text-xs text-slate-400 font-bold">({count})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {themeCounts.size > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600">Package theme</span>
            <div className="space-y-1.5">
              {[...themeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([theme, count]) => (
                <label key={theme} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedThemes.has(theme)}
                    onChange={() => toggleSetValue(setSelectedThemes, theme)}
                    className="rounded accent-[var(--color-ticket-orange)]"
                  />
                  <span className="flex-1 truncate">{theme}</span>
                  <span className="text-xs text-slate-400 font-bold">({count})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {freeCancellationCount > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600">Other filters</span>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={freeCancellationOnly}
                onChange={(e) => setFreeCancellationOnly(e.target.checked)}
                className="rounded accent-[var(--color-ticket-orange)]"
              />
              <span className="flex-1">Free cancellation</span>
              <span className="text-xs text-slate-400 font-bold">({freeCancellationCount})</span>
            </label>
          </div>
        )}
      </aside>

      {/* RESULTS */}
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
            <div className="font-black text-sm text-slate-700">No packages match your filters</div>
            <p className="text-sm text-slate-500">Try a different search, or loosen your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  className={`group bg-cream rounded-2xl hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col soft-border soft-shadow-sm ${i % 2 === 1 ? 'sm:-translate-y-2' : ''}`}
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
                      {pkg.hotelCategory && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-0.5 font-bold text-amber-600">
                            {pkg.hotelCategory}
                            <Star className="w-3 h-3 fill-amber-400" />
                          </span>
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
                      {pkg.freeCancellation && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-sky-600">Free Cancellation</span>
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
    </div>
  );
};
