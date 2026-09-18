'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function NewPromoCodeForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          validUntil: validUntil || null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create promo code');
        return;
      }
      setCode('');
      setDiscountValue(10);
      setValidUntil('');
      setUsageLimit('');
      setIsOpen(false);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20"
      >
        <Plus className="w-4 h-4" />
        New promo code
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4 max-w-lg">
      <h2 className="font-semibold text-slate-900">New promo code</h2>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="CODE (e.g. SUMMER25)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono"
        />
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white"
        >
          <option value="PERCENTAGE">Percentage off</option>
          <option value="FIXED">Fixed amount off (USD)</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          required
          type="number"
          min={0}
          placeholder={discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 50'}
          value={discountValue}
          onChange={(e) => setDiscountValue(Number(e.target.value))}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="number"
          min={1}
          placeholder="Usage limit (optional)"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20"
        >
          {isSubmitting ? 'Creating…' : 'Create code'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
