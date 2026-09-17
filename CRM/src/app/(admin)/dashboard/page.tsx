import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { Inbox, Users, Compass, UserCog, MessageSquare, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  const [customerCount, staffCount, packageCount, quoteCount, contactCount, recentLeads] = await Promise.all([
    prisma.customer.count(),
    prisma.staffUser.count({ where: { active: true } }),
    prisma.tourPackage.count(),
    prisma.lead.count({ where: { type: 'QUOTE' } }),
    prisma.lead.count({ where: { type: 'CONTACT' } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const stats = [
    { label: 'Customers', value: customerCount, icon: Users },
    { label: 'Active staff', value: staffCount, icon: UserCog },
    { label: 'Tour packages', value: packageCount, icon: Compass },
    { label: 'Quote requests', value: quoteCount, icon: FileText },
    { label: 'Contact messages', value: contactCount, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {session?.user?.name}</h1>
        <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening across Al-Safr right now.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <Icon className="w-5 h-5 text-brand-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-brand-600" />
            Recent leads
          </h2>
          <a href="/leads" className="text-sm text-brand-700 font-medium hover:underline">View all</a>
        </div>
        {recentLeads.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No leads yet — submissions from the Contact and Get a Quote forms will show up here.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{lead.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {lead.service || lead.message || '—'}
                    {lead.destination ? ` · ${lead.destination}` : ''}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${
                    lead.type === 'QUOTE' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {lead.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
