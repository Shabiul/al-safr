import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const staff = await prisma.staffUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { email, password, name, role } = await request.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password and name are required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await prisma.staffUser.create({
      data: { email, hashedPassword, name, role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF' },
      select: { id: true, email: true, name: true, role: true, active: true },
    });
    return NextResponse.json({ staff });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: `An account with ${email} already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to create staff account' }, { status: 500 });
  }
}
