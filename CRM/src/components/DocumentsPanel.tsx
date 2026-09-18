'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Download, Upload } from 'lucide-react';

interface DocumentRow {
  id: string;
  type: string;
  fileName: string;
  uploadedBy: string | null;
  createdAt: string;
}

const TYPES = ['PASSPORT', 'VISA', 'TICKET', 'OTHER'];

export function DocumentsPanel({ customerId, bookingId, documents }: { customerId?: string; bookingId?: string; documents: DocumentRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState('OTHER');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', type);
      if (customerId) form.append('customerId', customerId);
      if (bookingId) form.append('bookingId', bookingId);
      const res = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }
      if (fileRef.current) fileRef.current.value = '';
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`);
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">Documents</h2>
      </div>
      <div className="p-5 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50">
        <select value={type} onChange={(e) => setType(e.target.value)} className="focus-ring border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input ref={fileRef} type="file" className="text-sm" />
        <button onClick={handleUpload} disabled={busy} className="focus-ring flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold">
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </div>
      {documents.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No documents uploaded.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {documents.map((d) => (
            <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{d.fileName}</div>
                  <div className="text-xs text-slate-400">{d.type} · {d.uploadedBy} · {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => handleDownload(d.id)} className="text-slate-400 hover:text-brand-700"><Download className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
