'use client';

import { useState } from 'react';
import { StaticPageShell } from '@/components/StaticPageShell';
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

const CONTACT_CARDS = [
  { icon: Phone, label: 'Phone', value: '+91 99005 17604', href: 'tel:+919900517604', color: 'var(--color-max-yellow)' },
  { icon: Mail, label: 'Email', value: 'luckysaj@gmail.com', href: 'mailto:luckysaj@gmail.com', color: 'var(--color-max-orange)' },
  { icon: MapPin, label: 'Office', value: 'A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001', color: 'var(--color-max-blue)' },
  { icon: Clock, label: 'Hours', value: 'Mon – Sat: 10:00 AM – 8:00 PM · Sunday: by appointment', color: 'var(--color-max-blue)' },
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
        <div className="p-8 rounded-2xl bg-white max-border max-shadow flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl max-border flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-max-blue)' }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--color-ink)' }} />
          </div>
          <div>
            <h2 className="font-black text-slate-900">Thanks, {name.split(' ')[0]}.</h2>
            <p className="text-sm text-slate-600 mt-1">
              We&apos;ve got your message. For anything urgent, call us directly at{' '}
              <a href="tel:+919900517604" className="font-black" style={{ color: 'var(--color-max-blue)' }}>+91 99005 17604</a>.
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
              <div className="w-10 h-10 rounded-xl max-border flex items-center justify-center shrink-0" style={{ backgroundColor: c.color }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">{c.label}</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{c.value}</div>
              </div>
            </>
          );
          const rotation = i % 2 === 0 ? '-rotate-1' : 'rotate-1';
          return c.href ? (
            <a key={c.label} href={c.href} className={`max-press p-4 rounded-2xl bg-white max-border max-shadow-sm flex items-start gap-3 ${rotation}`}>
              {content}
            </a>
          ) : (
            <div key={c.label} className={`p-4 rounded-2xl bg-white max-border max-shadow-sm flex items-start gap-3 ${rotation}`}>
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4 rounded-2xl bg-white max-border max-shadow p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg max-border flex items-center justify-center" style={{ backgroundColor: 'var(--color-max-yellow)' }}>
              <MessageCircle className="w-4.5 h-4.5" style={{ color: 'var(--color-ink)' }} />
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
                className="focus-ring w-full max-border rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-bold text-slate-500">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full max-border rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-xs font-bold text-slate-500">Phone (optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="focus-ring w-full max-border rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-bold text-slate-500">How can we help?</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="focus-ring w-full max-border rounded-xl px-3 py-2.5 text-sm resize-none"
            />
          </label>
          {status === 'error' && (
            <p className="text-sm font-bold px-3 py-2 rounded-lg max-border" style={{ backgroundColor: 'var(--color-max-orange)', color: 'white' }}>
              Something went wrong — please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="focus-ring max-press w-full sm:w-auto px-8 disabled:opacity-50 rounded-xl py-2.5 font-black text-sm max-border max-shadow-sm"
            style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
          >
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <div className="lg:col-span-2 rounded-2xl overflow-hidden max-border max-shadow relative min-h-[16rem] rotate-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80"
            alt="Al-Safr office"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-5 text-white">
            <span
              className="inline-block w-fit text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full max-border mb-2"
              style={{ backgroundColor: 'var(--color-max-blue)', color: 'white' }}
            >
              Visit us
            </span>
            <p className="text-sm font-bold">A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001</p>
            <p className="text-xs text-slate-200 mt-1 font-medium">Mon – Sat, 10:00 AM – 8:00 PM</p>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
