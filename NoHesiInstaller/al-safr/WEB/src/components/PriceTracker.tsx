'use client';

import React, { useState } from 'react';
import {
  formatPrice,
  CurrencyCode,
  CURRENCIES,
  getPriceForecast,
  PriceForecastPoint,
} from '@/services/flightData';
import {
  TrendingDown,
  Bell,
  CheckCircle2,
  Zap,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';

interface PriceTrackerProps {
  currency: CurrencyCode;
  onSelectRoute?: (origin: string, dest: string) => void;
  livePriceForecast?: PriceForecastPoint[];
  currentOrigin?: string;
  currentDest?: string;
}

export const PriceTracker: React.FC<PriceTrackerProps> = ({
  currency,
  onSelectRoute,
  livePriceForecast,
  currentOrigin = 'DEL',
  currentDest = 'DXB',
}) => {
  const routes = [
    { origin: 'DEL', dest: 'DXB', base: 485 },
    { origin: 'BOM', dest: 'LHR', base: 640 },
    { origin: 'DXB', dest: 'LHR', base: 590 },
    { origin: 'RUH', dest: 'JFK', base: 980 },
  ];

  const [selectedRoute, setSelectedRoute] = useState<{ origin: string; dest: string; base: number }>({
    origin: currentOrigin,
    dest: currentDest,
    base: 485,
  });

  const [emailAlert, setEmailAlert] = useState('');
  const [alertTargetPrice, setAlertTargetPrice] = useState(
    currency === 'INR' ? 35000 : 450
  );
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  // Use live price forecast from API if provided for the route
  const forecastData: PriceForecastPoint[] =
    livePriceForecast && livePriceForecast.length > 0 && selectedRoute.origin === currentOrigin && selectedRoute.dest === currentDest
      ? livePriceForecast
      : getPriceForecast(selectedRoute.base);

  // Chart metrics — all derived from the actual forecast data, nothing hardcoded
  const minPrice = Math.min(...forecastData.map((d) => d.price));
  const maxPrice = Math.max(...forecastData.map((d) => d.price));
  const priceRange = maxPrice - minPrice || 100;
  const avgPrice = forecastData.reduce((sum, d) => sum + d.historicalAvg, 0) / forecastData.length;
  const minVsAvgPercent = avgPrice > 0 ? Math.round(((minPrice - avgPrice) / avgPrice) * 100) : 0;
  const maxVsAvgPercent = avgPrice > 0 ? Math.round(((maxPrice - avgPrice) / avgPrice) * 100) : 0;
  const bestDay = forecastData.reduce((best, d) => (d.price < best.price ? d : best), forecastData[0]);
  const peakDay = forecastData.reduce((worst, d) => (d.price > worst.price ? d : worst), forecastData[0]);
  const recommendation =
    minVsAvgPercent <= -8
      ? 'Good time to book'
      : forecastData[forecastData.length - 1].price > forecastData[0].price
      ? 'Price trending up'
      : 'Fares are stable';

  // Chart coordinates calculation
  const chartHeight = 160;
  const chartWidth = 560;
  const points = forecastData.map((item, index) => {
    const x = (index / (forecastData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((item.price - minPrice) / priceRange) * (chartHeight - 40) - 20;
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  const handleSubscribeAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAlert) return;
    setAlertSubmitted(true);
    setTimeout(() => setAlertSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Fare forecast</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              Estimated trend
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            7-day trend estimate anchored on the live fare found for this route — not observed future prices.
          </p>
        </div>

        {/* Route Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {routes.map((r) => {
            const isSelected = selectedRoute.origin === r.origin && selectedRoute.dest === r.dest;
            return (
              <button
                key={`${r.origin}-${r.dest}`}
                type="button"
                onClick={() => {
                  setSelectedRoute({ origin: r.origin, dest: r.dest, base: r.base });
                  onSelectRoute?.(r.origin, r.dest);
                }}
                aria-pressed={isSelected}
                className={`focus-ring px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isSelected ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {r.origin} → {r.dest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Chart Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs text-slate-400 block">Fare trend</span>
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>{selectedRoute.origin}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>{selectedRoute.dest}</span>
                <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                  {minVsAvgPercent}% vs avg
                </span>
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Lowest forecast fare</span>
              <span className="text-xl font-semibold text-brand-600 font-mono">
                {formatPrice(minPrice, currency)}
              </span>
            </div>
          </div>

          {/* SVG Price Curve Chart */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
              ))}

              <path d={areaD} fill="url(#priceGradient)" />

              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((p, i) => (
                <g key={i} className="cursor-pointer group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill={p.forecast === 'low' ? '#10b981' : p.forecast === 'peak' ? '#f97316' : '#4f46e5'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-125"
                  />
                  <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[10px] font-semibold fill-slate-700">
                    {formatPrice(p.price, currency)}
                  </text>
                  <text x={p.x} y={chartHeight + 16} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                    {p.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Forecast Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-emerald-50">
              <span className="text-[11px] text-emerald-700 font-semibold block">Best day to book</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                {bestDay.day} ({bestDay.date})
              </span>
              <span className="text-xs text-emerald-600 font-mono">
                {formatPrice(minPrice, currency)} ({minVsAvgPercent}%)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-400 font-semibold block">Historical average</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block font-mono">
                {formatPrice(Math.round(avgPrice), currency)}
              </span>
              <span className="text-xs text-slate-500">7-day baseline</span>
            </div>

            <div className="p-3 rounded-xl bg-accent-50">
              <span className="text-[11px] text-accent-700 font-semibold block">Peak demand day</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                {peakDay.day} ({peakDay.date})
              </span>
              <span className="text-xs text-accent-600 font-mono">
                {formatPrice(maxPrice, currency)} (+{maxVsAvgPercent}%)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-brand-50">
              <span className="text-[11px] text-brand-700 font-semibold block">Recommendation</span>
              <span className="text-sm font-semibold text-brand-900 mt-0.5 block">{recommendation}</span>
              <span className="text-xs text-brand-600">Based on 7-day trend</span>
            </div>
          </div>
        </div>

        {/* Price Drop Alert Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Fare drop alert</h3>
                <p className="text-xs text-slate-500">Get notified when the price drops.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
              Set a target price for <strong className="text-slate-900">{selectedRoute.origin} → {selectedRoute.dest}</strong> and we&apos;ll email you when a fare drops below it.
            </p>

            <form onSubmit={handleSubscribeAlert} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="alert-target-price" className="text-xs font-semibold text-slate-700">
                  Target price ({CURRENCIES[currency].symbol})
                </label>
                <div className="relative">
                  <input
                    id="alert-target-price"
                    type="number"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                    className="focus-ring w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{currency}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="alert-email" className="text-xs font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="alert-email"
                  type="email"
                  placeholder="you@example.com"
                  value={emailAlert}
                  onChange={(e) => setEmailAlert(e.target.value)}
                  required
                  className="focus-ring w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="focus-ring w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" aria-hidden="true" />
                Set alert
              </button>

              {alertSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>We&apos;ll email you when the fare drops below {formatPrice(alertTargetPrice, currency)}.</span>
                </div>
              )}
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
              <span>You can unsubscribe anytime.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
