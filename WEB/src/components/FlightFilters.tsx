'use client';

import React, { useMemo, useState } from 'react';
import { FlightOption } from '@/services/flightData';
import { X } from 'lucide-react';

export interface FlightFilterState {
  stops: Set<0 | 1 | 2>; // 2 means "2+ stops"
  maxDurationMins: number | null; // null = no cap applied
  airlines: Set<string>;
  layoverAirports: Set<string>;
}

export const EMPTY_FLIGHT_FILTERS: FlightFilterState = {
  stops: new Set(),
  maxDurationMins: null,
  airlines: new Set(),
  layoverAirports: new Set(),
};

// "2h 50m" / "45m" -> minutes. Every duration on a FlightOption comes from
// the live API in this exact shape, so no locale/format guard is needed.
function parseDurationMins(duration: string): number {
  const h = /(\d+)h/.exec(duration);
  const m = /(\d+)m/.exec(duration);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

// stopDetails is a human-readable joined string like
// "Dubai (DXB), Terminal 3 · 2h 10m layover; Doha (DOH) · 1h layover" — pull
// the real IATA codes out of it rather than tracking them separately.
function extractLayoverCodes(stopDetails: string | undefined): string[] {
  if (!stopDetails) return [];
  return [...stopDetails.matchAll(/\(([A-Z]{3})\)/g)].map((m) => m[1]);
}

export function applyFlightFilters(flights: FlightOption[], filters: FlightFilterState): FlightOption[] {
  return flights.filter((f) => {
    if (filters.stops.size > 0) {
      const bucket = f.stops >= 2 ? 2 : (f.stops as 0 | 1);
      if (!filters.stops.has(bucket)) return false;
    }
    if (filters.maxDurationMins != null && parseDurationMins(f.duration) > filters.maxDurationMins) {
      return false;
    }
    if (filters.airlines.size > 0 && !filters.airlines.has(f.airline)) {
      return false;
    }
    if (filters.layoverAirports.size > 0) {
      const codes = extractLayoverCodes(f.stopDetails);
      if (!codes.some((c) => filters.layoverAirports.has(c))) return false;
    }
    return true;
  });
}

interface FlightFiltersProps {
  flights: FlightOption[];
  filters: FlightFilterState;
  onChange: (filters: FlightFilterState) => void;
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export const FlightFilters: React.FC<FlightFiltersProps> = ({ flights, filters, onChange }) => {
  const [airlineSearch, setAirlineSearch] = useState('');
  const [layoverSearch, setLayoverSearch] = useState('');

  // Counts reflect the full result set for this search, not the other
  // active filters — simpler than faceted counting and still tells the
  // user how many flights exist per option.
  const stopCounts = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0 } as Record<0 | 1 | 2, number>;
    for (const f of flights) counts[f.stops >= 2 ? 2 : (f.stops as 0 | 1)]++;
    return counts;
  }, [flights]);

  const durationBounds = useMemo(() => {
    if (flights.length === 0) return null;
    const mins = flights.map((f) => parseDurationMins(f.duration));
    return { min: Math.min(...mins), max: Math.max(...mins) };
  }, [flights]);

  const airlineCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of flights) counts.set(f.airline, (counts.get(f.airline) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [flights]);

  const layoverCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of flights) {
      for (const code of extractLayoverCodes(f.stopDetails)) {
        counts.set(code, (counts.get(code) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [flights]);

  const filteredAirlines = airlineCounts.filter(([name]) => name.toLowerCase().includes(airlineSearch.toLowerCase()));
  const filteredLayovers = layoverCounts.filter(([code]) => code.toLowerCase().includes(layoverSearch.toLowerCase()));

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const s of filters.stops) {
    activeChips.push({
      key: `stop-${s}`,
      label: s === 0 ? 'Non Stop' : s === 1 ? '1 Stop' : '2+ Stops',
      onRemove: () => onChange({ ...filters, stops: toggleInSet(filters.stops, s) }),
    });
  }
  if (filters.maxDurationMins != null && durationBounds && filters.maxDurationMins < durationBounds.max) {
    activeChips.push({
      key: 'duration',
      label: `Under ${Math.floor(filters.maxDurationMins / 60)}h ${filters.maxDurationMins % 60}m`,
      onRemove: () => onChange({ ...filters, maxDurationMins: null }),
    });
  }
  for (const a of filters.airlines) {
    activeChips.push({ key: `air-${a}`, label: a, onRemove: () => onChange({ ...filters, airlines: toggleInSet(filters.airlines, a) }) });
  }
  for (const l of filters.layoverAirports) {
    activeChips.push({ key: `lay-${l}`, label: l, onRemove: () => onChange({ ...filters, layoverAirports: toggleInSet(filters.layoverAirports, l) }) });
  }

  const hasAnyFilter = activeChips.length > 0;

  return (
    <div className="bg-cream rounded-2xl soft-border soft-shadow-sm p-5 space-y-5">
      {hasAnyFilter && (
        <div className="space-y-2 pb-4 border-b-2" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-900">Applied Filters</span>
            <button
              type="button"
              onClick={() => onChange(EMPTY_FLIGHT_FILTERS)}
              className="focus-ring text-xs font-bold"
              style={{ color: 'var(--color-ticket-orange)' }}
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="focus-ring flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-sm font-black text-slate-900 block">Stops</span>
        <div className="flex flex-wrap gap-2">
          {([0, 1, 2] as const).map((s) => {
            const count = stopCounts[s];
            if (count === 0) return null;
            const isSelected = filters.stops.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...filters, stops: toggleInSet(filters.stops, s) })}
                aria-pressed={isSelected}
                className={`focus-ring px-3 py-1.5 rounded-lg text-xs font-black soft-border transition-colors ${
                  isSelected ? 'text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                style={isSelected ? { backgroundColor: 'var(--color-ticket-orange)' } : undefined}
              >
                {s === 0 ? 'Non Stop' : s === 1 ? '1 Stop' : '2+ Stops'} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {durationBounds && durationBounds.max > durationBounds.min && (
        <div className="space-y-2 pt-4 border-t-2" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
          <span className="text-sm font-black text-slate-900 block">Duration</span>
          <input
            type="range"
            min={durationBounds.min}
            max={durationBounds.max}
            value={filters.maxDurationMins ?? durationBounds.max}
            onChange={(e) => onChange({ ...filters, maxDurationMins: Number(e.target.value) })}
            className="w-full accent-current"
            style={{ color: 'var(--color-ticket-orange)' }}
            aria-label="Maximum flight duration"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <span>{Math.floor(durationBounds.min / 60)}h {durationBounds.min % 60}m</span>
            <span>{Math.floor((filters.maxDurationMins ?? durationBounds.max) / 60)}h {(filters.maxDurationMins ?? durationBounds.max) % 60}m</span>
          </div>
        </div>
      )}

      {airlineCounts.length > 1 && (
        <div className="space-y-2 pt-4 border-t-2" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
          <span className="text-sm font-black text-slate-900 block">Airlines</span>
          {airlineCounts.length > 6 && (
            <input
              type="text"
              placeholder="Search"
              value={airlineSearch}
              onChange={(e) => setAirlineSearch(e.target.value)}
              className="focus-ring w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-medium soft-border"
            />
          )}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {filteredAirlines.map(([name, count]) => (
              <label key={name} className="flex items-center justify-between gap-2 cursor-pointer text-sm">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={filters.airlines.has(name)}
                    onChange={() => onChange({ ...filters, airlines: toggleInSet(filters.airlines, name) })}
                    className="focus-ring w-4 h-4 rounded soft-border"
                  />
                  {name}
                </span>
                <span className="text-xs text-slate-400 font-bold">{count}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {layoverCounts.length > 0 && (
        <div className="space-y-2 pt-4 border-t-2" style={{ borderColor: 'var(--color-dark-ink-muted)' }}>
          <span className="text-sm font-black text-slate-900 block">Layover Airports</span>
          {layoverCounts.length > 6 && (
            <input
              type="text"
              placeholder="Search"
              value={layoverSearch}
              onChange={(e) => setLayoverSearch(e.target.value)}
              className="focus-ring w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-medium soft-border"
            />
          )}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {filteredLayovers.map(([code, count]) => (
              <label key={code} className="flex items-center justify-between gap-2 cursor-pointer text-sm">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={filters.layoverAirports.has(code)}
                    onChange={() => onChange({ ...filters, layoverAirports: toggleInSet(filters.layoverAirports, code) })}
                    className="focus-ring w-4 h-4 rounded soft-border"
                  />
                  {code}
                </span>
                <span className="text-xs text-slate-400 font-bold">{count}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
