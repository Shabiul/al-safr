import { prisma } from '@/lib/db';
import { Mail, Phone, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

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
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {leads.map((lead) => (
            <div key={lead.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{lead.name}</span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      lead.type === 'QUOTE' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {lead.type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  {lead.email && (
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{lead.email}</span>
                  )}
                  {lead.phone && (
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>
                  )}
                  {lead.destination && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{lead.destination}</span>
                  )}
                </div>

                {lead.service && <p className="text-sm text-slate-600">Service: {lead.service}</p>}
                {lead.message && <p className="text-sm text-slate-600">{lead.message}</p>}
              </div>

              <span className="text-xs text-slate-400 shrink-0">
                {lead.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
