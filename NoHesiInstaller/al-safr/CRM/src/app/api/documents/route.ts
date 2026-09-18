import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';
import { uploadDocument } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { session, error } = await requireStaffSession();
  if (error) return error;

  const form = await request.formData();
  const file = form.get('file');
  const type = form.get('type');
  const customerId = form.get('customerId');
  const bookingId = form.get('bookingId');

  if (!(file instanceof File) || typeof type !== 'string') {
    return NextResponse.json({ error: 'file and type are required' }, { status: 400 });
  }
  if (!customerId && !bookingId) {
    return NextResponse.json({ error: 'customerId or bookingId is required' }, { status: 400 });
  }

  const storagePath = `${customerId || bookingId}/${Date.now()}-${file.name}`;

  try {
    await uploadDocument(storagePath, file);
    const doc = await prisma.document.create({
      data: {
        type: type as any,
        fileName: file.name,
        storagePath,
        customerId: typeof customerId === 'string' ? customerId : null,
        bookingId: typeof bookingId === 'string' ? bookingId : null,
        uploadedBy: session.user?.name ?? 'Staff',
      },
    });
    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to upload document' }, { status: 500 });
  }
}
