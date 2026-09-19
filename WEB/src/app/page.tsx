'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { LandingHome } from '@/components/LandingHome';
import { FlightSearch } from '@/components/FlightSearch';
import { HotelSearch } from '@/components/HotelSearch';
import { TourPackages } from '@/components/TourPackages';
import { CabSearch } from '@/components/CabSearch';
import { FlightCard } from '@/components/FlightCard';
import { SeatSelectorModal, BookingConfirmation } from '@/components/SeatSelectorModal';
import { BoardingPassModal } from '@/components/BoardingPassModal';
import {
  CurrencyCode,
  FlightOption,
  formatPrice,
} from '@/services/flightData';
import {
  Plane,
  ArrowRight,
  Printer,
  Ticket,
  RefreshCw,
  Search,
  Building2,
  Compass,
  Car,
} from 'lucide-react';

type MainTab = 'home' | 'services' | 'bookings';
type ServiceId = 'book' | 'hotels' | 'tours' | 'cabs';

const SERVICE_TABS: { id: ServiceId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'book', label: 'Flights', icon: Search, color: 'var(--color-ticket-orange)' },
  { id: 'hotels', label: 'Hotels', icon: Building2, color: 'var(--color-ticket-orange)' },
  { id: 'tours', label: 'Tour Packages', icon: Compass, color: 'var(--color-ticket-orange)' },
  { id: 'cabs', label: 'Cabs', icon: Car, color: 'var(--color-ticket-orange)' },
];

