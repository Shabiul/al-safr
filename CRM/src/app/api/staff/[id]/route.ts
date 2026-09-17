import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

  try {
    const staff = await prisma.staffUser.update({
      where: { id },
      data: {
        ...(active !== undefined && { active }),
        ...(role !== undefined && { role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF' }),
      },
      select: { id: true, email: true, name: true, role: true, active: true },
    });
    return NextResponse.json({ staff });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to update staff account' }, { status: 500 });
  }
}
