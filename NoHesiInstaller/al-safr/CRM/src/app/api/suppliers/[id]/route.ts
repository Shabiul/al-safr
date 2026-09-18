import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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
  try {
    const supplier = await prisma.supplier.update({ where: { id }, data: { ...(active !== undefined && { active }) } });
    return NextResponse.json({ supplier });
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ error: err?.message || 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;
  const { id } = await params;
  try {
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    return NextResponse.json({ error: err?.message || 'Failed to delete supplier' }, { status: 500 });
  }
}
