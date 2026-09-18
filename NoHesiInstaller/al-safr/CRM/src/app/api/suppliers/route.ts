import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireStaffSession();
  if (error) return error;
  const { data: suppliers, error: dbError } = await db.from('Supplier').select('*').order('createdAt', { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { name, type, contactName, phone, email, commissionPercent, notes } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: 'name and type are required' }, { status: 400 });
  }

  const { data: supplier, error: dbError } = await db
    .from('Supplier')
    .insert({
      id: crypto.randomUUID(),
      name, type,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      commissionPercent: commissionPercent != null && commissionPercent !== '' ? Number(commissionPercent) : null,
      notes: notes || null,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message || 'Failed to create supplier' }, { status: 500 });
  return NextResponse.json({ supplier }, { status: 201 });
}
