import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

  try {
    const lead = await prisma.lead.create({
      data: { type, name, email, phone, service, destination, message },
    });
    return NextResponse.json({ id: lead.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to submit' }, { status: 500 });
  }
}
