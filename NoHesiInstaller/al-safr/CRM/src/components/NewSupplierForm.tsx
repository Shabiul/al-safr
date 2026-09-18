'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

const TYPES = ['HOTEL', 'CAB_OPERATOR', 'TOUR_OPERATOR', 'AIRLINE', 'OTHER'];

export function NewSupplierForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('HOTEL');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, contactName, phone, email, commissionPercent, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create supplier');
        return;
      }
      setName(''); setContactName(''); setPhone(''); setEmail(''); setCommissionPercent(''); setNotes('');
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
      <button onClick={() => setIsOpen(true)} className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20">
        <Plus className="w-4 h-4" />
        New supplier
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4 max-w-lg">
      <h2 className="font-semibold text-slate-900">New supplier</h2>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required placeholder="Supplier name" value={name} onChange={(e) => setName(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white">
          {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="number" min={0} max={100} placeholder="Commission %" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
        <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={isSubmitting} className="focus-ring px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20">
          {isSubmitting ? 'Creating…' : 'Create supplier'}
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  );
}
