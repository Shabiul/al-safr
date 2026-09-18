import { db } from '@/lib/db';
import { LeadCard } from '@/components/LeadCard';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const { data: leads } = await db.from('Lead').select('*').order('createdAt', { ascending: false });
  const { data: notes } = await db.from('LeadNote').select('*').order('createdAt', { ascending: false });

  const notesByLead = new Map<string, typeof notes>();
  for (const n of notes ?? []) {
    const list = notesByLead.get(n.leadId) ?? [];
    list.push(n);
    notesByLead.set(n.leadId, list);
  }

  const rows = leads ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
        <p className="text-slate-500 text-sm mt-1">
          {rows.length} {rows.length === 1 ? 'submission' : 'submissions'} from the Contact and Get a Quote forms.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">No leads yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {rows.map((lead) => (
            <LeadCard key={lead.id} lead={{ ...lead, notes: notesByLead.get(lead.id) ?? [] }} />
          ))}
        </div>
      )}
    </div>
  );
}
