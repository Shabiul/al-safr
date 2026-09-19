'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { HotelOption } from '@/services/hotelData';
import {
  Building2,
  Calendar,
  Users,
  Search,
  Star,
  MapPin,
  RefreshCw,
  ExternalLink,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

interface HotelSearchProps {
  currency: CurrencyCode;
}

interface LocationSuggestion {
  destId: string;
  destType: string;
  name: string;
  label: string;
  country: string;
  hotelCount: number;
}

type SortKey = 'popularity' | 'price_low' | 'price_high' | 'rating';

const POPULAR_CITIES = ['Dubai', 'London', 'Riyadh', 'Mumbai', 'Delhi', 'Tokyo', 'Singapore', 'Paris'];

export const HotelSearch: React.FC<HotelSearchProps> = ({ currency }) => {
  const today = new Date();
  const inThreeDays = new Date(today.getTime() + 3 * 86400000);
  const inFourDays = new Date(today.getTime() + 4 * 86400000);

  const [destination, setDestination] = useState('Dubai');
  const [selectedDest, setSelectedDest] = useState<{ destId: string; destType: string } | null>(null);
  const [checkinDate, setCheckinDate] = useState(inThreeDays.toISOString().split('T')[0]);
  const [checkoutDate, setCheckoutDate] = useState(inFourDays.toISOString().split('T')[0]);
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  // Destination autocomplete popover
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [destSearch, setDestSearch] = useState('');
  const [liveLocations, setLiveLocations] = useState<LocationSuggestion[] | null>(null);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [destSearchError, setDestSearchError] = useState('');
  const destRef = useRef<HTMLDivElement>(null);

  // Travelers popover
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  // Filters & sort (client-side, applied over the fetched result set)
  const [sortKey, setSortKey] = useState<SortKey>('popularity');
  const [maxPrice, setMaxPrice] = useState(500);
  const [starFilters, setStarFilters] = useState<Set<number>>(new Set());
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setIsDestOpen(false);
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setIsGuestsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live destination search (Booking.com locations) once 2+ chars are typed.
  // Typing a fresh query invalidates whatever was picked earlier — otherwise
  // hitting Search after editing the text (without picking a new suggestion)
  // would silently search the *old* selected city instead of the typed one.
  useEffect(() => {
    setSelectedDest(null);
    const term = destSearch.trim();
    if (term.length < 2) {
      setLiveLocations(null);
      setDestSearchError('');
      return;
    }
    setIsSearchingDest(true);
    setDestSearchError('');
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/hotels/locations?query=${encodeURIComponent(term)}`);
        const data = await res.json();
        setLiveLocations(data.locations || []);
        if (data.error) setDestSearchError(data.error);
      } catch {
        setLiveLocations(null);
        setDestSearchError('Could not reach the destination search — try again.');
      } finally {
        setIsSearchingDest(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [destSearch]);

  const runSearch = async () => {
    setIsLoading(true);
    setNotice('');
    setIsDestOpen(false);
    try {
      const params = new URLSearchParams({
        destination,
        checkinDate,
        checkoutDate,
        adults: String(adults),
        rooms: String(rooms),
      });
      if (selectedDest) {
        params.set('destId', selectedDest.destId);
        params.set('destType', selectedDest.destType);
      }
      const res = await fetch(`/api/hotels?${params}`, { cache: 'no-store' });
      const data = await res.json();
      setHotels(data.hotels || []);
      setNotice(data.error || '');
    } catch {
      setHotels([]);
      setNotice('Network error while searching hotels');
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const filteredSorted = useMemo(() => {
    let list = hotels.filter((h) => (h.priceUsd == null ? true : h.priceUsd <= maxPrice));
    if (starFilters.size > 0) list = list.filter((h) => starFilters.has(h.stars));
    if (minRating > 0) list = list.filter((h) => (h.reviewScore ?? 0) >= minRating);

    const sorted = [...list];
    if (sortKey === 'price_low') sorted.sort((a, b) => (a.priceUsd ?? Infinity) - (b.priceUsd ?? Infinity));
    else if (sortKey === 'price_high') sorted.sort((a, b) => (b.priceUsd ?? -1) - (a.priceUsd ?? -1));
    else if (sortKey === 'rating') sorted.sort((a, b) => (b.reviewScore ?? 0) - (a.reviewScore ?? 0));
    return sorted;
  }, [hotels, maxPrice, starFilters, minRating, sortKey]);

  const toggleStar = (star: number) => {
    setStarFilters((prev) => {
      const next = new Set(prev);
      if (next.has(star)) next.delete(star);
      else next.add(star);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* MakeMyTrip-style search bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-border max-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* DESTINATION CARD */}
          <div ref={destRef} className="md:col-span-4 relative">
            <button
              type="button"
              onClick={() => {
                setIsDestOpen((v) => !v);
                setIsGuestsOpen(false);
                setDestSearch('');
              }}
              aria-haspopup="listbox"
              aria-expanded={isDestOpen}
              className={`focus-ring w-full text-left p-4 rounded-2xl transition-colors bg-slate-50 hover:bg-slate-100 max-border ${
                isDestOpen ? 'bg-white' : ''
              }`}
              style={isDestOpen ? { boxShadow: '5px 5px 0 0 var(--color-max-blue)' } : undefined}
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase">
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-max-blue)' }} />
                City, area or hotel
              </div>
              <div className="mt-1 text-xl font-black text-slate-900 tracking-tight truncate">{destination || 'Where to?'}</div>
            </button>

            {isDestOpen && (
              <div
                role="listbox"
                aria-label="Destination"
                className="absolute top-full left-0 right-0 sm:w-96 mt-2 bg-white rounded-2xl z-50 p-4 space-y-3 max-border max-shadow"
              >
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="hotel-dest-search" className="sr-only">
                    Search city, area or hotel
                  </label>
                  <input
                    id="hotel-dest-search"
                    type="text"
                    autoFocus
                    placeholder="City, area, or hotel name…"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    className="focus-ring w-full pl-9 pr-8 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 font-bold max-border focus:bg-white"
                  />
                  {destSearch && (
                    <button
                      type="button"
                      onClick={() => setDestSearch('')}
                      aria-label="Clear search"
                      className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {!destSearch.trim() && (
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Popular</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_CITIES.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setDestination(city);
                            setSelectedDest(null);
                            setIsDestOpen(false);
                          }}
                          className="focus-ring px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[var(--color-max-blue)] hover:text-white text-xs font-bold text-slate-700 transition-colors max-border"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSearchingDest && <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--color-max-blue)' }}>Searching destinations…</p>}

                {!isSearchingDest && destSearchError && (
                  <p className="text-xs text-rose-600">{destSearchError}</p>
                )}

                {!isSearchingDest && liveLocations && liveLocations.length > 0 && (
                  <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100 pt-1">
                    {liveLocations.map((loc) => (
                      <button
                        key={`${loc.destType}-${loc.destId}`}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          setDestination(loc.name);
                          setSelectedDest({ destId: loc.destId, destType: loc.destType });
                          setIsDestOpen(false);
                        }}
                        className="focus-ring w-full px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[var(--color-max-blue)] group-hover:text-white transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{loc.label}</div>
                          <div className="text-xs text-slate-500">{loc.hotelCount.toLocaleString()} hotels</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No live matches — still let the typed text through as a
                    plain destination name; /api/hotels resolves by name when
                    no destId/destType is supplied. */}
                {!isSearchingDest && !destSearchError && liveLocations && liveLocations.length === 0 && destSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestination(destSearch.trim());
                      setSelectedDest(null);
                      setIsDestOpen(false);
                    }}
                    className="focus-ring w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center gap-2 text-sm font-black max-border"
                    style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    Use &quot;{destSearch.trim()}&quot; as destination
                  </button>
                )}
              </div>
            )}
          </div>

          {/* DATES CARD */}
          <div className="md:col-span-4 p-4 rounded-2xl bg-slate-50 max-border">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-max-blue)' }} />
              Check-in &amp; check-out
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <div>
                <label htmlFor="hotel-checkin" className="sr-only">Check-in date</label>
                <input
                  id="hotel-checkin"
                  type="date"
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className="focus-ring w-full px-2 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-900 cursor-pointer max-border"
                />
              </div>
              <div>
                <label htmlFor="hotel-checkout" className="sr-only">Check-out date</label>
                <input
                  id="hotel-checkout"
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="focus-ring w-full px-2 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-900 cursor-pointer max-border"
                />
              </div>
            </div>
          </div>

          {/* GUESTS/ROOMS CARD */}
          <div ref={guestsRef} className="md:col-span-2 relative">
            <button
              type="button"
              onClick={() => {
                setIsGuestsOpen((v) => !v);
                setIsDestOpen(false);
              }}
              aria-haspopup="dialog"
              aria-expanded={isGuestsOpen}
              className="focus-ring w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors max-border"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-max-blue)' }} />
                  Guests
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
              </div>
              <div className="mt-1 text-lg font-black text-slate-900">{adults} guest{adults === 1 ? '' : 's'}</div>
              <div className="text-xs text-slate-500">{rooms} room{rooms === 1 ? '' : 's'}</div>
            </button>

            {isGuestsOpen && (
              <div className="absolute top-full right-0 w-64 mt-2 bg-white rounded-2xl z-50 p-4 space-y-4 max-border max-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">Adults</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} aria-label="Decrease adults" className="focus-ring w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center max-border">−</button>
                    <span className="font-black text-sm w-4 text-center" aria-live="polite">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(16, adults + 1))} aria-label="Increase adults" className="focus-ring w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center max-border">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">Rooms</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} aria-label="Decrease rooms" className="focus-ring w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center max-border">−</button>
                    <span className="font-black text-sm w-4 text-center" aria-live="polite">{rooms}</span>
                    <button type="button" onClick={() => setRooms(Math.min(8, rooms + 1))} aria-label="Increase rooms" className="focus-ring w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center max-border">+</button>
                  </div>
                </div>
                <div className="pt-2 border-t-2" style={{ borderColor: 'var(--color-ink)' }}>
                  <button type="button" onClick={() => setIsGuestsOpen(false)} className="focus-ring max-press w-full py-1.5 text-white rounded-lg text-sm font-black transition-colors max-border" style={{ backgroundColor: 'var(--color-max-blue)' }}>Done</button>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH BUTTON */}
          <div className="md:col-span-2 flex">
            <button
              onClick={runSearch}
              disabled={isLoading || !destination.trim()}
              className="focus-ring max-press w-full flex items-center justify-center gap-2 px-4 rounded-2xl disabled:opacity-50 text-white text-sm font-black transition-colors max-border max-shadow"
              style={{ backgroundColor: 'var(--color-max-blue)' }}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          {/* FILTERS SIDEBAR */}
          <aside className="bg-white rounded-2xl p-5 space-y-6 h-fit lg:sticky lg:top-20 max-border max-shadow-sm">
            <div className="flex items-center gap-1.5 text-sm font-black text-slate-900 uppercase">
              <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--color-max-blue)' }} />
              Filters
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Max price / night</span>
                <span className="text-slate-900 font-black">{formatPrice(maxPrice, currency)}</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={25}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[var(--color-max-blue)]"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">Star rating</span>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <label key={star} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={starFilters.has(star)}
                      onChange={() => toggleStar(star)}
                      className="rounded accent-[var(--color-max-blue)]"
                    />
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: star }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">Guest rating</span>
              <div className="flex flex-wrap gap-1.5">
                {[0, 6, 7, 8, 9].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMinRating(r)}
                    className={`focus-ring px-2.5 py-1 rounded-full text-xs font-black transition-colors max-border ${
                      minRating === r ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    style={minRating === r ? { backgroundColor: 'var(--color-max-blue)' } : undefined}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {filteredSorted.length} {filteredSorted.length === 1 ? 'hotel' : 'hotels'} found
                  <span className="ml-2 text-sm font-normal text-slate-500">{destination}</span>
                </h2>
                {notice && <p className="text-xs text-slate-400">{notice}</p>}
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs sm:text-sm max-border">
                {([
                  ['popularity', 'Popularity'],
                  ['price_low', 'Price: Low to High'],
                  ['price_high', 'Price: High to Low'],
                  ['rating', 'Guest Rating'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortKey(key)}
                    aria-pressed={sortKey === key}
                    className={`focus-ring px-3 py-1.5 rounded-lg font-black transition-colors whitespace-nowrap ${
                      sortKey === key ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    style={sortKey === key ? { backgroundColor: 'var(--color-max-blue)', color: 'white' } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl space-y-3 max-border">
                <RefreshCw className="w-7 h-7 animate-spin mx-auto" style={{ color: 'var(--color-max-blue)' }} />
                <div className="font-black text-sm text-slate-700">Searching hotels…</div>
              </div>
            ) : filteredSorted.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto max-border" style={{ backgroundColor: 'var(--color-max-blue)' }}>
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="font-black text-sm text-slate-700">No hotels match your filters</div>
                <p className="text-sm text-slate-500 max-w-md mx-auto">{notice || 'Try a different destination, dates, or loosen your filters.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSorted.map((hotel) => (
                  <a
                    key={hotel.id}
                    href={hotel.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-2xl hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col sm:flex-row max-border max-shadow-sm"
                  >
                    <div className="w-full sm:w-56 h-44 sm:h-auto shrink-0 bg-slate-100 overflow-hidden border-b-[3px] sm:border-b-0 sm:border-r-[3px]" style={{ borderColor: 'var(--color-ink)' }}>
                      {hotel.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={hotel.photoUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Building2 className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col sm:flex-row sm:items-stretch gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-base text-slate-900 leading-snug">{hotel.name}</h3>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-1" />
                        </div>

                        {hotel.stars > 0 && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {hotel.address || hotel.city}
                          {hotel.distanceToCenterKm != null && (
                            <span className="text-slate-400">· {hotel.distanceToCenterKm.toFixed(1)} km from center</span>
                          )}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:min-w-[120px] sm:border-l-2 sm:pl-4" style={{ borderColor: 'var(--color-ink)' }}>
                        {hotel.reviewScore != null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-max-blue)' }}>
                              {hotel.reviewScore.toFixed(1)}
                            </span>
                            {hotel.reviewCount != null && (
                              <span className="text-[11px] text-slate-400">{hotel.reviewCount.toLocaleString()} reviews</span>
                            )}
                          </div>
                        )}
                        {hotel.priceUsd != null ? (
                          <div className="text-right">
                            <div className="text-lg font-black text-slate-900">{formatPrice(hotel.priceUsd, currency)}</div>
                            <div className="text-[11px] text-slate-400">per night</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Price unavailable</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
