import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { code, discountType, discountValue, validFrom, validUntil, usageLimit } = await request.json();
  if (!code || (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') || typeof discountValue !== 'number') {
    return NextResponse.json({ error: 'code, discountType (PERCENTAGE|FIXED), and discountValue are required' }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: usageLimit || null,
      },
    });
    return NextResponse.json({ promo });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: `Promo code "${code}" already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to create promo code' }, { status: 500 });
  }
}
