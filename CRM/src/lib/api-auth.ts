import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// proxy.ts (the CRM's route-protection layer) explicitly excludes /api from
// its matcher, so every API route must check the session itself.
export async function requireStaffSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null as null };
}

export async function requireSuperAdminSession() {
  const { session, error } = await requireStaffSession();
  if (error) return { session: null, error };
  if ((session.user as { role?: string }).role !== 'SUPER_ADMIN') {
    return { session: null, error: NextResponse.json({ error: 'Forbidden — SUPER_ADMIN only' }, { status: 403 }) };
  }
  return { session, error: null as null };
}
