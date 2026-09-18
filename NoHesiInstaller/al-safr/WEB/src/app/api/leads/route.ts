import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const { type, name, email, phone, service, destination, message } = body;

  if (type !== 'QUOTE' && type !== 'CONTACT') {
    return NextResponse.json({ error: 'type must be QUOTE or CONTACT' }, { status: 400 });
  }
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const { data: lead, error } = await db
    .from('Lead')
    .insert({ id: crypto.randomUUID(), type, name, email, phone, service, destination, message })
    .select('id')
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: error?.message || 'Failed to submit' }, { status: 500 });
  }
  return NextResponse.json({ id: lead.id });
}
