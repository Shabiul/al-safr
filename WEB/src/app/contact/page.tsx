'use client';

import { useState } from 'react';
import { StaticPageShell } from '@/components/StaticPageShell';
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

const CONTACT_CARDS = [
  { icon: Phone, label: 'Phone', value: '+91 99005 17604', href: 'tel:+919900517604' },
  { icon: Mail, label: 'Email', value: 'luckysaj@gmail.com', href: 'mailto:luckysaj@gmail.com' },
  { icon: MapPin, label: 'Office', value: 'A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001' },
  { icon: Clock, label: 'Hours', value: 'Mon – Sat: 10:00 AM – 8:00 PM · Sunday: by appointment' },
];

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
    <StaticPageShell title="Contact us" subtitle="Questions about a booking, or anything else — we read every message." wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTACT_CARDS.map((c) => {
          const Icon = c.icon;
          const content = (
            <>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</div>
                <div className="text-sm font-medium text-slate-900 mt-0.5">{c.value}</div>
              </div>
            </>
          );
          return c.href ? (
            <a key={c.label} href={c.href} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:border-brand-300 hover:bg-white transition-colors">
              {content}
            </a>
          ) : (
            <div key={c.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Send us a message</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 block">
              <span className="text-xs font-medium text-slate-500">Your name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-medium text-slate-500">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-xs font-medium text-slate-500">Phone (optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-medium text-slate-500">How can we help?</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none"
            />
          </label>
          {status === 'error' && <p className="text-sm text-rose-600">Something went wrong — please try again.</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="focus-ring w-full sm:w-auto px-8 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
          >
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 relative min-h-[16rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80"
            alt="Al-Safr office"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-200">Visit us</div>
            <p className="text-sm font-medium mt-1">A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001</p>
            <p className="text-xs text-slate-300 mt-1">Mon – Sat, 10:00 AM – 8:00 PM</p>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
