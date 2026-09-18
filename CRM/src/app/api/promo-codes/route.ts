import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { data: codes, error: dbError } = await db.from('PromoCode').select('*').order('createdAt', { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { code, discountType, discountValue, validFrom, validUntil, usageLimit } = await request.json();
  if (!code || (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') || typeof discountValue !== 'number') {
    return NextResponse.json({ error: 'code, discountType (PERCENTAGE|FIXED), and discountValue are required' }, { status: 400 });
  }

  const { data: promo, error: dbError } = await db
    .from('PromoCode')
    .insert({
      id: crypto.randomUUID(),
      code: code.toUpperCase(),
      discountType,
      discountValue,
      validFrom: validFrom ? new Date(validFrom).toISOString() : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      usageLimit: usageLimit || null,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ error: `Promo code "${code}" already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: dbError.message || 'Failed to create promo code' }, { status: 500 });
  }
  return NextResponse.json({ promo });
}
