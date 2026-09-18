'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TourPackageOption {
  id: string;
  name: string;
  priceUsd: number;
}

interface PromoCodeOption {
  id: string;
  code: string;
}

const SERVICE_TYPES = ['FLIGHT', 'HOTEL', 'CAB', 'PACKAGE'];

export function BookingForm({ tourPackages, promoCodes }: { tourPackages: TourPackageOption[]; promoCodes: PromoCodeOption[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState('PACKAGE');
  const [tourPackageId, setTourPackageId] = useState('');
  const [details, setDetails] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [amount, setAmount] = useState(0);
  const [promoCodeId, setPromoCodeId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePackageSelect = (id: string) => {
    setTourPackageId(id);
    const pkg = tourPackages.find((p) => p.id === id);
    if (pkg) setAmount(pkg.priceUsd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, customerEmail, customerPhone, serviceType,
          tourPackageId: serviceType === 'PACKAGE' ? tourPackageId || null : null,
          details, travelDate: travelDate || null, amount,
          promoCodeId: promoCodeId || null, notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create booking');
        return;
      }
      router.push(`/bookings/${data.booking.id}`);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-2xl">
      {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Customer name</span>
          <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Email</span>
          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Phone</span>
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Service type</span>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        {serviceType === 'PACKAGE' && (
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Tour package</span>
            <select value={tourPackageId} onChange={(e) => handlePackageSelect(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white">
              <option value="">— Select —</option>
              {tourPackages.map((p) => <option key={p.id} value={p.id}>{p.name} (${p.priceUsd})</option>)}
            </select>
          </label>
        )}
      </div>

      <label className="space-y-1 block">
        <span className="text-xs font-medium text-slate-500">Details (route, hotel name, dates, pax, etc.)</span>
        <textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Travel date</span>
          <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Amount (USD)</span>
          <input type="number" min={0} required value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Promo code</span>
          <select value={promoCodeId} onChange={(e) => setPromoCodeId(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            <option value="">None</option>
            {promoCodes.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
          </select>
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs font-medium text-slate-500">Internal notes</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none" />
      </label>

      <button type="submit" disabled={isSubmitting} className="focus-ring px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20">
        {isSubmitting ? 'Creating…' : 'Create booking'}
      </button>
    </form>
  );
}
