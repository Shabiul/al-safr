'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/services/flightData';

interface FareCalendarProps {
  origin: string;
  destination: string;
  currency: CurrencyCode;
  value: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Cheapest real economy fare per route/date, shared across every open of the
// calendar this session — avoids re-hitting the live fares API for a date
// the user already priced once.
const priceCache = new Map<string, number | null>();

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function fetchDayPrice(origin: string, destination: string, date: string): Promise<number | null> {
  const key = `${origin}|${destination}|${date}`;
  if (priceCache.has(key)) return priceCache.get(key)!;
  try {
    const res = await fetch(`/api/flights/live?origin=${origin}&destination=${destination}&date=${date}&cabinClass=economy&lite=1`, {
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    const prices: number[] = Array.isArray(data.flights)
      ? data.flights.map((f: { prices?: { economy?: number } }) => f.prices?.economy).filter((n: unknown): n is number => typeof n === 'number')
      : [];
    const cheapest = prices.length > 0 ? Math.min(...prices) : null;
    priceCache.set(key, cheapest);
    return cheapest;
  } catch {
    priceCache.set(key, null);
    return null;
  }
}

// ponytail: unbounded concurrency would hammer the RapidAPI quota when a
// 2-month grid opens (~60 dates) — a fixed worker pool keeps it to a handful
// of in-flight requests without pulling in a queue library for one loop.
async function fetchDatesWithLimit(
  dates: string[],
  origin: string,
  destination: string,
  onUpdate: (date: string, price: number | null) => void,
  isStale: () => boolean
) {
  let idx = 0;
  const CONCURRENCY = 8;
  async function worker() {
    while (idx < dates.length) {
      const date = dates[idx++];
      const price = await fetchDayPrice(origin, destination, date);
      if (isStale()) return;
      onUpdate(date, price);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

function buildMonthDays(monthStart: Date): (Date | null)[] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export const FareCalendar: React.FC<FareCalendarProps> = ({ origin, destination, currency, value, onSelect }) => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const currentMonthStart = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);

  const [viewMonthStart, setViewMonthStart] = useState(() => {
    const v = value ? new Date(`${value}T00:00:00`) : today;
    return new Date(v.getFullYear(), v.getMonth(), 1);
  });
  const [prices, setPrices] = useState<Record<string, number | null>>({});

  const secondMonthStart = useMemo(
    () => new Date(viewMonthStart.getFullYear(), viewMonthStart.getMonth() + 1, 1),
    [viewMonthStart]
  );

  useEffect(() => {
    let stale = false;
    const months = [viewMonthStart, secondMonthStart];
    const dates = months
      .flatMap((m) => buildMonthDays(m))
      .filter((d): d is Date => d !== null && d >= today)
      .map(toISODate);

    setPrices((prev) => {
      const next = { ...prev };
      for (const date of dates) {
        const key = `${origin}|${destination}|${date}`;
        if (priceCache.has(key)) next[date] = priceCache.get(key)!;
      }
      return next;
    });

    const missing = dates.filter((date) => !priceCache.has(`${origin}|${destination}|${date}`));
    if (missing.length > 0) {
      fetchDatesWithLimit(missing, origin, destination, (date, price) => {
        if (stale) return;
        setPrices((prev) => ({ ...prev, [date]: price }));
      }, () => stale);
    }

    return () => {
      stale = true;
    };
  }, [origin, destination, viewMonthStart, secondMonthStart, today]);

  const loadedValues = Object.values(prices).filter((p): p is number => typeof p === 'number');
  const avg = loadedValues.length > 0 ? loadedValues.reduce((a, b) => a + b, 0) / loadedValues.length : null;

  const renderMonth = (monthStart: Date) => {
    const cells = buildMonthDays(monthStart);
    return (
      <div key={monthStart.toISOString()} className="flex-1 min-w-[260px]">
        <div className="text-center font-black text-slate-900 mb-2">
          {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = toISODate(d);
            const isPast = d < today;
            const isSelected = iso === value;
            const price = prices[iso];
            const isLow = typeof price === 'number' && avg !== null && price <= avg * 0.93;
            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => onSelect(iso)}
                className={`focus-ring rounded-lg py-1.5 flex flex-col items-center justify-center transition-colors ${
                  isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100'
                }`}
                style={isSelected ? { backgroundColor: 'var(--color-ticket-orange)' } : undefined}
              >
                <span className={`text-sm font-black ${isSelected ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-900'}`}>
                  {d.getDate()}
                </span>
                {!isPast && (
                  <span
                    className="text-[10px] font-bold leading-tight"
                    style={{ color: isSelected ? 'white' : isLow ? '#16a34a' : '#64748b' }}
                  >
                    {typeof price === 'number' ? formatPrice(price, currency) : price === null ? '—' : '…'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonthStart((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          disabled={viewMonthStart <= currentMonthStart}
          aria-label="Previous months"
          className="focus-ring w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewMonthStart((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          aria-label="Next months"
          className="focus-ring w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        {renderMonth(viewMonthStart)}
        {renderMonth(secondMonthStart)}
      </div>
      <div className="mt-3 -mx-4 -mb-4 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium text-center rounded-b-2xl">
        Showing our lowest prices in {currency}
      </div>
    </div>
  );
};
