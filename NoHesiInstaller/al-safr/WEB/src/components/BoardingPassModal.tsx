'use client';

import React, { useEffect } from 'react';
import { BookingConfirmation } from './SeatSelectorModal';
import { formatPrice, CurrencyCode } from '@/services/flightData';
import {
  X,
  Printer,
  Share2,
  Plane,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingConfirmation | null;
  currency: CurrencyCode;
}

const CABIN_LABEL: Record<'economy' | 'business' | 'first', string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First',
};

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({
  isOpen,
  onClose,
  booking,
  currency,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#f97316', '#10b981', '#0f172a'],
        });
      } catch {
        // Safe fallback if canvas-confetti is not loaded
      }
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Boarding pass"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Top Confirmation Banner */}
        <div className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-full bg-white/15 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">Booking confirmed</h3>
              <p className="text-xs text-brand-100 truncate">
                Reference: <strong className="text-white font-mono">{booking.bookingRef}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Pass Ticket Body */}
        <div className="p-6 sm:p-8 bg-slate-50 space-y-6">
          <div className="ticket-notch bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
            {/* Header Ticket Strip */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 text-sm">Al-Safr</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                      السفر
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Electronic boarding pass</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block">Cabin</span>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  {CABIN_LABEL[booking.cabin]}
                </span>
              </div>
            </div>

            {/* Flight Route Key Segment */}
            <div className="py-5 flex items-center justify-between border-b border-dashed border-slate-200">
              <div>
                <span className="text-3xl font-semibold text-slate-900 font-mono">{booking.flight.origin.code}</span>
                <span className="text-xs font-medium text-slate-600 block">{booking.flight.origin.city}</span>
                <span className="text-[11px] text-slate-400">Dep {booking.flight.departureTime}</span>
              </div>

              <div className="flex-1 px-6 flex flex-col items-center">
                <span className="text-[11px] text-slate-400 font-medium">{booking.flight.duration}</span>
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="w-2 h-2 rounded-full bg-brand-500" aria-hidden="true"></div>
                  <div className="flex-1 border-t-2 border-slate-200 relative">
                    <Plane className="w-3.5 h-3.5 text-brand-500 absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" aria-hidden="true" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></div>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold font-mono">{booking.flight.flightNumber}</span>
              </div>

              <div className="text-right">
                <span className="text-3xl font-semibold text-slate-900 font-mono">{booking.flight.destination.code}</span>
                <span className="text-xs font-medium text-slate-600 block">{booking.flight.destination.city}</span>
                <span className="text-[11px] text-slate-400">Arr {booking.flight.arrivalTime}</span>
              </div>
            </div>

            {/* Passenger & Flight Details Grid */}
            <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-dashed border-slate-200 text-sm">
              <div>
                <span className="text-[11px] text-slate-400 block">Passenger</span>
                <span className="font-medium text-slate-900 truncate block mt-0.5">{booking.passengerName}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Seat</span>
                <span className="text-base font-semibold text-brand-600 block mt-0.5 font-mono">
                  {booking.seatNumber}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Gate</span>
                <span className="font-medium text-slate-900 block mt-0.5">{booking.gate}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Boarding group</span>
                <span className="font-medium text-emerald-600 block mt-0.5">{booking.boardingGroup}</span>
              </div>
            </div>

            {/* Barcode / QR Code Strip */}
            <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 p-1.5 rounded-lg flex items-center justify-center text-white shrink-0" aria-hidden="true">
                  <QrCode className="w-full h-full" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">Boarding code</span>
                  <span className="text-xs font-semibold text-slate-800 tracking-wide block font-mono">
                    AS-{booking.bookingRef}-{booking.seatNumber}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                    Security cleared
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Total paid</span>
                <span className="text-base font-semibold text-slate-900 font-mono">
                  {formatPrice(booking.totalPriceUsd, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="focus-ring py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-brand-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Print / Save PDF
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Boarding pass sent via email.')}
                className="focus-ring py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Share
              </button>

              <button
                type="button"
                onClick={onClose}
                className="focus-ring py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
