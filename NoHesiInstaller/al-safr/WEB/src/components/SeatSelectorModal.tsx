'use client';

import React, { useState } from 'react';
import {
  FlightOption,
  formatPrice,
  CurrencyCode,
} from '@/services/flightData';
import {
  X,
  Armchair,
  Check,
  User,
  CreditCard,
} from 'lucide-react';

export interface BookingConfirmation {
  bookingRef: string;
  flight: FlightOption;
  cabin: 'economy' | 'business' | 'first';
  seatNumber: string;
  passengerName: string;
  passportNumber: string;
  totalPriceUsd: number;
  gate: string;
  terminal: string;
  boardingTime: string;
  boardingGroup: string;
}

interface SeatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: FlightOption | null;
  initialCabin: 'economy' | 'business' | 'first';
  currency: CurrencyCode;
  onConfirmBooking: (confirmation: BookingConfirmation) => void;
}

const CABIN_LABEL: Record<'economy' | 'business' | 'first', string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First',
};

export const SeatSelectorModal: React.FC<SeatSelectorModalProps> = ({
  isOpen,
  onClose,
  flight,
  initialCabin,
  currency,
  onConfirmBooking,
}) => {
  const [selectedCabin, setSelectedCabin] = useState<'economy' | 'business' | 'first'>(initialCabin);
  const [selectedSeat, setSelectedSeat] = useState<string>(initialCabin === 'first' ? '1A' : initialCabin === 'business' ? '4A' : '10A');
  const [passengerName, setPassengerName] = useState('Tariq Al-Mansoor');
  const [passportNumber, setPassportNumber] = useState('A8942104');
  const [priorityAddon, setPriorityAddon] = useState(true);

  if (!isOpen || !flight) return null;

  // Occupied mock seats
  const occupiedSeats = new Set(['1B', '2D', '4C', '5B', '10B', '11C', '12E', '14A', '15F']);

  const getSeatExtraPrice = (seat: string): number => {
    if (seat.startsWith('1') || seat.startsWith('2')) return 0;
    if (seat.endsWith('A') || seat.endsWith('F')) return 25; // Window premium
    return 0;
  };

  const baseFare = flight.prices[selectedCabin];
  const seatFee = getSeatExtraPrice(selectedSeat);
  const addonFee = priorityAddon ? 35 : 0;
  const taxesFees = Math.round(baseFare * 0.12);
  const totalCost = baseFare + seatFee + addonFee + taxesFees;

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let bookingRef = 'AS-';
    for (let i = 0; i < 6; i++) {
      bookingRef += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const confirmation: BookingConfirmation = {
      bookingRef,
      flight,
      cabin: selectedCabin,
      seatNumber: selectedSeat,
      passengerName: passengerName || 'Valued Passenger',
      passportNumber: passportNumber || 'A0000000',
      totalPriceUsd: totalCost,
      gate: 'B18',
      terminal: 'Terminal 3',
      boardingTime: '06:35 UTC',
      boardingGroup: selectedCabin === 'first' ? 'Group 1' : selectedCabin === 'business' ? 'Group 2' : 'Group 3',
    };

    onConfirmBooking(confirmation);
  };

  const seatButtonLabel = (seatId: string, cabin: string, isOccupied: boolean, isSelected: boolean) =>
    `Seat ${seatId}, ${cabin}${isOccupied ? ', occupied' : isSelected ? ', selected' : ', available'}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose seat and passenger details"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] max-border max-shadow">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b-[3px] flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-ink)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg text-white flex items-center justify-center shrink-0 max-border" style={{ backgroundColor: 'var(--color-max-blue)' }}>
              <Armchair className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900">Choose your seat</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono max-border" style={{ backgroundColor: 'var(--color-max-yellow)' }}>
                  {flight.flightNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate font-medium">
                {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring max-press p-1.5 rounded-lg text-slate-900 shrink-0 max-border bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x-[3px] divide-slate-900">
          {/* Aircraft Cabin Map (Left 7 cols) */}
          <div className="lg:col-span-7 p-6 bg-slate-50/50 space-y-5">
            {/* Cabin Class Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Cabin</span>
              <div className="flex items-center bg-white p-1 rounded-lg text-sm max-border">
                {(['economy', 'business', 'first'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCabin(c);
                      setSelectedSeat(c === 'first' ? '1A' : c === 'business' ? '4A' : '10A');
                    }}
                    aria-pressed={selectedCabin === c}
                    className={`focus-ring px-3 py-1 rounded-md font-bold transition-colors ${
                      selectedCabin === c ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    style={selectedCabin === c ? { backgroundColor: 'var(--color-ink)' } : undefined}
                  >
                    {CABIN_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>

            {/* Aircraft Nose Indicator */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-10 border-t-[3px] border-x-[3px] rounded-t-full bg-white flex items-center justify-center text-[11px] text-slate-500 font-bold" style={{ borderColor: 'var(--color-ink)' }}>
                Cockpit
              </div>
            </div>

            {/* Seat Map Visualizer */}
            <div className="bg-white p-6 rounded-2xl space-y-4 max-h-96 overflow-y-auto max-border max-shadow-sm">
              {/* First (Rows 1-2) */}
              <div className="space-y-2 border-b-2 border-slate-100 pb-4">
                <div className="flex items-center justify-between text-xs font-black px-3 py-1 rounded-lg max-border" style={{ backgroundColor: 'var(--color-max-yellow)' }}>
                  <span>First (Rows 1–2)</span>
                  <span className="font-bold">1-2-1 suites</span>
                </div>
                {[1, 2].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-4 px-4">
                    {['A', 'D', 'G', 'K'].map((col, idx) => {
                      const seatId = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seatId);
                      const isSelected = selectedSeat === seatId;
                      return (
                        <div key={col} className="flex items-center gap-2">
                          {idx === 2 && <div className="w-8 text-center text-[10px] text-slate-300 font-medium">Aisle</div>}
                          <button
                            type="button"
                            disabled={isOccupied}
                            aria-label={seatButtonLabel(seatId, 'First', isOccupied, isSelected)}
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedSeat(seatId);
                              setSelectedCabin('first');
                            }}
                            className={`focus-ring w-12 h-12 rounded-xl font-black text-xs flex flex-col items-center justify-center transition-all max-border ${
                              isOccupied
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : isSelected
                                ? 'text-white scale-105 max-shadow-sm'
                                : 'bg-white hover:bg-yellow-50 text-slate-900'
                            }`}
                            style={isSelected ? { backgroundColor: 'var(--color-max-blue)' } : undefined}
                          >
                            <Armchair className="w-4 h-4" aria-hidden="true" />
                            <span className="text-[10px]">{seatId}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Business (Rows 4-6) */}
              <div className="space-y-2 border-b-2 border-slate-100 pb-4">
                <div className="flex items-center justify-between text-xs font-black text-white px-3 py-1 rounded-lg max-border" style={{ backgroundColor: 'var(--color-max-purple)' }}>
                  <span>Business (Rows 4–6)</span>
                  <span className="font-bold">2-2 lie-flat</span>
                </div>
                {[4, 5, 6].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-3 px-6">
                    {['A', 'C', 'D', 'F'].map((col, idx) => {
                      const seatId = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seatId);
                      const isSelected = selectedSeat === seatId;
                      return (
                        <div key={col} className="flex items-center gap-2">
                          {idx === 2 && <div className="w-12 text-center text-[10px] text-slate-300 font-medium">Aisle</div>}
                          <button
                            type="button"
                            disabled={isOccupied}
                            aria-label={seatButtonLabel(seatId, 'Business', isOccupied, isSelected)}
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedSeat(seatId);
                              setSelectedCabin('business');
                            }}
                            className={`focus-ring w-10 h-10 rounded-lg font-black text-xs flex flex-col items-center justify-center transition-all max-border ${
                              isOccupied
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : isSelected
                                ? 'text-white scale-105 max-shadow-sm'
                                : 'bg-white hover:bg-purple-50 text-slate-900'
                            }`}
                            style={isSelected ? { backgroundColor: 'var(--color-max-blue)' } : undefined}
                          >
                            <span className="text-[10px]">{seatId}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Economy (Rows 10-15) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg max-border">
                  <span>Economy (Rows 10–15)</span>
                  <span className="font-bold text-slate-500">3-3</span>
                </div>
                {[10, 11, 12, 14, 15].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-1 px-4">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((col, idx) => {
                      const seatId = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seatId);
                      const isSelected = selectedSeat === seatId;
                      return (
                        <div key={col} className="flex items-center">
                          {idx === 3 && <div className="w-8 text-center text-[10px] text-slate-300 font-medium">Aisle</div>}
                          <button
                            type="button"
                            disabled={isOccupied}
                            aria-label={seatButtonLabel(seatId, 'Economy', isOccupied, isSelected)}
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedSeat(seatId);
                              setSelectedCabin('economy');
                            }}
                            className={`focus-ring w-8 h-8 rounded-md font-black text-[10px] flex items-center justify-center transition-all max-border ${
                              isOccupied
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : isSelected
                                ? 'text-white scale-105 max-shadow-sm'
                                : 'bg-white hover:bg-slate-100 text-slate-700'
                            }`}
                            style={isSelected ? { backgroundColor: 'var(--color-max-blue)' } : undefined}
                          >
                            {seatId}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-700 font-bold pt-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white max-border">
                <div className="w-4 h-4 rounded bg-white max-border" aria-hidden="true"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white max-border">
                <div className="w-4 h-4 rounded text-white flex items-center justify-center text-[9px] font-black max-border" style={{ backgroundColor: 'var(--color-max-blue)' }} aria-hidden="true">✓</div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white max-border">
                <div className="w-4 h-4 rounded bg-slate-200 max-border" aria-hidden="true"></div>
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* Passenger Details & Checkout Summary (Right 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between space-y-6">
            <form onSubmit={handleCompleteBooking} className="space-y-5">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--color-max-blue)' }} aria-hidden="true" />
                  Passenger details
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Name as it appears on your passport.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="passenger-name" className="text-xs font-bold text-slate-700">
                    Full name
                  </label>
                  <input
                    id="passenger-name"
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    required
                    className="focus-ring w-full px-3 py-2 text-sm bg-slate-50 rounded-lg font-medium max-border"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="passport-number" className="text-xs font-bold text-slate-700">
                    Passport number
                  </label>
                  <input
                    id="passport-number"
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    required
                    className="focus-ring w-full px-3 py-2 text-sm bg-slate-50 rounded-lg font-medium max-border"
                  />
                </div>

                {/* Priority add-on */}
                <label
                  className="p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-3 max-border"
                  style={{ backgroundColor: priorityAddon ? 'var(--color-max-yellow)' : '#f8fafc' }}
                >
                  <input
                    type="checkbox"
                    checked={priorityAddon}
                    onChange={(e) => setPriorityAddon(e.target.checked)}
                    className="focus-ring sr-only"
                  />
                  <div
                    aria-hidden="true"
                    className="w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 max-border bg-white"
                  >
                    {priorityAddon && <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-ink)' }} />}
                  </div>
                  <div className="text-sm">
                    <span className="font-black text-slate-900 block">
                      Priority boarding & lounge (+{formatPrice(35, currency)})
                    </span>
                    <span className="text-slate-600 block text-xs mt-0.5 font-medium">
                      Priority bag tag, expedited security lane, and Wi-Fi priority.
                    </span>
                  </div>
                </label>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm max-border">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>{CABIN_LABEL[selectedCabin]} fare</span>
                  <span className="font-mono">{formatPrice(baseFare, currency)}</span>
                </div>
                {seatFee > 0 && (
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Seat {selectedSeat}</span>
                    <span className="font-mono">+{formatPrice(seatFee, currency)}</span>
                  </div>
                )}
                {priorityAddon && (
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Priority add-on</span>
                    <span className="font-mono">+{formatPrice(addonFee, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Taxes & fees</span>
                  <span className="font-mono">+{formatPrice(taxesFees, currency)}</span>
                </div>
                <div className="pt-2 border-t-2 flex items-center justify-between font-black text-sm text-slate-900" style={{ borderColor: 'var(--color-ink)' }}>
                  <span>Total</span>
                  <span className="text-lg font-mono" style={{ color: 'var(--color-max-blue)' }}>{formatPrice(totalCost, currency)}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                className="focus-ring max-press w-full py-3 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 max-border max-shadow-sm"
                style={{ backgroundColor: 'var(--color-max-blue)' }}
              >
                <CreditCard className="w-4 h-4" aria-hidden="true" />
                Confirm booking
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
