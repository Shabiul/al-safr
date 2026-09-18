import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireStaffSession();
  if (error) return error;
  const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { name, type, contactName, phone, email, commissionPercent, notes } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: 'name and type are required' }, { status: 400 });
  }

  try {
    const supplier = await prisma.supplier.create({
      data: {
        name, type,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        commissionPercent: commissionPercent != null && commissionPercent !== '' ? Number(commissionPercent) : null,
        notes: notes || null,
      },
    });
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create supplier' }, { status: 500 });
  }
}
