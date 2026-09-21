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
      <div className="bg-cream w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col my-8 soft-border soft-shadow">
        {/* Top Confirmation Banner */}
        <div className="text-white px-6 py-4 flex items-center justify-between gap-3 border-b-[3px]" style={{ backgroundColor: 'var(--color-ticket-orange)', borderColor: 'var(--color-dark-ink-muted)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-full bg-cream/20 shrink-0 soft-border">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-black">Booking confirmed</h3>
              <p className="text-xs text-white/90 truncate font-medium">
                Reference: <strong className="text-white font-mono">{booking.bookingRef}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring soft-press p-1.5 rounded-lg bg-cream text-slate-900 shrink-0 soft-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Pass Ticket Body */}
        <div className="p-6 sm:p-8 bg-slate-50 space-y-6">
          <div className="ticket-notch bg-cream rounded-2xl p-6 sm:p-7 soft-border soft-shadow-sm">
            {/* Header Ticket Strip */}
            <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-slate-300 pb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-sm">Al-Safr</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                      السفر
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Electronic boarding pass</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-medium">Cabin</span>
                <span className="text-xs font-black text-white px-2 py-0.5 rounded-full soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
                  {CABIN_LABEL[booking.cabin]}
                </span>
              </div>
            </div>

            {/* Flight Route Key Segment */}
            <div className="py-5 flex items-center justify-between border-b-2 border-dashed border-slate-300">
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono">{booking.flight.origin.code}</span>
                <span className="text-xs font-bold text-slate-600 block">{booking.flight.origin.city}</span>
                <span className="text-[11px] text-slate-400 font-medium">Dep {booking.flight.departureTime}</span>
              </div>

              <div className="flex-1 px-6 flex flex-col items-center">
                <span className="text-[11px] text-slate-400 font-medium">{booking.flight.duration}</span>
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="w-2.5 h-2.5 rounded-full soft-border bg-cream" aria-hidden="true"></div>
                  <div className="flex-1 border-t-2 border-slate-300 relative">
                    <Plane className="w-3.5 h-3.5 absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" style={{ color: 'var(--color-ticket-orange)' }} aria-hidden="true" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full soft-border bg-cream" aria-hidden="true"></div>
                </div>
                <span className="text-[11px] font-black font-mono" style={{ color: 'var(--color-ticket-orange)' }}>{booking.flight.flightNumber}</span>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 font-mono">{booking.flight.destination.code}</span>
                <span className="text-xs font-bold text-slate-600 block">{booking.flight.destination.city}</span>
                <span className="text-[11px] text-slate-400 font-medium">Arr {booking.flight.arrivalTime}</span>
              </div>
            </div>

            {/* Passenger & Flight Details Grid */}
            <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b-2 border-dashed border-slate-300 text-sm">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Passenger</span>
                <span className="font-black text-slate-900 truncate block mt-0.5">{booking.passengerName}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Seat</span>
                <span
                  className="text-base font-black inline-block mt-0.5 font-mono px-2 py-0.5 rounded soft-border"
                  style={{ backgroundColor: 'var(--color-ticket-orange)' }}
                >
                  {booking.seatNumber}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Gate</span>
                <span className="font-black text-slate-900 block mt-0.5">{booking.gate}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Boarding group</span>
                <span className="font-black block mt-0.5" style={{ color: 'var(--color-ticket-orange)' }}>{booking.boardingGroup}</span>
              </div>
            </div>

            {/* Barcode / QR Code Strip */}
            <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 p-1.5 rounded-lg flex items-center justify-center text-white shrink-0 soft-border" aria-hidden="true">
                  <QrCode className="w-full h-full" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block font-medium">Boarding code</span>
                  <span className="text-xs font-black text-slate-800 tracking-wide block font-mono">
                    AS-{booking.bookingRef}-{booking.seatNumber}
                  </span>
                  <span className="text-[11px] font-bold flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-ticket-orange)' }}>
                    <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                    Security cleared
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Total paid</span>
                <span className="text-base font-black text-slate-900 font-mono">
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
              className="focus-ring soft-press py-2.5 px-5 rounded-xl text-white text-sm font-black flex items-center gap-2 soft-border soft-shadow-sm"
              style={{ backgroundColor: 'var(--color-dark-ink-muted)' }}
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Print / Save PDF
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Boarding pass sent via email.')}
                className="focus-ring soft-press py-2.5 px-4 rounded-xl bg-cream text-slate-700 text-sm font-bold flex items-center gap-1.5 soft-border"
              >
                <Share2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Share
              </button>

              <button
                type="button"
                onClick={onClose}
                className="focus-ring soft-press py-2.5 px-4 rounded-xl text-sm font-black soft-border"
                style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-dark-ink-muted)' }}
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
