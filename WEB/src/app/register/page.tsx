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
      <h1 className="text-2xl font-semibold mb-6 text-slate-900">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
