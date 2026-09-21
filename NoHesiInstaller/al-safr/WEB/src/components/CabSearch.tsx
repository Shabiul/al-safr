'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CurrencyCode, formatPrice } from '@/services/flightData';
import { CabOption, CabLocation } from '@/services/cabData';
import {
  Car,
  MapPin,
  Calendar,
  Search,
  Star,
  RefreshCw,
  X,
  Users,
  Gauge,
  ShieldCheck,
} from 'lucide-react';

interface CabSearchProps {
  currency: CurrencyCode;
}

const POPULAR_CITIES = ['Paris', 'Berlin', 'Rome', 'Amsterdam', 'Madrid', 'Bangkok'];

export const CabSearch: React.FC<CabSearchProps> = ({ currency }) => {
  const today = new Date();
  const inTwoDays = new Date(today.getTime() + 2 * 86400000);
  const inThreeDays = new Date(today.getTime() + 3 * 86400000);
  const toLocalInput = (d: Date) => d.toISOString().slice(0, 16);

  const [pickupLabel, setPickupLabel] = useState('Paris');
  const [selectedLocation, setSelectedLocation] = useState<CabLocation | null>(null);
  const [pickupDateTime, setPickupDateTime] = useState(toLocalInput(inTwoDays));
  const [dropoffDateTime, setDropoffDateTime] = useState(toLocalInput(inThreeDays));

  const [isDestOpen, setIsDestOpen] = useState(false);
  const [destSearch, setDestSearch] = useState('');
  const [liveLocations, setLiveLocations] = useState<CabLocation[] | null>(null);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [destSearchError, setDestSearchError] = useState('');
  const destRef = useRef<HTMLDivElement>(null);

  const [cabs, setCabs] = useState<CabOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setIsDestOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedLocation(null);
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
        const res = await fetch(`/api/cabs/locations?query=${encodeURIComponent(term)}`);
        const data = await res.json();
        setLiveLocations(data.locations || []);
        if (data.error) setDestSearchError(data.error);
      } catch {
        setLiveLocations(null);
        setDestSearchError('Could not reach location search — try again.');
      } finally {
        setIsSearchingDest(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [destSearch]);

  const pickLocation = async (name: string) => {
    setIsDestOpen(false);
    setPickupLabel(name);
    setSelectedLocation(null);
    // Popular-city chips don't carry lat/lng/country directly — resolve them
    // the same way the autocomplete does, using the first supported match.
    try {
      const res = await fetch(`/api/cabs/locations?query=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.locations?.[0]) setSelectedLocation(data.locations[0]);
    } catch {
      // leave selectedLocation null — runSearch will surface "pick a location" below
    }
  };

  const runSearch = async () => {
    if (!selectedLocation) {
      setNotice('Pick a location from the dropdown first.');
      setHasSearched(true);
      setCabs([]);
      return;
    }
    setIsLoading(true);
    setNotice('');
    try {
      const params = new URLSearchParams({
        latitude: String(selectedLocation.latitude),
        longitude: String(selectedLocation.longitude),
        country: selectedLocation.country,
        pickupDateTime: pickupDateTime.replace('T', ' ') + ':00',
        dropoffDateTime: dropoffDateTime.replace('T', ' ') + ':00',
      });
      const res = await fetch(`/api/cabs?${params}`, { cache: 'no-store' });
      const data = await res.json();
      setCabs(data.cabs || []);
      setNotice(data.error || '');
    } catch {
      setCabs([]);
      setNotice('Network error while searching cabs');
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-cream rounded-3xl p-5 sm:p-7 space-y-3 soft-border soft-shadow">
        <p className="text-xs font-bold text-slate-400">
          Self-drive car rental — currently available across Europe and parts of Asia (not yet India, UAE, or the US).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div ref={destRef} className="md:col-span-4 relative">
            <button
              type="button"
              onClick={() => {
                setIsDestOpen((v) => !v);
                setDestSearch('');
              }}
              aria-haspopup="listbox"
              aria-expanded={isDestOpen}
              className={`focus-ring w-full text-left p-4 rounded-2xl transition-colors bg-slate-50 hover:bg-slate-100 soft-border ${
                isDestOpen ? 'bg-cream' : ''
              }`}
              style={isDestOpen ? { boxShadow: '5px 5px 0 0 var(--color-ticket-orange)' } : undefined}
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase">
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-ticket-orange)' }} />
                Pickup location
              </div>
              <div className="mt-1 text-xl font-black text-slate-900 tracking-tight truncate">{pickupLabel || 'Where from?'}</div>
            </button>

            {isDestOpen && (
              <div
                role="listbox"
                aria-label="Pickup location"
                className="absolute top-full left-0 right-0 sm:w-96 mt-2 bg-cream rounded-2xl z-50 p-4 space-y-3 soft-border soft-shadow"
              >
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="cab-dest-search" className="sr-only">Search pickup city</label>
                  <input
                    id="cab-dest-search"
                    type="text"
                    autoFocus
                    placeholder="City name…"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    className="focus-ring w-full pl-9 pr-8 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 font-bold soft-border focus:bg-cream"
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
                          onClick={() => pickLocation(city)}
                          className="focus-ring px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[var(--color-ticket-orange)] hover:text-white text-xs font-bold text-slate-700 transition-colors soft-border"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSearchingDest && <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--color-ticket-orange)' }}>Searching…</p>}
                {!isSearchingDest && destSearchError && <p className="text-xs text-rose-600">{destSearchError}</p>}

                {!isSearchingDest && liveLocations && liveLocations.length > 0 && (
                  <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100 pt-1">
                    {liveLocations.map((loc) => (
                      <button
                        key={`${loc.name}-${loc.country}`}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          setPickupLabel(loc.name);
                          setSelectedLocation(loc);
                          setIsDestOpen(false);
                        }}
                        className="focus-ring w-full px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[var(--color-ticket-orange)] group-hover:text-white uppercase text-[10px] font-black transition-colors">
                          {loc.country}
                        </div>
                        <div className="text-sm font-bold text-slate-900">{loc.name}</div>
                      </button>
                    ))}
                  </div>
                )}

                {!isSearchingDest && !destSearchError && liveLocations && liveLocations.length === 0 && destSearch.trim() && (
                  <p className="text-xs text-slate-500">No supported pickup cities found for &quot;{destSearch.trim()}&quot;.</p>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-3 p-4 rounded-2xl bg-slate-50 soft-border">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-ticket-orange)' }} />
              Pickup
            </div>
            <label htmlFor="cab-pickup-datetime" className="sr-only">Pickup date and time</label>
            <input
              id="cab-pickup-datetime"
              type="datetime-local"
              value={pickupDateTime}
              onChange={(e) => setPickupDateTime(e.target.value)}
              className="focus-ring w-full mt-1.5 px-2 py-1.5 bg-cream rounded-lg text-xs font-bold text-slate-900 cursor-pointer soft-border"
            />
          </div>

          <div className="md:col-span-3 p-4 rounded-2xl bg-slate-50 soft-border">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-ticket-orange)' }} />
              Drop-off
            </div>
            <label htmlFor="cab-dropoff-datetime" className="sr-only">Drop-off date and time</label>
            <input
              id="cab-dropoff-datetime"
              type="datetime-local"
              value={dropoffDateTime}
              onChange={(e) => setDropoffDateTime(e.target.value)}
              className="focus-ring w-full mt-1.5 px-2 py-1.5 bg-cream rounded-lg text-xs font-bold text-slate-900 cursor-pointer soft-border"
            />
          </div>

          <div className="md:col-span-2 flex">
            <button
              onClick={runSearch}
              disabled={isLoading}
              className="focus-ring soft-press w-full flex items-center justify-center gap-2 px-4 rounded-2xl disabled:opacity-50 text-white text-sm font-black transition-colors soft-border soft-shadow"
              style={{ backgroundColor: 'var(--color-ticket-orange)' }}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-black text-slate-900">
              {cabs.length} {cabs.length === 1 ? 'car' : 'cars'} found
              <span className="ml-2 text-sm font-normal text-slate-500">{pickupLabel}</span>
            </h2>
            {notice && <p className="text-xs text-slate-400">{notice}</p>}
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl space-y-3 soft-border">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto" style={{ color: 'var(--color-ticket-orange)' }} />
              <div className="font-black text-sm text-slate-700">Searching cars…</div>
            </div>
          ) : cabs.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                <Car className="w-7 h-7 text-white" />
              </div>
              <div className="font-black text-sm text-slate-700">No cars found</div>
              <p className="text-sm text-slate-500 max-w-md mx-auto">{notice || 'Try a different location or dates.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cabs.map((cab, i) => (
                <div
                  key={cab.id}
                  className={`bg-cream rounded-2xl transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col soft-border soft-shadow-sm ${i % 3 === 1 ? 'sm:-translate-y-2' : ''}`}
                >
                  <div className="h-32 bg-slate-50 flex items-center justify-center p-4 border-b-[3px]" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
                    {cab.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cab.imageUrl} alt={cab.name} className="max-h-full object-contain" />
                    ) : (
                      <Car className="w-10 h-10 text-slate-300" />
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h3 className="font-black text-sm text-slate-900">{cab.name}</h3>
                    <p className="text-xs text-slate-500">{cab.subtitle}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      {cab.specs && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {cab.specs}
                        </span>
                      )}
                      {cab.transmission && (
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          {cab.transmission}
                        </span>
                      )}
                    </div>

                    {cab.freeCancellation && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full w-fit text-white"
                        style={{ backgroundColor: 'var(--color-ticket-orange)' }}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Free cancellation
                      </span>
                    )}

                    <div className="mt-auto pt-2 border-t-2 flex items-center justify-between" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
                      <div>
                        <div className="text-xs text-slate-500">{cab.supplierName}</div>
                        {cab.supplierRating != null && (
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {cab.supplierRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      {cab.priceUsd != null && (
                        <div className="text-right">
                          <div className="text-base font-black text-slate-900">{formatPrice(cab.priceUsd, currency)}</div>
                          <div className="text-[10px] text-slate-400">total</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
