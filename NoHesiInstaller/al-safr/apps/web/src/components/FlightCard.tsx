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
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all p-5 sm:p-6 shadow-sm space-y-5">
      {/* Top Aircraft & Trend Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-white text-slate-800 flex items-center justify-center border border-slate-200 overflow-hidden">
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
            <span className="font-semibold text-slate-900 text-sm block">{flight.airline}</span>
            <div className="text-xs text-slate-500 font-mono">
              {flight.flightNumber} · {flight.aircraft}
            </div>
            {isSupersonic && (
              <span className="text-xs font-semibold text-accent-600 flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 fill-current" aria-hidden="true" />
                Supersonic corridor — 40% faster
              </span>
            )}
          </div>
        </div>

        {/* Price Trend Tag */}
        {flight.priceTrend.isLowest7Days ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            {flight.priceTrend.changePercent}% · 7-day low
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs">
            {flight.priceTrend.forecastNext48h}
          </span>
        )}
      </div>

      {/* Center Flight Time & Route Segment */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-7 flex items-center justify-between gap-4">
          {/* Departure */}
          <div>
            <div className="text-2xl font-semibold text-slate-900 font-mono">{flight.departureTime}</div>
            <div className="text-sm font-medium text-slate-700">{flight.origin.code}</div>
            <div className="text-xs text-slate-500">{flight.origin.city}</div>
          </div>

          {/* Flight Path Graphic */}
          <div className="flex-1 px-4 flex flex-col items-center">
            <div className="text-xs text-slate-500 flex items-center gap-1 font-medium mb-1">
              <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {flight.duration}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border-2 border-brand-500 bg-white" aria-hidden="true"></div>
              <div className="flex-1 border-t-2 border-dashed border-slate-200 relative">
                <Plane className="w-3.5 h-3.5 text-brand-500 absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" aria-hidden="true" />
              </div>
              <div className="w-2 h-2 rounded-full border-2 border-emerald-500 bg-white" aria-hidden="true"></div>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-2xl font-semibold text-slate-900 font-mono">{flight.arrivalTime}</div>
            <div className="text-sm font-medium text-slate-700">{flight.destination.code}</div>
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
                className={`focus-ring p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  isSelected ? 'bg-brand-50 border-brand-400 ring-1 ring-brand-300' : 'bg-slate-50 hover:bg-white border-slate-200'
                }`}
              >
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">{CABIN_LABEL[cabin]}</span>
                  <span className="text-sm font-semibold text-slate-900 block mt-0.5 font-mono">
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
          <div className="md:col-span-12 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            <span className="font-medium text-slate-600">Layover:</span> {flight.stopDetails}
          </div>
        )}
      </div>

      {/* Bottom Amenities & Action */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {flight.amenities.map((amenity, i) => (
            <span key={i} className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-brand-500" aria-hidden="true" />
              {amenity}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectFlight(flight, selectedCabin)}
          className="focus-ring py-2 px-5 rounded-xl bg-slate-900 hover:bg-brand-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 ml-auto"
        >
          <Armchair className="w-4 h-4" aria-hidden="true" />
          Select seats
        </button>
      </div>
    </div>
  );
};
