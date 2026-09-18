'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface SupplierRow {
  id: string;
  name: string;
  type: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  commissionPercent: number | null;
  active: boolean;
}

export function SupplierTable({ suppliers }: { suppliers: SupplierRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggleActive = async (id: string, active: boolean) => {
    setBusyId(id);
    await fetch(`/api/suppliers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    router.refresh();
    setBusyId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    setBusyId(id);
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    router.refresh();
    setBusyId(null);
  };

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-sm text-slate-500">No suppliers yet.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Name</th>
            <th className="text-left px-5 py-3 font-medium">Type</th>
            <th className="text-left px-5 py-3 font-medium">Contact</th>
            <th className="text-left px-5 py-3 font-medium">Commission</th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
            <th />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suppliers.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-slate-900">{s.name}</td>
              <td className="px-5 py-3.5 text-slate-600">{s.type.replace('_', ' ')}</td>
              <td className="px-5 py-3.5 text-slate-500">
                {s.contactName || '—'}{s.phone ? ` · ${s.phone}` : ''}{s.email ? ` · ${s.email}` : ''}
              </td>
              <td className="px-5 py-3.5 text-slate-500">{s.commissionPercent != null ? `${s.commissionPercent}%` : '—'}</td>
              <td className="px-5 py-3.5">
                <button
                  disabled={busyId === s.id}
                  onClick={() => toggleActive(s.id, !s.active)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${s.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {s.active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-5 py-3.5 text-right">
                <button disabled={busyId === s.id} onClick={() => handleDelete(s.id, s.name)} className="text-slate-400 hover:text-rose-600 disabled:opacity-50">
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
