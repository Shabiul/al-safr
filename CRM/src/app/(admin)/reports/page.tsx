import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';

export const dynamic = 'force-dynamic';

const SERVICE_LABELS: Record<string, string> = { FLIGHT: 'Flights', HOTEL: 'Hotels', CAB: 'Cabs', PACKAGE: 'Packages' };

export default async function ReportsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'SUPER_ADMIN') return <ForbiddenNotice />;

  const [bookings, payments, leads, promoCodes] = await Promise.all([
    prisma.booking.findMany({ select: { serviceType: true, amount: true, status: true } }),
    prisma.paymentRecord.findMany({ select: { type: true, amount: true } }),
    prisma.lead.findMany({ select: { status: true } }),
    prisma.promoCode.findMany({ where: { timesUsed: { gt: 0 } }, orderBy: { timesUsed: 'desc' }, select: { code: true, timesUsed: true } }),
  ]);

  const netReceived = payments.reduce((sum, p) => sum + (p.type === 'PAYMENT' ? p.amount : -p.amount), 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
  const revenueByService = (['FLIGHT', 'HOTEL', 'CAB', 'PACKAGE'] as const).map((type) => ({
    type,
    revenue: confirmedBookings.filter((b) => b.serviceType === type).reduce((s, b) => s + b.amount, 0),
  }));
  const maxRevenue = Math.max(1, ...revenueByService.map((r) => r.revenue));

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'WON').length;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Revenue and conversion, computed from real bookings, payments, and leads.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-2xl font-bold text-slate-900">${netReceived.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-0.5">Net received</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold text-slate-900">{bookings.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total bookings</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total leads</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-0.5">Lead → won conversion</div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Confirmed revenue by service</h2>
        <div className="space-y-3">
          {revenueByService.map((r) => (
            <div key={r.type} className="flex items-center gap-3">
              <span className="w-20 text-sm text-slate-600 shrink-0">{SERVICE_LABELS[r.type]}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: `${(r.revenue / maxRevenue) * 100}%` }} />
              </div>
              <span className="w-24 text-right text-sm font-medium text-slate-900 shrink-0">${r.revenue.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Promo code usage</h2>
        </div>
        {promoCodes.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No promo codes have been used yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {promoCodes.map((p) => (
              <div key={p.code} className="px-5 py-3 flex items-center justify-between">
                <span className="font-mono font-semibold text-slate-900">{p.code}</span>
                <span className="text-sm text-slate-500">{p.timesUsed} uses</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
