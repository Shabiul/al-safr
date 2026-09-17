import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { MarkupForm } from '@/components/MarkupForm';

export const dynamic = 'force-dynamic';

const SERVICES = ['flights', 'hotels', 'cabs'] as const;

export default async function MarkupPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'SUPER_ADMIN') return <ForbiddenNotice />;

  const rows = await prisma.markupSetting.findMany();
  const bySvc = new Map(rows.map((r) => [r.service, r.percentage]));
  const settings = SERVICES.map((service) => ({ service, percentage: bySvc.get(service) ?? 0 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Markup</h1>
        <p className="text-slate-500 text-sm mt-1">
          Percentage added on top of each service&apos;s live supplier price before it&apos;s shown to customers on the WEB app.
        </p>
      </div>
      <MarkupForm initial={settings} />
    </div>
  );
}
