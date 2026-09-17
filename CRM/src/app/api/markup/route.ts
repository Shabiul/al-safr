import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const SERVICES = ['flights', 'hotels', 'cabs'] as const;

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const rows = await prisma.markupSetting.findMany();
  const bySvc = new Map(rows.map((r) => [r.service, r.percentage]));
  const settings = SERVICES.map((service) => ({ service, percentage: bySvc.get(service) ?? 0 }));

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { service, percentage } = await request.json();
  if (!SERVICES.includes(service)) {
    return NextResponse.json({ error: `service must be one of ${SERVICES.join(', ')}` }, { status: 400 });
  }
  if (typeof percentage !== 'number' || percentage < 0 || percentage > 500) {
    return NextResponse.json({ error: 'percentage must be a number between 0 and 500' }, { status: 400 });
  }

  const setting = await prisma.markupSetting.upsert({
    where: { service },
    update: { percentage },
    create: { service, percentage },
  });

  return NextResponse.json({ setting });
}
