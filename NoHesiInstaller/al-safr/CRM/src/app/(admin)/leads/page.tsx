import { prisma } from '@/lib/db';
import { LeadCard } from '@/components/LeadCard';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { notes: { orderBy: { createdAt: 'desc' } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
        <p className="text-slate-500 text-sm mt-1">
          {leads.length} {leads.length === 1 ? 'submission' : 'submissions'} from the Contact and Get a Quote forms.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">No leads yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={{
                ...lead,
                createdAt: lead.createdAt.toISOString(),
                followUpAt: lead.followUpAt ? lead.followUpAt.toISOString() : null,
                notes: lead.notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
