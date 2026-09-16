'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LIVE_FLIGHTS,
  LiveFlightTelemetry,
  CurrencyCode,
} from '@/services/flightData';
import {
  Radio,
  Plane,
  Compass,
  Gauge,
  Wind,
  Navigation,
  ZoomIn,
  ZoomOut,
  Search,
  Layers,
  RefreshCw,
  Shield,
} from 'lucide-react';

interface LiveFlightTrackerProps {
  currency: CurrencyCode;
  onSelectFlightToBook?: (flightNumber: string) => void;
  liveAirborneFlights?: any[];
  onRefreshLive?: () => void;
  isRefreshing?: boolean;
}

const BRAND = '#4f46e5';
const ACCENT = '#f97316';

export const LiveFlightTracker: React.FC<LiveFlightTrackerProps> = ({
  currency,
  onSelectFlightToBook,
  liveAirborneFlights = [],
  onRefreshLive,
  isRefreshing = false,
}) => {
  // Real ADS-B telemetry when we have it; the demo fleet only as a fallback
  // when there's none — never mixed together, and never mislabeled as real.
  const usingRealData = !!liveAirborneFlights && liveAirborneFlights.length > 0;

  const allActiveFlights: LiveFlightTelemetry[] = React.useMemo(() => {
    if (!usingRealData) return LIVE_FLIGHTS;

    // OpenSky's /states/all gives position/velocity only — no filed route,
    // no schedule, no fuel state, no aircraft type. We only show what's
    // actually broadcast; we don't invent a route or airframe for it.
    return liveAirborneFlights.slice(0, 15).map((s): LiveFlightTelemetry => ({
      flightNumber: s.callsign || `AF-${s.icao24.toUpperCase()}`,
      callsign: `${s.callsign || s.icao24.toUpperCase()} (ICAO24: ${s.icao24})`,
      aircraft: `Registry: ${s.country} · ICAO24 ${s.icao24}`,
      altitudeFt: s.altitudeFt || 0,
      flightLevel: s.flightLevel || `FL${Math.round((s.altitudeFt || 0) / 100)}`,
      speedKnots: s.speedKnots || 0,
      mach: s.mach || 0,
      headingDeg: s.headingDeg || 0,
      verticalSpeedFpm: s.verticalSpeedFpm || 0,
      status: s.verticalSpeedFpm > 250 ? 'CLIMBING' : s.verticalSpeedFpm < -250 ? 'DESCENDING' : 'CRUISING',
      lat: s.lat,
      lng: s.lng,
      squawk: s.squawk || '1000',
      telemetrySignalDb: -35,
    }));
  }, [usingRealData, liveAirborneFlights]);

  // Real lat/lng projected relative to the batch's centroid, so blip
  // position on the scope actually reflects true relative bearing/distance
  // instead of a decorative fixed layout.
  const radarProjection = React.useMemo(() => {
    if (!usingRealData || allActiveFlights.length === 0) return null;
    const centerLat = allActiveFlights.reduce((sum, f) => sum + f.lat, 0) / allActiveFlights.length;
    const centerLng = allActiveFlights.reduce((sum, f) => sum + f.lng, 0) / allActiveFlights.length;
    const maxSpreadDeg = Math.max(
      0.01,
      ...allActiveFlights.map((f) => Math.max(Math.abs(f.lat - centerLat), Math.abs(f.lng - centerLng)))
    );
    const positions = new Map<string, { dx: number; dy: number }>();
    allActiveFlights.forEach((f) => {
      positions.set(f.flightNumber, {
        dx: (f.lng - centerLng) / maxSpreadDeg,
        dy: -(f.lat - centerLat) / maxSpreadDeg, // screen y grows downward; lat grows northward
      });
    });
    return { positions, rangeNm: Math.round((maxSpreadDeg * 111) / 1.852) };
  }, [usingRealData, allActiveFlights]);
  const radarPositions = radarProjection?.positions ?? null;
  const radarRangeNm = radarProjection?.rangeNm ?? 300;

  const [selectedFlight, setSelectedFlight] = useState<LiveFlightTelemetry>(allActiveFlights[0] || LIVE_FLIGHTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [radarZoom, setRadarZoom] = useState<number>(1);
  const [showVectors, setShowVectors] = useState(true);

  // Update selected flight if active list changes
  useEffect(() => {
    if (allActiveFlights.length > 0 && !allActiveFlights.some(f => f.flightNumber === selectedFlight?.flightNumber)) {
      setSelectedFlight(allActiveFlights[0]);
    }
  }, [allActiveFlights, selectedFlight]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filtered flights
  const filteredFlights = allActiveFlights.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.flightNumber.toLowerCase().includes(q) ||
      f.callsign.toLowerCase().includes(q) ||
      f.origin?.city.toLowerCase().includes(q) ||
      f.destination?.city.toLowerCase().includes(q) ||
      f.origin?.code.toLowerCase().includes(q) ||
      f.destination?.code.toLowerCase().includes(q)
    );
  });

  const canvasSummary = `${allActiveFlights.length} ${usingRealData ? 'real airborne aircraft' : 'demo aircraft'} plotted. Selected: ${selectedFlight?.flightNumber ?? 'none'}. Use the list below the radar to select an aircraft.`;

  // Canvas radar renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let sweepAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * 0.88 * radarZoom;

      // Clear with clean light background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Fine grid dots
      ctx.fillStyle = '#e2e8f0';
      for (let x = 20; x < width; x += 30) {
        for (let y = 20; y < height; y += 30) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Radar Concentric Circles (Range Rings)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * fraction, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px system-ui';
        ctx.fillText(`${Math.round(fraction * radarRangeNm)} NM`, centerX + 6, centerY - radius * fraction + 12);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      // Degree Tick Marks
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg * Math.PI) / 180;
        const x1 = centerX + Math.cos(rad) * radius;
        const y1 = centerY + Math.sin(rad) * radius;
        const x2 = centerX + Math.cos(rad) * (radius - 8);
        const y2 = centerY + Math.sin(rad) * (radius - 8);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        const textX = centerX + Math.cos(rad) * (radius + 14);
        const textY = centerY + Math.sin(rad) * (radius + 14);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, textX, textY);
      }

      // Rotating Radar Sweep Beam
      sweepAngle = (sweepAngle + 0.02) % (Math.PI * 2);
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      sweepGradient.addColorStop(0, 'rgba(79, 70, 229, 0.22)');
      sweepGradient.addColorStop(1, 'rgba(79, 70, 229, 0.02)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sweepAngle - 0.35, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * radius, centerY + Math.sin(sweepAngle) * radius);
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Render Flights as Interactive Blips
      allActiveFlights.forEach((flight, idx) => {
        const realPos = radarPositions?.get(flight.flightNumber);
        let blipX: number;
        let blipY: number;
        if (realPos) {
          blipX = centerX + realPos.dx * radius * 0.85;
          blipY = centerY + realPos.dy * radius * 0.85;
        } else {
          const angle = ((flight.headingDeg - 90 + idx * 36) * Math.PI) / 180;
          const dist = (0.24 + ((idx % 6) * 0.12)) * radius;
          blipX = centerX + Math.cos(angle) * dist;
          blipY = centerY + Math.sin(angle) * dist;
        }

        const isSelected = selectedFlight?.flightNumber === flight.flightNumber;

        // Trajectory Trail — drawn behind the blip along its real heading
        if (showVectors) {
          const headingRad = ((flight.headingDeg - 90) * Math.PI) / 180;
          const trailLength = isSelected ? 24 : 18;
          ctx.beginPath();
          ctx.moveTo(blipX - Math.cos(headingRad) * trailLength, blipY - Math.sin(headingRad) * trailLength);
          ctx.lineTo(blipX, blipY);
          ctx.strokeStyle = isSelected ? 'rgba(79, 70, 229, 0.7)' : 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Radar Blip Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(blipX, blipY, 14, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(blipX, blipY, 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Blip Core
        ctx.beginPath();
        ctx.arc(blipX, blipY, isSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? BRAND : flight.mach > 1.2 ? ACCENT : '#64748b';
        ctx.fill();

        // Direction Vector
        const headingRad = ((flight.headingDeg - 90) * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(blipX, blipY);
        ctx.lineTo(blipX + Math.cos(headingRad) * 16, blipY + Math.sin(headingRad) * 16);
        ctx.strokeStyle = isSelected ? BRAND : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Data Tag
        ctx.fillStyle = isSelected ? '#0f172a' : '#475569';
        ctx.font = isSelected ? 'bold 11px system-ui' : '9px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(`${flight.flightNumber} [${flight.flightLevel}]`, blipX + 10, blipY - 4);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px system-ui';
        ctx.fillText(
          `${flight.mach > 1.0 ? 'Mach ' + flight.mach : flight.speedKnots + ' kts'}`,
          blipX + 10,
          blipY + 7
        );
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [radarZoom, showVectors, selectedFlight, allActiveFlights, radarPositions, radarRangeNm]);

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Radio className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Live flight radar</h2>
            {usingRealData ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Live ADS-B
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                Demo fleet — live data unavailable
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {usingRealData
              ? `Streaming ${allActiveFlights.length} real aircraft via OpenSky ADS-B. Position, altitude, speed, and heading are real; route/schedule aren't broadcast by ADS-B and aren't shown.`
              : "No live ADS-B data right now — showing Al-Safr's own demo fleet."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefreshLive && (
            <button
              type="button"
              onClick={onRefreshLive}
              disabled={isRefreshing}
              className="focus-ring px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
              Sync
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="radar-search" className="sr-only">
              Search callsign or city
            </label>
            <input
              id="radar-search"
              type="text"
              placeholder="Search callsign or city…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus-ring pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
            <button
              type="button"
              onClick={() => setRadarZoom((z) => Math.min(1.5, z + 0.15))}
              aria-label="Zoom in"
              title="Zoom in"
              className="focus-ring p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRadarZoom((z) => Math.max(0.7, z - 0.15))}
              aria-label="Zoom out"
              title="Zoom out"
              className="focus-ring p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowVectors((v) => !v)}
              aria-label="Toggle trajectory trails"
              aria-pressed={showVectors}
              title="Toggle trajectory trails"
              className={`focus-ring p-1.5 rounded transition-colors ${
                showVectors ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Radar Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Canvas Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-y-1">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Radar</span>
              <span>Range: {usingRealData ? `${radarRangeNm} NM` : 'N/A'}</span>
              <span>{allActiveFlights.length} {usingRealData ? 'real' : 'demo'} targets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${usingRealData ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
              <span className={`font-medium ${usingRealData ? 'text-emerald-700' : 'text-amber-700'}`}>
                {usingRealData ? 'ADS-B online' : 'ADS-B offline — demo data'}
              </span>
            </div>
          </div>

          <div className="relative flex-1 min-h-[420px] sm:min-h-[460px] bg-slate-50 flex items-center justify-center p-2">
            <canvas
              ref={canvasRef}
              width={740}
              height={460}
              role="img"
              aria-label={canvasSummary}
              className="w-full h-full max-h-[460px] object-contain rounded-lg"
            />

            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto pb-1">
              {filteredFlights.map((flight) => {
                const isSelected = selectedFlight?.flightNumber === flight.flightNumber;
                return (
                  <button
                    key={flight.flightNumber}
                    type="button"
                    onClick={() => setSelectedFlight(flight)}
                    aria-pressed={isSelected}
                    className={`focus-ring px-3 py-2 rounded-xl border text-left shrink-0 transition-all text-xs backdrop-blur-md ${
                      isSelected
                        ? 'bg-white/95 border-brand-400 shadow-md ring-1 ring-brand-300'
                        : 'bg-white/85 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 font-mono">{flight.flightNumber}</span>
                      <span
                        className={`text-[10px] px-1.5 rounded-full font-medium ${
                          flight.mach > 1.2 ? 'bg-accent-100 text-accent-700' : 'bg-brand-50 text-brand-700'
                        }`}
                      >
                        {flight.flightLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{flight.speedKnots} kts</span>
                      <span>·</span>
                      <span className="capitalize">{flight.status.toLowerCase()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Flight Telemetry HUD */}
        {selectedFlight && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-900 font-mono">{selectedFlight.flightNumber}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        selectedFlight.status === 'CRUISING'
                          ? 'bg-emerald-50 text-emerald-700'
                          : selectedFlight.status === 'CLIMBING'
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {selectedFlight.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedFlight.callsign}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Squawk</span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {selectedFlight.squawk}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shrink-0">
                  <Plane className="w-5 h-5 -rotate-45" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-400 block">Aircraft</span>
                  <p className="text-sm font-medium text-slate-900 truncate">{selectedFlight.aircraft}</p>
                </div>
              </div>

              {/* Route Trajectory Progress — only for the demo fleet; ADS-B
                  doesn't broadcast a filed route, so we never invent one for real aircraft. */}
              {selectedFlight.origin && selectedFlight.destination ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-slate-900">{selectedFlight.origin.code}</span>
                      <span className="text-slate-500 block text-xs">{selectedFlight.origin.city}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] text-slate-400 block">Progress</span>
                      <span className="text-sm font-semibold text-brand-600">{selectedFlight.progressPercent}%</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">{selectedFlight.destination.code}</span>
                      <span className="text-slate-500 block text-xs">{selectedFlight.destination.city}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedFlight.progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Dep {selectedFlight.departureTimeUtc}</span>
                    <span>ETA {selectedFlight.estimatedArrivalUtc}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Route/schedule not available — ADS-B broadcasts position only, not a filed flight plan.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-sm">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Gauge className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                    Altitude
                  </div>
                  <div className="text-slate-900 font-semibold text-sm mt-1 font-mono">
                    {selectedFlight.altitudeFt.toLocaleString()} ft
                  </div>
                  <span className="text-[11px] text-slate-500">{selectedFlight.flightLevel}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Wind className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    Speed
                  </div>
                  <div className="text-slate-900 font-semibold text-sm mt-1 font-mono">
                    {selectedFlight.speedKnots} kts
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Mach {selectedFlight.mach.toFixed(2)} · {Math.round(selectedFlight.speedKnots * 1.852)} km/h
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                    Heading
                  </div>
                  <div className="text-slate-900 font-semibold text-sm mt-1 font-mono">
                    {selectedFlight.headingDeg}°
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {selectedFlight.verticalSpeedFpm === 0
                      ? 'Level'
                      : `${selectedFlight.verticalSpeedFpm > 0 ? '+' : ''}${selectedFlight.verticalSpeedFpm} fpm`}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    Position
                  </div>
                  <div className="text-slate-900 font-semibold text-xs mt-1 truncate font-mono">
                    {selectedFlight.lat.toFixed(2)}°, {selectedFlight.lng.toFixed(2)}°
                  </div>
                  <span className={`text-[11px] font-medium ${usingRealData ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {usingRealData ? 'Live ADS-B lock' : 'Simulated (demo)'}
                  </span>
                </div>
              </div>

              {/* Quick Action — only for the demo fleet, which has a real
                  bookable route. A live ADS-B target has no known route to book. */}
              {selectedFlight.origin && selectedFlight.destination && (
                <button
                  type="button"
                  onClick={() => onSelectFlightToBook?.(selectedFlight.flightNumber)}
                  className="focus-ring w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-brand-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" aria-hidden="true" />
                  Search this route ({selectedFlight.origin.code} → {selectedFlight.destination.code})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
