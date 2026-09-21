'use client';

import { useState } from 'react';
import { StaticPageShell } from '@/components/StaticPageShell';
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

const CONTACT_CARDS = [
  { icon: Phone, label: 'Phone', value: '+91 89045 63397', href: 'tel:+918904563397', color: 'var(--color-ticket-orange)' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 89045 63396', href: 'https://wa.me/918904563396', color: '#10b981' },
  { icon: Mail, label: 'Email', value: 'alsafartoursntravels@gmail.com', href: 'mailto:alsafartoursntravels@gmail.com', color: 'var(--color-ticket-orange)' },
  { icon: MapPin, label: 'Office', value: '53/3, Abbaiah Reddy St, near Celebrity Arch, Doddathoguru, Electronic City Phase I, Electronic City, Bengaluru, Karnataka 560100', color: 'var(--color-ticket-orange)' },
  { icon: Clock, label: 'Hours', value: 'Mon – Sat: 10:00 AM – 8:00 PM · Sunday: by appointment', color: 'var(--color-ticket-orange)' },
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
        <div className="p-8 rounded-2xl bg-cream soft-border soft-shadow flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl soft-border flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--color-dark-ink-muted)' }} />
          </div>
          <div>
            <h2 className="font-black text-slate-900">Thanks, {name.split(' ')[0]}.</h2>
            <p className="text-sm text-slate-600 mt-1">
              We&apos;ve got your message. For anything urgent, call us directly at{' '}
              <a href="tel:+918904563397" className="font-black" style={{ color: 'var(--color-ticket-orange)' }}>+91 89045 63397</a>.
            </p>
          </div>
        </div>
      </StaticPageShell>
    );
  }

  return (
    <StaticPageShell title="Contact us" subtitle="Questions about a booking, or anything else — we read every message." wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CONTACT_CARDS.map((c, i) => {
          const Icon = c.icon;
          const content = (
            <>
              <div className="w-10 h-10 rounded-xl soft-border flex items-center justify-center shrink-0" style={{ backgroundColor: c.color }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--color-dark-ink-muted)' }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">{c.label}</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{c.value}</div>
              </div>
            </>
          );
          const rotation = i % 2 === 0 ? '-rotate-1' : 'rotate-1';
          return c.href ? (
            <a key={c.label} href={c.href} className={`soft-press p-4 rounded-2xl bg-cream soft-border soft-shadow-sm flex items-start gap-3 ${rotation}`}>
              {content}
            </a>
          ) : (
            <div key={c.label} className={`p-4 rounded-2xl bg-cream soft-border soft-shadow-sm flex items-start gap-3 ${rotation}`}>
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4 rounded-2xl bg-cream soft-border soft-shadow p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg soft-border flex items-center justify-center" style={{ backgroundColor: 'var(--color-ticket-orange)' }}>
              <MessageCircle className="w-4.5 h-4.5" style={{ color: 'var(--color-dark-ink-muted)' }} />
            </div>
            <h2 className="font-black text-slate-900">Send us a message</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 block">
              <span className="text-xs font-bold text-slate-500">Your name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-ring w-full soft-border rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-bold text-slate-500">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full soft-border rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-xs font-bold text-slate-500">Phone (optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="focus-ring w-full soft-border rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-bold text-slate-500">How can we help?</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="focus-ring w-full soft-border rounded-xl px-3 py-2.5 text-sm resize-none"
            />
          </label>
          {status === 'error' && (
            <p className="text-sm font-bold px-3 py-2 rounded-lg soft-border" style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}>
              Something went wrong — please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="focus-ring soft-press w-full sm:w-auto px-8 disabled:opacity-50 rounded-xl py-2.5 font-black text-sm soft-border soft-shadow-sm"
            style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-dark-ink-muted)' }}
          >
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <div className="lg:col-span-2 rounded-2xl overflow-hidden soft-border soft-shadow relative min-h-[16rem] rotate-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80"
            alt="Al-Safr office"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-5 text-white">
            <span
              className="inline-block w-fit text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full soft-border mb-2"
              style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}
            >
              Visit us
            </span>
            <p className="text-sm font-bold">53/3, Abbaiah Reddy St, near Celebrity Arch, Doddathoguru, Electronic City Phase I, Electronic City, Bengaluru, Karnataka 560100</p>
            <p className="text-xs text-slate-200 mt-1 font-medium">Mon – Sat, 10:00 AM – 8:00 PM</p>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
