'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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
      router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto py-16 px-4">
      <div className="rounded-3xl bg-cream p-7 sm:p-8 max-border max-shadow rotate-1">
        <span
          className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border -rotate-3 mb-4"
          style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-ink)' }}
        >
          Welcome back
        </span>
        <h1 className="text-3xl font-black tracking-tight mb-6 text-slate-900">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium max-border"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium max-border"
          />
          {error && (
            <p
              className="text-sm font-bold px-3 py-2 rounded-xl max-border"
              style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring max-press w-full disabled:opacity-50 rounded-xl py-3 font-black text-sm max-border max-shadow"
            style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'var(--color-ink)' }}
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
