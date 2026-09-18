import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

  const { data: promo, error: dbError } = await db
    .from('PromoCode')
    .update({ active, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!promo) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
  return NextResponse.json({ promo });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  const { error: dbError } = await db.from('PromoCode').delete().eq('id', id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
