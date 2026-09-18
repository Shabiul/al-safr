import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const { data: staff, error: dbError } = await db
    .from('StaffUser')
    .select('id, email, name, role, active, createdAt')
    .order('createdAt', { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
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

  const { data: existing } = await db.from('StaffUser').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: `An account with ${email} already exists` }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { data: staff, error: dbError } = await db
    .from('StaffUser')
    .insert({
      id: crypto.randomUUID(),
      email,
      hashedPassword,
      name,
      role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF',
      updatedAt: new Date().toISOString(),
    })
    .select('id, email, name, role, active')
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ staff });
}
