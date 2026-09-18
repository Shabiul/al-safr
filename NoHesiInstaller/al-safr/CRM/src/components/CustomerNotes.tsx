'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NoteRow {
  id: string;
  note: string;
  staffName: string;
  createdAt: string;
}

export function CustomerNotes({ customerId, notes }: { customerId: string; notes: NoteRow[] }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const addNote = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text.trim() }),
      });
      setText('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">Notes</h2>
      </div>
      <div className="p-5 space-y-3">
        {notes.map((n) => (
          <div key={n.id} className="text-sm bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-slate-700">{n.note}</p>
            <p className="text-xs text-slate-400 mt-1">{n.staffName} · {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note…" className="focus-ring flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addNote} disabled={busy || !text.trim()} className="focus-ring px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold">Add</button>
        </div>
      </div>
    </div>
  );
}
