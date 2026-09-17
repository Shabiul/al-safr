import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  const { active } = await request.json();

  try {
    const promo = await prisma.promoCode.update({ where: { id }, data: { active } });
    return NextResponse.json({ promo });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to update promo code' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to delete promo code' }, { status: 500 });
  }
}
