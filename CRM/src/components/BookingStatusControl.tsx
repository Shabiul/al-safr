'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-rose-50 text-rose-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
};

export function BookingStatusControl({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  const update = async (next: string) => {
    setValue(next);
    setBusy(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => update(e.target.value)}
      className={`focus-ring text-xs font-semibold px-2.5 py-1 rounded-full border-0 disabled:opacity-50 ${COLORS[value]}`}
    >
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
