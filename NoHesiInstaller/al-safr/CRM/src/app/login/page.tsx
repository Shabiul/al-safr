'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Plane } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Invalid email or password');
        return;
      }
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-brand-900/20 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm shadow-brand-600/30 mb-3">
            <Plane className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Al-Safr CRM</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your staff account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="space-y-1 block">
            <span className="text-xs font-medium text-slate-500">Staff email</span>
            <input
              type="email"
              required
              placeholder="you@alsafr.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-medium text-slate-500">Password</span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors shadow-sm shadow-brand-600/30"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
