import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

  const { data: lead, error: dbError } = await db
    .from('Lead')
    .update({
      ...(status !== undefined && { status }),
      ...(followUpAt !== undefined && { followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null }),
      ...(assignedToName !== undefined && { assignedToName }),
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ lead });
}
