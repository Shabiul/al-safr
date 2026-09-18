import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { session, error } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  const currentUserId = (session.user as { id?: string }).id;
  if (id === currentUserId) {
    return NextResponse.json({ error: "You can't deactivate or demote your own account" }, { status: 400 });
  }

  const { active, role } = await request.json();

  const { data: staff, error: dbError } = await db
    .from('StaffUser')
    .update({
      ...(active !== undefined && { active }),
      ...(role !== undefined && { role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF' }),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, email, name, role, active')
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!staff) return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
  return NextResponse.json({ staff });
}
