'use client';

import React from 'react';
import {
  FlightOption,
  formatPrice,
  CurrencyCode,
} from '@/services/flightData';
import {
  Plane,
  Clock,
  Zap,
  TrendingDown,
  ShieldCheck,
  Armchair,
} from 'lucide-react';

interface FlightCardProps {
  flight: FlightOption;
  currency: CurrencyCode;
  selectedCabin: 'economy' | 'business' | 'first';
  onSelectFlight: (flight: FlightOption, cabin: 'economy' | 'business' | 'first') => void;
}

const CABIN_LABEL: Record<'economy' | 'business' | 'first', string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First',
};

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  currency,
  selectedCabin,
  onSelectFlight,
}) => {
  const isSupersonic = flight.aircraft.includes('Supersonic') || flight.aircraft.includes('Overture');
  const [logoFailed, setLogoFailed] = React.useState(false);

  return (
    <div className="bg-cream rounded-2xl soft-border soft-shadow-sm p-5 sm:p-6 space-y-5">
      {/* Top Aircraft & Trend Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 pb-3" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-cream text-slate-800 flex items-center justify-center soft-border overflow-hidden">
            {flight.airlineCode && !logoFailed ? (
              <img
                src={`https://images.kiwi.com/airlines/64/${flight.airlineCode}.png`}
                alt={flight.airline}
                className="w-full h-full object-contain p-1"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <Plane className="w-4 h-4 -rotate-45 text-slate-600" aria-hidden="true" />
            )}
          </div>
          <div>
            <span className="font-black text-slate-900 text-sm block">{flight.airline}</span>
            <div className="text-xs text-slate-500 font-mono">
              {flight.flightNumber} · {flight.aircraft}
            </div>
            {isSupersonic && (
              <span
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-black px-2 py-0.5 rounded-full soft-border"
                style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}
              >
                <Zap className="w-3 h-3 fill-current" aria-hidden="true" />
                Supersonic — 40% faster
              </span>
            )}
          </div>
        </div>

        {/* Price Trend Tag */}
        {flight.priceTrend.isLowest7Days ? (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 soft-border"
            style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-dark-ink-muted)' }}
          >
            <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            {flight.priceTrend.changePercent}% · 7-DAY LOW
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-semibold soft-border">
            {flight.priceTrend.forecastNext48h}
          </span>
        )}
      </div>

      {/* Center Flight Time & Route Segment */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-7 flex items-center justify-between gap-4">
          {/* Departure */}
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">{flight.departureTime}</div>
            <div className="text-sm font-bold text-slate-700">{flight.origin.code}</div>
            <div className="text-xs text-slate-500">{flight.origin.city}</div>
          </div>

          {/* Flight Path Graphic */}
          <div className="flex-1 px-4 flex flex-col items-center">
            <div className="text-xs text-slate-500 flex items-center gap-1 font-medium mb-1">
              <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {flight.duration}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full soft-border bg-cream" aria-hidden="true"></div>
              <div className="flex-1 border-t-2 border-dashed border-slate-300 relative">
                <Plane className="w-3.5 h-3.5 absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" style={{ color: 'var(--color-ticket-orange)' }} aria-hidden="true" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full soft-border bg-cream" aria-hidden="true"></div>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 font-mono">{flight.arrivalTime}</div>
            <div className="text-sm font-bold text-slate-700">{flight.destination.code}</div>
            <div className="text-xs text-slate-500">{flight.destination.city}</div>
          </div>
        </div>

        {/* Pricing Tiers & Selection */}
        <div className="md:col-span-5 grid grid-cols-3 gap-2">
          {(['economy', 'business', 'first'] as const).map((cabin) => {
            const isSelected = selectedCabin === cabin;
            const soldOut = cabin === 'first' && flight.seatsRemaining.first <= 0;
            return (
              <button
                key={cabin}
                type="button"
                onClick={() => onSelectFlight(flight, cabin)}
                aria-pressed={isSelected}
                aria-label={`${CABIN_LABEL[cabin]}, ${formatPrice(flight.prices[cabin], currency)}`}
                className={`focus-ring p-2.5 rounded-xl text-left transition-all flex flex-col justify-between soft-border ${
                  isSelected ? 'soft-shadow-sm -translate-y-0.5' : 'bg-slate-50 hover:bg-cream'
                }`}
                style={isSelected ? { backgroundColor: 'var(--color-ticket-orange)' } : undefined}
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">{CABIN_LABEL[cabin]}</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5 font-mono">
                    {formatPrice(flight.prices[cabin], currency)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 block">
                  {cabin === 'first'
                    ? soldOut
                      ? 'Sold out'
                      : `${flight.seatsRemaining.first} left`
                    : `${flight.seatsRemaining[cabin]} seats left`}
                </span>
              </button>
            );
          })}
        </div>

        {flight.stops > 0 && flight.stopDetails && (
          <div className="md:col-span-12 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 soft-border">
            <span className="font-bold text-slate-700">Layover:</span> {flight.stopDetails}
          </div>
        )}
      </div>

      {/* Bottom Amenities & Action */}
      <div className="pt-3 border-t-2 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold">
          {flight.amenities.map((amenity, i) => (
            <span key={i} className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full soft-border">
              <ShieldCheck className="w-3 h-3" style={{ color: 'var(--color-ticket-orange)' }} aria-hidden="true" />
              {amenity}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectFlight(flight, selectedCabin)}
          className="focus-ring soft-press py-2.5 px-5 rounded-xl text-white font-black text-sm flex items-center gap-2 ml-auto soft-border soft-shadow-sm"
          style={{ backgroundColor: 'var(--color-ticket-orange)' }}
        >
          <Armchair className="w-4 h-4" aria-hidden="true" />
          Select seats
        </button>
      </div>
    </div>
  );
};
