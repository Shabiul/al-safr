'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { LandingHome } from '@/components/LandingHome';
import { FlightSearch } from '@/components/FlightSearch';
import { HotelSearch } from '@/components/HotelSearch';
import { TourPackages } from '@/components/TourPackages';
import { CabSearch } from '@/components/CabSearch';
import { LiveFlightTracker } from '@/components/LiveFlightTracker';
import { PriceTracker } from '@/components/PriceTracker';
import { FlightCard } from '@/components/FlightCard';
import { SeatSelectorModal, BookingConfirmation } from '@/components/SeatSelectorModal';
import { BoardingPassModal } from '@/components/BoardingPassModal';
import {
  CurrencyCode,
  FlightOption,
  LIVE_FLIGHTS,
  formatPrice,
} from '@/services/flightData';
import {
  Plane,
  ArrowRight,
  Printer,
  Ticket,
  RefreshCw,
} from 'lucide-react';

export default function Home() {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'hotels' | 'tours' | 'cabs' | 'radar' | 'price' | 'bookings'>('home');
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
  const [airborneFlights, setAirborneFlights] = useState<any[]>([]);
  const [liveStreamConnected, setLiveStreamConnected] = useState<boolean>(false);
  const [dataSourceNotice, setDataSourceNotice] = useState<string>('');
  const [livePriceForecast, setLivePriceForecast] = useState<any[]>([]);

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
        setAirborneFlights(data.liveTelemetry?.airborneFlights || []);
        setLivePriceForecast(data.priceForecast || []);
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
    setActiveTab('book');
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

  // Quick route selector from radar (only ever called for the demo fleet,
  // which has a route — live ADS-B targets don't expose the "book" action)
  const handleBookFromRadar = (flightNumber: string) => {
    const live = LIVE_FLIGHTS.find((f) => f.flightNumber === flightNumber);
    if (live?.origin && live?.destination) {
      handleSearch({
        ...searchParams,
        origin: live.origin.code,
        destination: live.destination.code,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-200 selection:text-brand-900">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        apiStatus={apiStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Tab View 0: Landing page */}
        {activeTab === 'home' && <LandingHome currency={currency} onNavigate={setActiveTab} />}

        {activeTab !== 'home' && (
          <>
            {/* Live Data Status Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-3 text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  Live data stream
                </div>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="hidden sm:inline">
                  {airborneFlights.length || 20} aircraft tracked
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="hidden sm:inline">
                  Synced {lastLiveSync || 'just now'}
                </span>
              </div>

              <button
                onClick={() => fetchLiveFlightData(searchParams.origin, searchParams.destination, searchParams.departureDate, searchParams.supersonicOnly, searchParams.cabinClass)}
                disabled={isFetchingLive}
                className="focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin text-brand-600' : ''}`} />
                {isFetchingLive ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
          </>
        )}

        {/* Tab View 1: Flight Search & Results */}
        {activeTab === 'book' && (
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

        {/* Tab View 1b: Hotel Search & Results */}
        {activeTab === 'hotels' && <HotelSearch currency={currency} />}

        {/* Tab View 1c: Tour Packages */}
        {activeTab === 'tours' && <TourPackages currency={currency} />}

        {/* Tab View 1d: Cab / Car Rental Search */}
        {activeTab === 'cabs' && <CabSearch currency={currency} />}

        {/* Tab View 2: Live Flight Radar */}
        {activeTab === 'radar' && (
          <LiveFlightTracker
            currency={currency}
            onSelectFlightToBook={handleBookFromRadar}
            liveAirborneFlights={airborneFlights}
            onRefreshLive={() => fetchLiveFlightData(searchParams.origin, searchParams.destination, searchParams.departureDate, searchParams.supersonicOnly, searchParams.cabinClass)}
            isRefreshing={isFetchingLive}
          />
        )}

        {/* Tab View 3: Dynamic Price Forecast */}
        {activeTab === 'price' && (
          <PriceTracker
            currency={currency}
            livePriceForecast={livePriceForecast}
            currentOrigin={searchParams.origin}
            currentDest={searchParams.destination}
          />
        )}

        {/* Tab View 4: Boarding Passes */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">My Trips</h2>
                  <p className="text-sm text-slate-500">Your boarding passes and bookings.</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                {allBookings.length} {allBookings.length === 1 ? 'trip' : 'trips'}
              </span>
            </div>

            {allBookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
                <Plane className="w-10 h-10 text-slate-300 mx-auto -rotate-45" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900">No trips booked yet</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    Search a flight, choose your seat, and your boarding pass will show up here.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('book')}
                  className="focus-ring py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
                >
                  Search flights
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allBookings.map((b) => (
                  <div
                    key={b.bookingRef}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-300 transition-colors space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs text-slate-400">
                          Ref: <strong className="text-slate-900 font-mono">{b.bookingRef}</strong>
                        </span>
                        <div className="font-semibold text-sm text-slate-900">{b.passengerName}</div>
                      </div>
                      <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                        Seat {b.seatNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-semibold text-slate-900 font-mono">{b.flight.origin.code}</span>
                        <span className="text-xs text-slate-500 block">{b.flight.departureTime}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium flex flex-col items-center">
                        <span className="font-mono">{b.flight.flightNumber}</span>
                        <ArrowRight className="w-4 h-4 text-brand-600 my-0.5" />
                        <span>{b.flight.duration}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-semibold text-slate-900 font-mono">{b.flight.destination.code}</span>
                        <span className="text-xs text-slate-500 block">{b.flight.arrivalTime}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatPrice(b.totalPriceUsd, currency)}
                      </span>
                      <button
                        onClick={() => {
                          setActiveBooking(b);
                          setIsBoardingPassOpen(true);
                        }}
                        className="focus-ring py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-brand-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
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
                <li><button onClick={() => setActiveTab('book')} className="hover:text-white transition-colors">Flights</button></li>
                <li><button onClick={() => setActiveTab('hotels')} className="hover:text-white transition-colors">Hotels</button></li>
                <li><button onClick={() => setActiveTab('tours')} className="hover:text-white transition-colors">Tour Packages</button></li>
                <li><button onClick={() => setActiveTab('cabs')} className="hover:text-white transition-colors">Cabs</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Live tools</h3>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab('radar')} className="hover:text-white transition-colors">Live Flight Radar</button></li>
                <li><button onClick={() => setActiveTab('price')} className="hover:text-white transition-colors">Fare Trends</button></li>
                <li><button onClick={() => setActiveTab('bookings')} className="hover:text-white transition-colors">My Trips</button></li>
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

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <p>© 2026 Al-Safr Tours N Travels. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Live fares via Google Flights</span>
              <span className="text-slate-600">•</span>
              <span>Live ADS-B via OpenSky Network</span>
            </div>
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
