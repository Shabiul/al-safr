'use client';

import { useState } from 'react';
import { StaticPageShell } from '@/components/StaticPageShell';
import { CheckCircle2 } from 'lucide-react';

const SERVICES = ['Flight Booking', 'Hotel Booking', 'Tour Package', 'Cab / Car Rental', 'Visa Assistance', 'Something else'];

export default function GetAQuotePage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(SERVICES[0]);
  const [destination, setDestination] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'QUOTE', name, phone, service, destination, message }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <StaticPageShell title="Quote request received">
        <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h2 className="font-semibold text-slate-900">Thanks, {name.split(' ')[0]}.</h2>
            <p className="text-sm text-slate-600 mt-1">
              We&apos;ll get back to you shortly at {phone}. For anything urgent, call{' '}
              <a href="tel:+919900517604" className="text-brand-700 font-medium">+91 99005 17604</a> directly.
            </p>
          </div>
        </div>
      </StaticPageShell>
    );
  }

  return (
    <StaticPageShell
      title="Get a quote"
      subtitle="Tell us what you're planning — quotes are free, and we usually reply the same day."
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="tel"
            required
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white"
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Destination (e.g. Dubai, Bali...)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </div>

        <textarea
          rows={4}
          placeholder="Any details that help us quote accurately (dates, number of travellers, budget...)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none"
        />

        {status === 'error' && <p className="text-sm text-rose-600">Something went wrong — please try again.</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="focus-ring w-full sm:w-auto px-8 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
        >
          {status === 'submitting' ? 'Sending…' : 'Get free quote'}
        </button>
      </form>
    </StaticPageShell>
  );
}
