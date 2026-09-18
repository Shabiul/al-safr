'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface LeadNoteRow {
  id: string;
  note: string;
  staffName: string;
  createdAt: string;
}

interface LeadRow {
  id: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  destination: string | null;
  service: string | null;
  message: string | null;
  status: string;
  followUpAt: string | null;
  createdAt: string;
  notes: LeadNoteRow[];
}

const STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'];

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-amber-50 text-amber-700',
  QUOTED: 'bg-violet-50 text-violet-700',
  WON: 'bg-emerald-50 text-emerald-700',
  LOST: 'bg-slate-100 text-slate-500',
};

export function LeadCard({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [followUpAt, setFollowUpAt] = useState(lead.followUpAt ? lead.followUpAt.slice(0, 10) : '');
  const [noteText, setNoteText] = useState('');
  const [busy, setBusy] = useState(false);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText.trim() }),
      });
      setNoteText('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-5 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{lead.name}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${lead.type === 'QUOTE' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
              {lead.type}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{lead.email}</span>}
            {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
            {lead.destination && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{lead.destination}</span>}
          </div>
          {lead.service && <p className="text-sm text-slate-600">Service: {lead.service}</p>}
          {lead.message && <p className="text-sm text-slate-600">{lead.message}</p>}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs text-slate-400">
            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <select
            value={status}
            disabled={busy}
            onChange={(e) => {
              setStatus(e.target.value);
              patch({ status: e.target.value });
            }}
            className={`focus-ring text-xs font-semibold px-2.5 py-1 rounded-full border-0 disabled:opacity-50 ${STATUS_COLORS[status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          Follow up:
          <input
            type="date"
            value={followUpAt}
            disabled={busy}
            onChange={(e) => {
              setFollowUpAt(e.target.value);
              patch({ followUpAt: e.target.value || null });
            }}
            className="focus-ring border border-slate-200 rounded-lg px-2 py-1 text-xs"
          />
        </label>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
        >
          {lead.notes.length} {lead.notes.length === 1 ? 'note' : 'notes'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {lead.notes.map((n) => (
            <div key={n.id} className="text-sm bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-slate-700">{n.note}</p>
              <p className="text-xs text-slate-400 mt-1">{n.staffName} · {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note…"
              className="focus-ring flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              onClick={addNote}
              disabled={busy || !noteText.trim()}
              className="focus-ring px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
