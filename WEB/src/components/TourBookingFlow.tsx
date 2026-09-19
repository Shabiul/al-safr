'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  X,
  Calendar,
  Users,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { CurrencyCode, formatPrice } from '@/services/flightData';

interface TourBookingFlowProps {
  tourPackageId: string;
  packageName: string;
  destination: string;
  priceUsd: number;
  currency: CurrencyCode;
}

type Step = 1 | 2 | 3 | 4;

const todayIso = () => new Date().toISOString().slice(0, 10);

export function TourBookingFlow({ tourPackageId, packageName, destination, priceUsd, currency }: TourBookingFlowProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState('');

  const open = () => {
    setStep(1);
    setError('');
    if (session?.user?.name) setName((n) => n || session.user!.name!);
    if (session?.user?.email) setEmail((e) => e || session.user!.email!);
    setIsOpen(true);
  };

  const close = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const goNext = () => {
    setError('');
    if (step === 1 && !travelDate) {
      setError('Pick a travel date to continue.');
      return;
    }
    if (step === 2 && (!name.trim() || !email.trim() || !phone.trim())) {
      setError('Name, email and phone are required.');
      return;
    }
    setStep((s) => (s + 1) as Step);
  };

  const goBack = () => {
    setError('');
    setStep((s) => (s - 1) as Step);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourPackageId, travelDate, travelers, name, email, phone, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit booking — please try again.');
        return;
      }
      setReference(data.id.slice(0, 8).toUpperCase());
      setStep(4);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = priceUsd * travelers;

  return (
    <>
      <button
        onClick={open}
        className="focus-ring max-press w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 max-border max-shadow"
        style={{ backgroundColor: 'var(--color-max-orange)', color: 'white' }}
      >
        Book Now
        <ArrowRight className="w-4 h-4" />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left" style={{ fontFamily: 'var(--font-display)' }}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} aria-hidden="true" />

          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto max-border max-shadow">
            <div className="sticky top-0 bg-white border-b-[3px] px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--color-ink)' }}>
              <div>
                <h2 className="font-black text-slate-900">{step === 4 ? 'Booking confirmed' : 'Book this trip'}</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">{packageName} · {destination}</p>
              </div>
              <button onClick={close} className="focus-ring max-press p-1.5 rounded-lg text-slate-600 max-border" style={{ backgroundColor: 'var(--color-max-yellow)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {step !== 4 && (
              <div className="px-6 pt-5 flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="h-2.5 flex-1 rounded-full max-border"
                    style={{ backgroundColor: s <= step ? 'var(--color-max-blue)' : 'white' }}
                  />
                ))}
              </div>
            )}

            <div className="p-6 space-y-5">
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-wide px-2 py-1 rounded-full max-border inline-block" style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}>Step 1 of 3 · Trip details</p>
                  <label className="space-y-1.5 block">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar className="w-4 h-4" style={{ color: 'var(--color-max-blue)' }} />Travel date</span>
                    <input
                      type="date"
                      min={todayIso()}
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm max-border"
                    />
                  </label>
                  <label className="space-y-1.5 block">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Users className="w-4 h-4" style={{ color: 'var(--color-max-blue)' }} />Travelers</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                        className="focus-ring max-press w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 max-border"
                        style={{ backgroundColor: 'white' }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-black text-slate-900">{travelers}</span>
                      <button
                        type="button"
                        onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                        className="focus-ring max-press w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 max-border"
                        style={{ backgroundColor: 'white' }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </label>
                  <div className="rounded-xl p-4 flex items-center justify-between max-border" style={{ backgroundColor: 'var(--color-max-blue)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Estimated total</span>
                    <span className="text-lg font-black" style={{ color: 'var(--color-ink)' }}>{formatPrice(total, currency)}</span>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-wide px-2 py-1 rounded-full max-border inline-block" style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}>Step 2 of 3 · Your details</p>
                  <label className="space-y-1.5 block">
                    <span className="text-sm font-bold text-slate-700">Full name</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm max-border"
                    />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="space-y-1.5 block">
                      <span className="text-sm font-bold text-slate-700">Email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm max-border"
                      />
                    </label>
                    <label className="space-y-1.5 block">
                      <span className="text-sm font-bold text-slate-700">Phone</span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm max-border"
                      />
                    </label>
                  </div>
                  <label className="space-y-1.5 block">
                    <span className="text-sm font-bold text-slate-700">Notes (optional)</span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Room preferences, dietary needs, anything else we should know…"
                      className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm resize-none max-border"
                    />
                  </label>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-wide px-2 py-1 rounded-full max-border inline-block" style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}>Step 3 of 3 · Review &amp; confirm</p>
                  <div className="rounded-xl divide-y-2 max-border" style={{ borderColor: 'var(--color-ink)' }}>
                    <div className="px-4 py-3 flex items-center justify-between text-sm" style={{ borderColor: 'var(--color-ink)' }}>
                      <span className="text-slate-500 font-semibold">Package</span>
                      <span className="font-black text-slate-900">{packageName}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between text-sm" style={{ borderColor: 'var(--color-ink)' }}>
                      <span className="text-slate-500 font-semibold">Travel date</span>
                      <span className="font-black text-slate-900">{new Date(travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between text-sm" style={{ borderColor: 'var(--color-ink)' }}>
                      <span className="text-slate-500 font-semibold">Travelers</span>
                      <span className="font-black text-slate-900">{travelers}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between text-sm" style={{ borderColor: 'var(--color-ink)' }}>
                      <span className="text-slate-500 font-semibold">Contact</span>
                      <span className="font-black text-slate-900 text-right">{name}<br /><span className="text-xs text-slate-400 font-semibold">{email} · {phone}</span></span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--color-max-blue)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Total</span>
                      <span className="text-lg font-black" style={{ color: 'var(--color-ink)' }}>{formatPrice(total, currency)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    This confirms a booking request — our team will call you to confirm availability and arrange payment. No card details are collected here.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto max-border max-shadow-sm" style={{ backgroundColor: 'var(--color-max-blue)' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-ink)' }} />
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">Thanks, {name.split(' ')[0]}!</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
                    Your booking request for <strong className="text-slate-700">{packageName}</strong> is in. Our team will call you at {phone} to confirm.
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">Reference: <span className="font-mono font-black text-slate-600">{reference}</span></p>
                  <button
                    onClick={close}
                    className="focus-ring max-press mt-2 px-6 py-2.5 rounded-xl font-black text-sm max-border max-shadow-sm"
                    style={{ backgroundColor: 'var(--color-max-orange)', color: 'white' }}
                  >
                    Done
                  </button>
                </div>
              )}

              {error && step !== 4 && <p className="text-sm font-bold" style={{ color: 'var(--color-max-orange)' }}>{error}</p>}

              {step !== 4 && (
                <div className="flex items-center gap-3 pt-2">
                  {step > 1 && (
                    <button
                      onClick={goBack}
                      disabled={isSubmitting}
                      className="focus-ring max-press flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-900 text-sm font-black disabled:opacity-50 max-border"
                      style={{ backgroundColor: 'white' }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      onClick={goNext}
                      className="focus-ring max-press flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black max-border max-shadow-sm"
                      style={{ backgroundColor: 'var(--color-max-blue)', color: 'white' }}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="focus-ring max-press flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl disabled:opacity-50 text-sm font-black max-border max-shadow-sm"
                      style={{ backgroundColor: 'var(--color-max-blue)', color: 'var(--color-ink)' }}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm booking'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
