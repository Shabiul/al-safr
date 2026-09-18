import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;
  const { id } = await params;
  const { active } = await request.json();

  const { data: supplier, error: dbError } = await db
    .from('Supplier')
    .update({ ...(active !== undefined && { active }), updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  return NextResponse.json({ supplier });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;
  const { id } = await params;
  const { error: dbError } = await db.from('Supplier').delete().eq('id', id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
