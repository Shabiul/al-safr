import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ApiHealthPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'SUPER_ADMIN') return <ForbiddenNotice />;

  const events = await prisma.apiKeyEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  const byKey = new Map<string, number>();
  for (const e of events) byKey.set(e.keyLabel, (byKey.get(e.keyLabel) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">API Health</h1>
        <p className="text-slate-500 text-sm mt-1">RapidAPI key rotation events — each row is a key that hit its quota (429/403) and the app fell back to the next one.</p>
      </div>

      {byKey.size > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Exhaustion count by key</h2>
          <div className="space-y-2">
            {[...byKey.entries()].map(([label, count]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Recent events</h2>
        </div>
        {events.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No key exhaustion events recorded — all keys have healthy quota.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((e) => (
              <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-900">{e.keyLabel}</span>
                  <span className="text-xs text-slate-400">{e.service}</span>
                </div>
                <span className="text-xs text-slate-400">{e.createdAt.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
