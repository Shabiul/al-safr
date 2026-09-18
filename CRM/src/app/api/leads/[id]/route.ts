import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { status, followUpAt, assignedToName } = body;

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(followUpAt !== undefined && { followUpAt: followUpAt ? new Date(followUpAt) : null }),
        ...(assignedToName !== undefined && { assignedToName }),
      },
    });
    return NextResponse.json({ lead });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to update lead' }, { status: 500 });
  }
}
