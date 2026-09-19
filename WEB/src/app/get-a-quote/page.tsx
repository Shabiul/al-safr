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
        <div className="p-8 rounded-2xl max-border max-shadow flex items-start gap-3" style={{ backgroundColor: 'var(--color-max-blue)' }}>
          <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: 'var(--color-ink)' }} />
          <div>
            <h2 className="font-black text-slate-900">Thanks, {name.split(' ')[0]}.</h2>
            <p className="text-sm text-slate-800 mt-1 font-medium">
              We&apos;ll get back to you shortly at {phone}. For anything urgent, call{' '}
              <a href="tel:+919900517604" className="font-black underline">+91 99005 17604</a> directly.
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
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg rounded-2xl max-border max-shadow bg-white p-5 sm:p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-slate-900 mb-1">Your name</label>
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring max-border w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-slate-900 mb-1">Mobile number</label>
            <input
              type="tel"
              required
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="focus-ring max-border w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-slate-900 mb-1">Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="focus-ring max-border w-full rounded-xl px-3 py-2.5 text-sm bg-white"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-slate-900 mb-1">Destination</label>
            <input
              type="text"
              placeholder="Destination (e.g. Dubai, Bali...)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="focus-ring max-border w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-slate-900 mb-1">Details</label>
          <textarea
            rows={4}
            placeholder="Any details that help us quote accurately (dates, number of travellers, budget...)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="focus-ring max-border w-full rounded-xl px-3 py-2.5 text-sm resize-none"
          />
        </div>

        {status === 'error' && <p className="text-sm text-rose-600 font-bold">Something went wrong — please try again.</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="focus-ring max-press w-full sm:w-auto px-8 disabled:opacity-50 rounded-xl py-3 font-black text-sm max-border max-shadow"
          style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
        >
          {status === 'submitting' ? 'Sending…' : 'Get free quote'}
        </button>
      </form>
    </StaticPageShell>
  );
}
