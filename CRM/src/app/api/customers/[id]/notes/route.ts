import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { session, error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const { note } = await request.json();
  if (!note?.trim()) {
    return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
  }

  try {
    const created = await prisma.customerNote.create({
      data: { customerId: id, note: note.trim(), staffName: session.user?.name ?? 'Staff' },
    });
    return NextResponse.json({ note: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to add note' }, { status: 500 });
  }
}
