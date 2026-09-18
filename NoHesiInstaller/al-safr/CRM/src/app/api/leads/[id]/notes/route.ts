import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

  const { data: created, error: dbError } = await db
    .from('LeadNote')
    .insert({ id: crypto.randomUUID(), leadId: id, note: note.trim(), staffName: session.user?.name ?? 'Staff' })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message || 'Failed to add note' }, { status: 500 });
  return NextResponse.json({ note: created }, { status: 201 });
}