export default function Home() {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [activeService, setActiveService] = useState<ServiceId>('book');
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Search parameters
  const [searchParams, setSearchParams] = useState({
    origin: 'DEL',
    destination: 'DXB',
    departureDate: '2026-09-18',
    returnDate: '2026-09-25',
    cabinClass: 'business' as 'economy' | 'business' | 'first',
    passengers: 1,
    supersonicOnly: false,
  });

  // Flight search results
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [selectedCabin, setSelectedCabin] = useState<'economy' | 'business' | 'first'>('business');

  // Live Telemetry Stream State
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [lastLiveSync, setLastLiveSync] = useState<string>('');
  const [liveStreamConnected, setLiveStreamConnected] = useState<boolean>(false);
  const [dataSourceNotice, setDataSourceNotice] = useState<string>('');

  // Booking & Seat Modals
  const [selectedFlightForSeat, setSelectedFlightForSeat] = useState<FlightOption | null>(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<BookingConfirmation | null>(null);
  const [isBoardingPassOpen, setIsBoardingPassOpen] = useState(false);
  const [allBookings, setAllBookings] = useState<BookingConfirmation[]>([]);

  // LIVE DATA FETCHER FUNCTION
  const fetchLiveFlightData = useCallback(async (origin: string, dest: string, date: string, supersonic: boolean = false, cabinClass: string = 'economy') => {
    setIsFetchingLive(true);
    setApiStatus('loading');

    try {
      const res = await fetch(`/api/flights/live?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&date=${encodeURIComponent(date)}&cabinClass=${encodeURIComponent(cabinClass)}`, {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Failed to fetch live telemetry');

      const data = await res.json();
      if (data.success) {
        let liveOptions: FlightOption[] = data.flights || [];
        if (supersonic) {
          liveOptions = liveOptions.filter((f) => f.aircraft.includes('Supersonic') || f.aircraft.includes('Overture'));
        }

        setFlights(liveOptions);
        setLastLiveSync(new Date(data.timestamp).toLocaleTimeString());
        setLiveStreamConnected(true);
        setDataSourceNotice(data.dataSourceNotice || '');
        setApiStatus('success');
      }
    } catch {
      setApiStatus('error');
    } finally {
      setIsFetchingLive(false);
    }
  }, []);

  // Fetch live on initial load
  useEffect(() => {
    fetchLiveFlightData(searchParams.origin, searchParams.destination, searchParams.departureDate, searchParams.supersonicOnly, searchParams.cabinClass);
  }, [fetchLiveFlightData, searchParams.origin, searchParams.destination, searchParams.departureDate, searchParams.supersonicOnly, searchParams.cabinClass]);

  // Execute Search handler
  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    setSelectedCabin(params.cabinClass);
    fetchLiveFlightData(params.origin, params.destination, params.departureDate, params.supersonicOnly, params.cabinClass);
    setActiveService('book');
    setActiveTab('services');
  };

  // LandingHome's cards link to a specific service (book/hotels/tours/cabs)
  // or a top-level tab (bookings) — the services all live under one
  // consolidated "Services" tab with its own sub-navigation.
  const handleNavigate = (target: ServiceId | 'bookings') => {
    if (target === 'book' || target === 'hotels' || target === 'tours' || target === 'cabs') {
      setActiveService(target);
      setActiveTab('services');
    } else {
      setActiveTab(target);
    }
  };

  // Open Seat Selector
  const handleOpenSeatSelector = (flight: FlightOption, cabin: 'economy' | 'business' | 'first') => {
    setSelectedFlightForSeat(flight);
    setSelectedCabin(cabin);
    setIsSeatModalOpen(true);
  };

  // On successful booking
  const handleConfirmBooking = (confirmation: BookingConfirmation) => {
    setIsSeatModalOpen(false);
    setActiveBooking(confirmation);
    setAllBookings((prev) => [confirmation, ...prev]);
    setIsBoardingPassOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream text-slate-900 flex flex-col selection:bg-brand-200 selection:text-brand-900">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        apiStatus={apiStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Header is a fixed overlay (transparent over the hero on the home
          tab), so it no longer reserves space in normal flow — every other
          tab needs top padding matching its solid height instead. */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 space-y-6 sm:space-y-8 ${activeTab === 'home' ? '' : 'pt-20 sm:pt-28'}`}>
        {/* Tab View 0: Landing page */}
        {activeTab === 'home' && <LandingHome currency={currency} onNavigate={handleNavigate} />}

        {activeTab !== 'home' && (
          <>
            {/* Live Data Status Bar */}
            <div className="bg-cream rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-sm border-b-[3px]" style={{ borderColor: 'var(--color-ink)' }}>
              <div className="flex flex-wrap items-center gap-3 text-slate-600">
                <div
                  className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wide px-3 py-1.5 rounded-full max-border"
                  style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-ink)' }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-ink)' }} aria-hidden="true" />
                  Live data stream
                </div>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="hidden sm:inline font-medium">
                  Synced {lastLiveSync || 'just now'}
                </span>
              </div>

              <button
                onClick={() => fetchLiveFlightData(searchParams.origin, searchParams.destination, searchParams.departureDate, searchParams.supersonicOnly, searchParams.cabinClass)}
                disabled={isFetchingLive}
                className="focus-ring max-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream text-slate-900 max-border text-sm font-black transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
                {isFetchingLive ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
          </>
        )}

        {/* Tab View 1: Services hub — Flights, Hotels, Tour Packages, Cabs
            share one tab with its own sub-navigation, instead of four
            separate top-level tabs. */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2.5 w-fit">
              {SERVICE_TABS.map((service) => {
                const Icon = service.icon;
                const isActive = activeService === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setActiveService(service.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`focus-ring max-press flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-black max-border transition-colors ${
                      isActive ? 'max-shadow-sm' : 'bg-cream text-slate-600 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: service.color, color: 'var(--color-ink)' } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {service.label}
                  </button>
                );
              })}
            </div>

            {activeService === 'book' && (
              <div className="space-y-6">
                <FlightSearch
                  currency={currency}
                  origin={searchParams.origin}
                  destination={searchParams.destination}
                  departureDate={searchParams.departureDate}
                  returnDate={searchParams.returnDate}
                  cabinClass={selectedCabin}
                  passengers={searchParams.passengers}
                  supersonicOnly={searchParams.supersonicOnly}
                  onSearch={handleSearch}
                />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {searchParams.origin} → {searchParams.destination}
                        </span>
                      </h2>
                      {dataSourceNotice && (
                        <p className="text-xs text-slate-400 mt-0.5">{dataSourceNotice}</p>
                      )}
                    </div>
                  </div>

                  {isFetchingLive ? (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <RefreshCw className="w-7 h-7 text-brand-600 animate-spin mx-auto" />
                      <div className="font-medium text-sm text-slate-700">Searching live fares…</div>
                      <p className="text-sm text-slate-500">
                        {searchParams.origin} → {searchParams.destination}
                      </p>
                    </div>
                  ) : flights.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                      <div className="font-medium text-sm text-slate-700">
                        No live flights found for {searchParams.origin} → {searchParams.destination}
                      </div>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">
                        {dataSourceNotice || 'Try a different date, cabin class, or route.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {flights.map((flight) => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          currency={currency}
                          selectedCabin={selectedCabin}
                          onSelectFlight={handleOpenSeatSelector}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeService === 'hotels' && <HotelSearch currency={currency} />}
            {activeService === 'tours' && <TourPackages currency={currency} />}
            {activeService === 'cabs' && <CabSearch currency={currency} />}
          </div>
        )}

        {/* Tab View 2: Boarding Passes */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-cream p-5 rounded-2xl max-border max-shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl max-border flex items-center justify-center" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                  <Ticket className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">My Trips</h2>
                  <p className="text-sm text-slate-500 font-medium">Your boarding passes and bookings.</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-sm font-black max-border" style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-ink)' }}>
                {allBookings.length} {allBookings.length === 1 ? 'trip' : 'trips'}
              </span>
            </div>

            {allBookings.length === 0 ? (
              <div className="p-12 text-center bg-cream rounded-2xl max-border space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl max-border flex items-center justify-center mx-auto -rotate-3"
                  style={{ backgroundColor: 'var(--color-ticket-orange)' }}
                >
                  <Plane className="w-8 h-8 -rotate-45" style={{ color: 'var(--color-ink)' }} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">No trips booked yet</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                    Search a flight, choose your seat, and your boarding pass will show up here.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('book')}
                  className="focus-ring max-press py-2.5 px-6 rounded-xl text-sm font-black max-border max-shadow-sm"
                  style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-ink)' }}
                >
                  Search flights
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allBookings.map((b) => (
                  <div
                    key={b.bookingRef}
                    className="p-5 bg-cream rounded-2xl max-border max-shadow-sm transition-colors space-y-4"
                  >
                    <div className="flex items-center justify-between border-b-[3px] pb-3" style={{ borderColor: 'var(--color-ink)' }}>
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          Ref: <strong className="text-slate-900 font-mono">{b.bookingRef}</strong>
                        </span>
                        <div className="font-black text-sm text-slate-900">{b.passengerName}</div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full max-border" style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-ink)' }}>
                        Seat {b.seatNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-slate-900 font-mono">{b.flight.origin.code}</span>
                        <span className="text-xs text-slate-500 block font-medium">{b.flight.departureTime}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-bold flex flex-col items-center">
                        <span className="font-mono">{b.flight.flightNumber}</span>
                        <ArrowRight className="w-4 h-4 my-0.5" style={{ color: 'var(--color-ticket-orange)' }} />
                        <span>{b.flight.duration}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900 font-mono">{b.flight.destination.code}</span>
                        <span className="text-xs text-slate-500 block font-medium">{b.flight.arrivalTime}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t-[3px] flex items-center justify-between" style={{ borderColor: 'var(--color-ink)' }}>
                      <span className="text-sm font-black text-slate-700">
                        {formatPrice(b.totalPriceUsd, currency)}
                      </span>
                      <button
                        onClick={() => {
                          setActiveBooking(b);
                          setIsBoardingPassOpen(true);
                        }}
                        className="focus-ring max-press py-1.5 px-3 rounded-lg text-white text-xs font-black transition-colors flex items-center gap-1.5 max-border"
                        style={{ backgroundColor: 'var(--color-navy-900)' }}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        View pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-14 text-sm text-slate-300" style={{ backgroundColor: '#04182c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-semibold text-white">Al-Safr (السفر)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                One stop travel platform for flights, hotels, tour packages and cabs — all backed by real, live pricing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Explore</h3>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => handleNavigate('book')} className="hover:text-white transition-colors">Flights</button></li>
                <li><button onClick={() => handleNavigate('hotels')} className="hover:text-white transition-colors">Hotels</button></li>
                <li><button onClick={() => handleNavigate('tours')} className="hover:text-white transition-colors">Tour Packages</button></li>
                <li><button onClick={() => handleNavigate('cabs')} className="hover:text-white transition-colors">Cabs</button></li>
                <li><button onClick={() => setActiveTab('bookings')} className="hover:text-white transition-colors">My Trips</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/get-a-quote" className="hover:text-white transition-colors">Get a Quote</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Reach us</h3>
              <ul className="space-y-2 text-slate-400">
                <li>A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001</li>
                <li>
                  <a href="tel:+919900517604" className="hover:text-white transition-colors">+91 99005 17604</a>
                </li>
                <li>
                  <a href="mailto:luckysaj@gmail.com" className="hover:text-white transition-colors">luckysaj@gmail.com</a>
                </li>
                <li className="text-slate-500 text-xs pt-1">Registered office: No-06, Classic Complex, Opp Mahindra Apts, Near Wipro, Shikaripalya, Hulimangala Post, Bengaluru — 560105</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p>© 2026 Al-Safr Tours N Travels. All rights reserved.</p>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
            <span>Live fares via Google Flights</span>
          </div>

          <div className="border-t border-white/10 mt-6 pt-6 text-center text-xs text-slate-500">
            Designed and developed with{' '}
            <span aria-hidden="true">❤</span> by{' '}
            <a
              href="https://naazailabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-white transition-colors"
            >
              Naaz AI Labs
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SeatSelectorModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        flight={selectedFlightForSeat}
        initialCabin={selectedCabin}
        currency={currency}
        onConfirmBooking={handleConfirmBooking}
      />

      <BoardingPassModal
        isOpen={isBoardingPassOpen}
        onClose={() => setIsBoardingPassOpen(false)}
        booking={activeBooking}
        currency={currency}
      />
    </div>
  );
}
