'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StaffRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
}

export function StaffTable({ staff, currentUserId }: { staff: StaffRow[]; currentUserId?: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const updateStaff = async (id: string, patch: { active?: boolean; role?: string }) => {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card overflow-hidden">
      {error && <p className="p-3 text-sm text-rose-600 bg-rose-50 border-b border-rose-200">{error}</p>}
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Name</th>
            <th className="text-left px-5 py-3 font-medium">Email</th>
            <th className="text-left px-5 py-3 font-medium">Role</th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staff.map((s) => {
            const isSelf = s.id === currentUserId;
            return (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {s.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                </td>
                <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                <td className="px-5 py-3.5">
                  <select
                    value={s.role}
                    disabled={isSelf || busyId === s.id}
                    onChange={(e) => updateStaff(s.id, { role: e.target.value })}
                    className="focus-ring border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white disabled:opacity-50"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    disabled={isSelf || busyId === s.id}
                    onClick={() => updateStaff(s.id, { active: !s.active })}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
                      s.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {s.active ? 'Active' : 'Deactivated'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
