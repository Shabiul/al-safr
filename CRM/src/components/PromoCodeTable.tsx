'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface PromoCodeRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  validUntil: Date | null;
  usageLimit: number | null;
  timesUsed: number;
  active: boolean;
}

export function PromoCodeTable({ codes }: { codes: PromoCodeRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggleActive = async (id: string, active: boolean) => {
    setBusyId(id);
    await fetch(`/api/promo-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    router.refresh();
    setBusyId(null);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"?`)) return;
    setBusyId(id);
    await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' });
    router.refresh();
    setBusyId(null);
  };

  if (codes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-sm text-slate-500">No promo codes yet.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Code</th>
            <th className="text-left px-5 py-3 font-medium">Discount</th>
            <th className="text-left px-5 py-3 font-medium">Valid until</th>
            <th className="text-left px-5 py-3 font-medium">Usage</th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
            <th />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {codes.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">{c.code}</td>
              <td className="px-5 py-3.5 text-slate-600">
                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}
              </td>
              <td className="px-5 py-3.5 text-slate-500">
                {c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry'}
              </td>
              <td className="px-5 py-3.5 text-slate-500">
                {c.timesUsed}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
              </td>
              <td className="px-5 py-3.5">
                <button
                  disabled={busyId === c.id}
                  onClick={() => toggleActive(c.id, !c.active)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
                    c.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {c.active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  disabled={busyId === c.id}
                  onClick={() => handleDelete(c.id, c.code)}
                  className="text-slate-400 hover:text-rose-600 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
