'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface MarkupSettingRow {
  service: string;
  percentage: number;
}

const LABELS: Record<string, string> = {
  flights: 'Flights',
  hotels: 'Hotels',
  cabs: 'Cabs / Car rental',
};

export function MarkupForm({ initial }: { initial: MarkupSettingRow[] }) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(initial.map((s) => [s.service, s.percentage]))
  );
  const [savedService, setSavedService] = useState<string | null>(null);
  const [busyService, setBusyService] = useState<string | null>(null);
  const [error, setError] = useState('');

  const save = async (service: string) => {
    setBusyService(service);
    setSavedService(null);
    setError('');
    try {
      const res = await fetch('/api/markup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, percentage: values[service] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }
      setSavedService(service);
      setTimeout(() => setSavedService(null), 2000);
    } finally {
      setBusyService(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 max-w-lg">
      {error && <p className="p-4 text-sm text-rose-600 bg-rose-50">{error}</p>}
      {initial.map((s) => (
        <div key={s.service} className="p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-900">{LABELS[s.service] || s.service}</div>
            <div className="text-xs text-slate-500">Added on top of the live supplier price</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number"
                min={0}
                max={500}
                step={0.5}
                value={values[s.service]}
                onChange={(e) => setValues({ ...values, [s.service]: Number(e.target.value) })}
                className="focus-ring w-24 border border-slate-200 rounded-lg pl-3 pr-7 py-2 text-sm text-right"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
            </div>
            <button
              onClick={() => save(s.service)}
              disabled={busyService === s.service}
              className="focus-ring w-9 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
              aria-label={`Save ${s.service} markup`}
            >
              <Check className="w-4 h-4" />
            </button>
            {savedService === s.service && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
