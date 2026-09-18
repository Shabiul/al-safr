'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

interface PaymentRow {
  id: string;
  type: string;
  method: string;
  amount: number;
  reference: string | null;
  note: string | null;
  recordedBy: string | null;
  createdAt: string;
}

const METHODS = ['CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER'];

export function PaymentPanel({ bookingId, payments }: { bookingId: string; payments: PaymentRow[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'PAYMENT' | 'REFUND'>('PAYMENT');
  const [method, setMethod] = useState('CASH');
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + (p.type === 'PAYMENT' ? p.amount : -p.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, method, amount, reference, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to record');
        return;
      }
      setAmount(0);
      setReference('');
      setNote('');
      setIsOpen(false);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Payments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Net received: ${totalPaid.toFixed(2)}</p>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="focus-ring flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Record
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-5 space-y-3 border-b border-slate-200 bg-slate-50">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={type} onChange={(e) => setType(e.target.value as 'PAYMENT' | 'REFUND')} className="focus-ring border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white">
              <option value="PAYMENT">Payment</option>
              <option value="REFUND">Refund</option>
            </select>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="focus-ring border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white">
              {METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
            <input type="number" min={0} step={0.01} required placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="focus-ring border border-slate-200 rounded-lg px-2.5 py-2 text-sm" />
            <input placeholder="Reference #" value={reference} onChange={(e) => setReference(e.target.value)} className="focus-ring border border-slate-200 rounded-lg px-2.5 py-2 text-sm" />
          </div>
          <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm" />
          <button type="submit" disabled={isSubmitting} className="focus-ring px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold">
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {payments.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {payments.map((p) => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  <span className={p.type === 'REFUND' ? 'text-rose-600' : 'text-emerald-600'}>{p.type === 'REFUND' ? '−' : '+'}${p.amount.toFixed(2)}</span>
                  <span className="text-slate-400 ml-2 text-xs font-normal">{p.method.replace('_', ' ')}{p.reference ? ` · ${p.reference}` : ''}</span>
                </div>
                {p.note && <p className="text-xs text-slate-500 truncate">{p.note}</p>}
              </div>
              <span className="text-xs text-slate-400 shrink-0">{p.recordedBy} · {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
