'use client';

import { useState } from 'react';
import { StaticPageShell } from '@/components/StaticPageShell';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CONTACT', name, email, phone, message }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <StaticPageShell title="Message sent">
        <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h2 className="font-semibold text-slate-900">Thanks, {name.split(' ')[0]}.</h2>
            <p className="text-sm text-slate-600 mt-1">
              We&apos;ve got your message. For anything urgent, call us directly at{' '}
              <a href="tel:+919900517604" className="text-brand-700 font-medium">+91 99005 17604</a>.
            </p>
          </div>
        </div>
      </StaticPageShell>
    );
  }

  return (
    <StaticPageShell title="Contact us" subtitle="Questions about a booking, or anything else — we read every message.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <textarea
            required
            rows={4}
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none"
          />
          {status === 'error' && <p className="text-sm text-rose-600">Something went wrong — please try again.</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="focus-ring w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
          >
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-900">Phone</div>
              <a href="tel:+919900517604" className="text-sm text-slate-500 hover:text-brand-700">+91 99005 17604</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-900">Email</div>
              <a href="mailto:luckysaj@gmail.com" className="text-sm text-slate-500 hover:text-brand-700">luckysaj@gmail.com</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-900">Office</div>
              <p className="text-sm text-slate-500">A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-slate-900">Hours</div>
              <p className="text-sm text-slate-500">Monday – Saturday: 10:00 AM – 8:00 PM<br />Sunday: by appointment</p>
            </div>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
