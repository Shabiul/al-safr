'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export function NewStaffForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'SUPER_ADMIN'>('STAFF');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }
      setName('');
      setEmail('');
      setPassword('');
      setRole('STAFF');
      setIsOpen(false);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20"
      >
        <UserPlus className="w-4 h-4" />
        New staff account
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4 max-w-lg">
      <h2 className="font-semibold text-slate-900">New staff account</h2>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          type="password"
          minLength={8}
          placeholder="Temporary password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'STAFF' | 'SUPER_ADMIN')}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white"
        >
          <option value="STAFF">Staff</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20"
        >
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
