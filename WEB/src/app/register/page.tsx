'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Account created — please log in.');
        router.push('/login');
        return;
      }
      router.push('/');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto py-16 px-4">
      <div className="rounded-3xl bg-white p-7 sm:p-8 max-border max-shadow -rotate-1">
        <span
          className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border rotate-3 mb-4"
          style={{ backgroundColor: 'var(--color-max-blue)', color: 'white' }}
        >
          Join us
        </span>
        <h1 className="text-3xl font-black tracking-tight mb-6 text-slate-900">Create an account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium max-border"
          />
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
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium max-border"
          />
          {error && (
            <p
              className="text-sm font-bold px-3 py-2 rounded-xl max-border"
              style={{ backgroundColor: 'var(--color-max-pink)', color: 'white' }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring max-press w-full disabled:opacity-50 rounded-xl py-3 font-black text-sm text-white max-border max-shadow"
            style={{ backgroundColor: 'var(--color-max-green)' }}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  );
}
