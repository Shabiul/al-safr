'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AIRPORTS,
  Airport,
  CurrencyCode,
} from '@/services/flightData';
import {
  PlaneTakeoff,
  PlaneLanding,
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  Zap,
  Check,
  X,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface AirportLite {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface FlightSearchProps {
  currency: CurrencyCode;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  cabinClass: 'economy' | 'business' | 'first';
  passengers: number;
  supersonicOnly: boolean;
  onSearch: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    cabinClass: 'economy' | 'business' | 'first';
    passengers: number;
    supersonicOnly: boolean;
  }) => void;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({
  currency,
  origin,
  destination,
  departureDate,
  returnDate,
  cabinClass,
  passengers,
  supersonicOnly,
  onSearch,
}) => {
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');

  // Selected airport objects or custom strings
  const [curOrigin, setCurOrigin] = useState(origin);
  const [curDest, setCurDest] = useState(destination);
  // Full resolved airport (name/city/country) for whichever code is
  // currently selected — keeps the display card honest instead of falling
  // back to a generic "<code> Airport" placeholder for real, live-resolved
  // airports that just aren't in the small static shortlist (e.g. LKO).
  const [originResolved, setOriginResolved] = useState<AirportLite | null>(null);
  const [destResolved, setDestResolved] = useState<AirportLite | null>(null);
  const [curDepDate, setCurDepDate] = useState(departureDate);
  const [curRetDate, setCurRetDate] = useState(returnDate);
  const [curCabin, setCurCabin] = useState<'economy' | 'business' | 'first'>(cabinClass);
  const [curPassengers, setCurPassengers] = useState(passengers);
  const [curSupersonic, setCurSupersonic] = useState(supersonicOnly);

  // Dropdown states for MakeMyTrip style autocomplete
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);

  // Swap animation trigger
  const [isSwapping, setIsSwapping] = useState(false);

  // Live airport search results (Google Flights auto-complete) — resolves
  // any real city/airport, not just the small static shortlist.
  const [liveOrigins, setLiveOrigins] = useState<AirportLite[] | null>(null);
  const [liveDests, setLiveDests] = useState<AirportLite[] | null>(null);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setIsDestOpen(false);
      }
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setIsPassengerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to find airport info — prefers a live-resolved match (real name/
  // city/country) over the generic "<code> Airport" placeholder.
  const getAirportInfo = (query: string, resolved: AirportLite | null) => {
    if (resolved && resolved.code.toUpperCase() === query.toUpperCase()) return resolved;
    const match = AIRPORTS.find(
      (a) =>
        a.code.toUpperCase() === query.toUpperCase() ||
        a.city.toUpperCase() === query.toUpperCase()
    );
    if (match) return match;
    return {
      code: query.length <= 4 ? query.toUpperCase() : query.substring(0, 3).toUpperCase(),
      name: `${query} Airport`,
      city: query,
      country: 'International Port',
    };
  };

  const originInfo = getAirportInfo(curOrigin, originResolved);
  const destInfo = getAirportInfo(curDest, destResolved);

  // Filter the static shortlist (used until live results arrive / as fallback)
  const filterAirports = (searchTerm: string) => {
    if (!searchTerm.trim()) return AIRPORTS;
    const term = searchTerm.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term) ||
        a.code.toLowerCase().includes(term) ||
        a.country.toLowerCase().includes(term)
    );
  };

  // Live airport/city search — resolves any real place (e.g. "Bangalore",
  // "Bombay"), not just the handful hardcoded in AIRPORTS.
  useEffect(() => {
    const term = originSearch.trim();
    if (term.length < 2) {
      setLiveOrigins(null);
      return;
    }
    setIsSearchingOrigin(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/flights/airports?query=${encodeURIComponent(term)}`);
        const data = await res.json();
        setLiveOrigins(data.airports || []);
      } catch {
        setLiveOrigins(null);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [originSearch]);

  useEffect(() => {
    const term = destSearch.trim();
    if (term.length < 2) {
      setLiveDests(null);
      return;
    }
    setIsSearchingDest(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/flights/airports?query=${encodeURIComponent(term)}`);
        const data = await res.json();
        setLiveDests(data.airports || []);
      } catch {
        setLiveDests(null);
      } finally {
        setIsSearchingDest(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [destSearch]);

  const filteredOrigins: AirportLite[] = liveOrigins ?? filterAirports(originSearch);
  const filteredDests: AirportLite[] = liveDests ?? filterAirports(destSearch);

  // Quick popular destinations
  const popularCities = ['Dubai', 'London', 'Riyadh', 'Mumbai', 'Delhi', 'Tokyo', 'Singapore', 'New York', 'Paris'];

  const swapLocations = () => {
    setIsSwapping(true);
    const temp = curOrigin;
    const tempResolved = originResolved;
    setCurOrigin(curDest);
    setOriginResolved(destResolved);
    setCurDest(temp);
    setDestResolved(tempResolved);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOriginOpen(false);
    setIsDestOpen(false);
    onSearch({
      origin: curOrigin,
      destination: curDest,
      departureDate: curDepDate,
      returnDate: tripType === 'round' ? curRetDate : '',
      cabinClass: curCabin,
      passengers: curPassengers,
      supersonicOnly: curSupersonic,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
      <form onSubmit={handleExecuteSearch} className="space-y-5">
        {/* Top Segmented Controls: Trip Type & Supersonic Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-sm">
            <button
              type="button"
              onClick={() => setTripType('round')}
              aria-pressed={tripType === 'round'}
              className={`focus-ring px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                tripType === 'round' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Round trip
            </button>
            <button
              type="button"
              onClick={() => setTripType('oneway')}
              aria-pressed={tripType === 'oneway'}
              className={`focus-ring px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                tripType === 'oneway' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              One way
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Supersonic Toggle Filter */}
            <button
              type="button"
              onClick={() => setCurSupersonic(!curSupersonic)}
              aria-pressed={curSupersonic}
              className={`focus-ring px-3 py-1.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors ${
                curSupersonic
                  ? 'bg-accent-50 border-accent-300 text-accent-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current text-accent-500" />
              Supersonic only
            </button>

            {/* Cabin Class Selection */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-sm">
              {(['economy', 'business', 'first'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurCabin(c)}
                  aria-pressed={curCabin === c}
                  className={`focus-ring px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    curCabin === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Flight Booking Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative">
          {/* FROM CARD */}
          <div ref={originRef} className="md:col-span-3 relative">
            <button
              type="button"
              onClick={() => {
                setIsOriginOpen((v) => !v);
                setIsDestOpen(false);
                setOriginSearch('');
              }}
              aria-haspopup="listbox"
              aria-expanded={isOriginOpen}
              className={`focus-ring w-full text-left p-4 rounded-2xl border transition-colors bg-slate-50 hover:bg-slate-100 ${
                isOriginOpen ? 'border-brand-400 bg-white ring-2 ring-brand-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <PlaneTakeoff className="w-3.5 h-3.5 text-brand-600" />
                  From
                </span>
                <span className="text-[11px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-semibold">
                  {originInfo.code}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-xl font-semibold text-slate-900 tracking-tight">
                  {originInfo.city}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {originInfo.code} · {originInfo.name}
                </div>
              </div>
            </button>

            {/* FROM Autocomplete Dropdown Popover */}
            {isOriginOpen && (
              <div
                role="listbox"
                aria-label="Departure airport"
                className="absolute top-full left-0 right-0 sm:w-96 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 space-y-3"
              >
                {/* Search Input Field */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="origin-search" className="sr-only">
                    Search departure city or airport
                  </label>
                  <input
                    id="origin-search"
                    type="text"
                    autoFocus
                    placeholder="City, airport, or code…"
                    value={originSearch}
                    onChange={(e) => setOriginSearch(e.target.value)}
                    className="focus-ring w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:border-brand-400 focus:bg-white"
                  />
                  {originSearch && (
                    <button
                      type="button"
                      onClick={() => setOriginSearch('')}
                      aria-label="Clear search"
                      className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Popular Cities Chips */}
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Popular</span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularCities.slice(0, 6).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setCurOrigin(city);
                          setOriginResolved(null);
                          setIsOriginOpen(false);
                        }}
                        className="focus-ring px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-xs text-slate-700 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Airports List */}
                {isSearchingOrigin && (
                  <p className="text-xs text-brand-600 animate-pulse">Searching live airport data…</p>
                )}
                <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100 pt-1">
                  {filteredOrigins.map((a) => (
                    <button
                      key={a.code}
                      type="button"
                      role="option"
                      aria-selected={curOrigin === a.code}
                      onClick={() => {
                        setCurOrigin(a.code);
                        setOriginResolved(a);
                        setIsOriginOpen(false);
                      }}
                      className="focus-ring w-full px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-700">
                          {a.code}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {a.city}, {a.country}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[190px]">{a.name}</div>
                        </div>
                      </div>
                      {curOrigin === a.code && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                    </button>
                  ))}

                  {/* Custom city input option if no direct match */}
                  {originSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurOrigin(originSearch.trim());
                        setOriginResolved(null);
                        setIsOriginOpen(false);
                      }}
                      className="focus-ring w-full px-3 py-2.5 rounded-xl text-left bg-brand-50 hover:bg-brand-100 transition-colors mt-2 flex items-center gap-2 text-sm text-brand-900 font-medium"
                    >
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                      Use &quot;{originSearch.trim()}&quot; as custom origin
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-1 flex items-center justify-center -my-1 md:my-0 relative z-10">
            <button
              type="button"
              onClick={swapLocations}
              aria-label="Swap departure and destination"
              className={`focus-ring w-10 h-10 rounded-full bg-white hover:bg-brand-50 text-slate-600 hover:text-brand-600 border border-slate-200 hover:border-brand-300 flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                isSwapping ? 'rotate-180 duration-300' : ''
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO CARD */}
          <div ref={destRef} className="md:col-span-3 relative">
            <button
              type="button"
              onClick={() => {
                setIsDestOpen((v) => !v);
                setIsOriginOpen(false);
                setDestSearch('');
              }}
              aria-haspopup="listbox"
              aria-expanded={isDestOpen}
              className={`focus-ring w-full text-left p-4 rounded-2xl border transition-colors bg-slate-50 hover:bg-slate-100 ${
                isDestOpen ? 'border-brand-400 bg-white ring-2 ring-brand-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <PlaneLanding className="w-3.5 h-3.5 text-brand-600" />
                  To
                </span>
                <span className="text-[11px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-semibold">
                  {destInfo.code}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-xl font-semibold text-slate-900 tracking-tight">
                  {destInfo.city}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {destInfo.code} · {destInfo.name}
                </div>
              </div>
            </button>

            {/* TO Autocomplete Dropdown Popover */}
            {isDestOpen && (
              <div
                role="listbox"
                aria-label="Arrival airport"
                className="absolute top-full left-0 right-0 sm:w-96 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 space-y-3"
              >
                {/* Search Input Field */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="dest-search" className="sr-only">
                    Search arrival city or airport
                  </label>
                  <input
                    id="dest-search"
                    type="text"
                    autoFocus
                    placeholder="City, airport, or code…"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    className="focus-ring w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:border-brand-400 focus:bg-white"
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

                {/* Popular Cities Chips */}
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Popular</span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setCurDest(city);
                          setDestResolved(null);
                          setIsDestOpen(false);
                        }}
                        className="focus-ring px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-xs text-slate-700 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Airports List */}
                {isSearchingDest && (
                  <p className="text-xs text-brand-600 animate-pulse">Searching live airport data…</p>
                )}
                <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100 pt-1">
                  {filteredDests.map((a) => (
                    <button
                      key={a.code}
                      type="button"
                      role="option"
                      aria-selected={curDest === a.code}
                      onClick={() => {
                        setCurDest(a.code);
                        setDestResolved(a);
                        setIsDestOpen(false);
                      }}
                      className="focus-ring w-full px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-700">
                          {a.code}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {a.city}, {a.country}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[190px]">{a.name}</div>
                        </div>
                      </div>
                      {curDest === a.code && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                    </button>
                  ))}

                  {/* Custom city input option if no direct match */}
                  {destSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurDest(destSearch.trim());
                        setDestResolved(null);
                        setIsDestOpen(false);
                      }}
                      className="focus-ring w-full px-3 py-2.5 rounded-xl text-left bg-brand-50 hover:bg-brand-100 transition-colors mt-2 flex items-center gap-2 text-sm text-brand-900 font-medium"
                    >
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                      Use &quot;{destSearch.trim()}&quot; as destination
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DATES CARD */}
          <div className="md:col-span-3 space-y-1">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  Departure {tripType === 'round' && '& return'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div>
                  <label htmlFor="departure-date" className="sr-only">
                    Departure date
                  </label>
                  <input
                    id="departure-date"
                    type="date"
                    value={curDepDate}
                    onChange={(e) => setCurDepDate(e.target.value)}
                    className="focus-ring w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 cursor-pointer"
                  />
                </div>
                {tripType === 'round' ? (
                  <div>
                    <label htmlFor="return-date" className="sr-only">
                      Return date
                    </label>
                    <input
                      id="return-date"
                      type="date"
                      value={curRetDate}
                      onChange={(e) => setCurRetDate(e.target.value)}
                      className="focus-ring w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-400 flex items-center justify-center font-medium">
                    One-way
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TRAVELLERS CARD */}
          <div ref={passengerRef} className="md:col-span-2 relative">
            <button
              type="button"
              onClick={() => setIsPassengerOpen((v) => !v)}
              aria-haspopup="dialog"
              aria-expanded={isPassengerOpen}
              className="focus-ring w-full text-left p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  Travelers
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
              </div>

              <div className="mt-1">
                <div className="text-lg font-semibold text-slate-900">
                  {curPassengers} {curPassengers === 1 ? 'guest' : 'guests'}
                </div>
                <div className="text-xs text-slate-500 capitalize truncate">{curCabin}</div>
              </div>
            </button>

            {/* Travellers Popover */}
            {isPassengerOpen && (
              <div className="absolute top-full right-0 w-64 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Travelers</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurPassengers(Math.max(1, curPassengers - 1))}
                      aria-label="Decrease travelers"
                      className="focus-ring w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="font-semibold text-sm w-4 text-center" aria-live="polite">
                      {curPassengers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurPassengers(Math.min(9, curPassengers + 1))}
                      aria-label="Increase travelers"
                      className="focus-ring w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPassengerOpen(false)}
                    className="focus-ring w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-end gap-4 border-t border-slate-100">
          <button
            type="submit"
            className="focus-ring py-3.5 px-8 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
          >
            <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
            Search flights
          </button>
        </div>
      </form>
    </div>
  );
};
