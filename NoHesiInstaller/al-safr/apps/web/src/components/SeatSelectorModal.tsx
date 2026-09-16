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
      <div className="bg-white w-full max-w-5xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900">Choose your seat</h3>
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium font-mono">
                  {flight.flightNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Aircraft Cabin Map (Left 7 cols) */}
          <div className="lg:col-span-7 p-6 bg-slate-50/50 space-y-5">
            {/* Cabin Class Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-600">Cabin</span>
              <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 text-sm">
                {(['economy', 'business', 'first'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCabin(c);
                      setSelectedSeat(c === 'first' ? '1A' : c === 'business' ? '4A' : '10A');
                    }}
                    aria-pressed={selectedCabin === c}
                    className={`focus-ring px-3 py-1 rounded-md font-medium transition-colors ${
                      selectedCabin === c ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {CABIN_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>

            {/* Aircraft Nose Indicator */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-10 border-t-2 border-x-2 border-slate-200 rounded-t-full bg-white flex items-center justify-center text-[11px] text-slate-400 font-medium">
                Cockpit
              </div>
            </div>

            {/* Seat Map Visualizer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-h-96 overflow-y-auto">
              {/* First (Rows 1-2) */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
                  <span>First (Rows 1–2)</span>
                  <span className="font-normal text-amber-600">1-2-1 suites</span>
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
                            className={`focus-ring w-12 h-12 rounded-xl font-semibold text-xs border flex flex-col items-center justify-center transition-all ${
                              isOccupied
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 scale-105'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                            }`}
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
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg">
                  <span>Business (Rows 4–6)</span>
                  <span className="font-normal text-brand-600">2-2 lie-flat</span>
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
                            className={`focus-ring w-10 h-10 rounded-lg font-semibold text-xs border flex flex-col items-center justify-center transition-all ${
                              isOccupied
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-brand-600 text-white border-brand-700 ring-2 ring-brand-300 scale-105'
                                : 'bg-brand-50/60 hover:bg-brand-100 text-brand-900 border-brand-200'
                            }`}
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
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                  <span>Economy (Rows 10–15)</span>
                  <span className="font-normal text-slate-500">3-3</span>
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
                            className={`focus-ring w-8 h-8 rounded-md font-semibold text-[10px] border flex items-center justify-center transition-all ${
                              isOccupied
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-slate-900 text-white border-slate-950 ring-2 ring-slate-400 scale-105'
                                : 'bg-slate-50 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border border-slate-300" aria-hidden="true"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-brand-600 text-white flex items-center justify-center text-[9px] font-bold" aria-hidden="true">✓</div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" aria-hidden="true"></div>
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* Passenger Details & Checkout Summary (Right 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between space-y-6">
            <form onSubmit={handleCompleteBooking} className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                  Passenger details
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Name as it appears on your passport.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="passenger-name" className="text-xs font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    id="passenger-name"
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    required
                    className="focus-ring w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="passport-number" className="text-xs font-semibold text-slate-700">
                    Passport number
                  </label>
                  <input
                    id="passport-number"
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    required
                    className="focus-ring w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                {/* Priority add-on */}
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                    priorityAddon ? 'bg-brand-50 border-brand-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={priorityAddon}
                    onChange={(e) => setPriorityAddon(e.target.checked)}
                    className="focus-ring sr-only"
                  />
                  <div
                    aria-hidden="true"
                    className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                      priorityAddon ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {priorityAddon && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-900 block">
                      Priority boarding & lounge (+{formatPrice(35, currency)})
                    </span>
                    <span className="text-slate-500 block text-xs mt-0.5">
                      Priority bag tag, expedited security lane, and Wi-Fi priority.
                    </span>
                  </div>
                </label>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{CABIN_LABEL[selectedCabin]} fare</span>
                  <span className="font-mono">{formatPrice(baseFare, currency)}</span>
                </div>
                {seatFee > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Seat {selectedSeat}</span>
                    <span className="font-mono">+{formatPrice(seatFee, currency)}</span>
                  </div>
                )}
                {priorityAddon && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Priority add-on</span>
                    <span className="font-mono">+{formatPrice(addonFee, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600">
                  <span>Taxes & fees</span>
                  <span className="font-mono">+{formatPrice(taxesFees, currency)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold text-sm text-slate-900">
                  <span>Total</span>
                  <span className="text-lg text-brand-600 font-mono">{formatPrice(totalCost, currency)}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                className="focus-ring w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
