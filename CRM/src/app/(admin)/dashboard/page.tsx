import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { Inbox, Users, Compass, UserCog, MessageSquare, FileText, CalendarCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  const [customerCount, staffCount, packageCount, quoteCount, contactCount, bookingCount, recentLeads] = await Promise.all([
    prisma.customer.count(),
    prisma.staffUser.count({ where: { active: true } }),
    prisma.tourPackage.count(),
    prisma.lead.count({ where: { type: 'QUOTE' } }),
    prisma.lead.count({ where: { type: 'CONTACT' } }),
    prisma.booking.count(),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const stats = [
    { label: 'Customers', value: customerCount, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Bookings', value: bookingCount, icon: CalendarCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active staff', value: staffCount, icon: UserCog, color: 'text-violet-600 bg-violet-50' },
    { label: 'Tour packages', value: packageCount, icon: Compass, color: 'text-teal-600 bg-teal-50' },
    { label: 'Quote requests', value: quoteCount, icon: FileText, color: 'text-amber-600 bg-amber-50' },
    { label: 'Contact messages', value: contactCount, icon: MessageSquare, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-6 text-white shadow-sm shadow-brand-600/20">
        <h1 className="text-2xl font-semibold">Welcome, {session?.user?.name}</h1>
        <p className="text-brand-100 text-sm mt-1">Here&apos;s what&apos;s happening across Al-Safr right now.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden">
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
              <div key={lead.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
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
