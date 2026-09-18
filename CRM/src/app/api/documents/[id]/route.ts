import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';
import { deleteDocument, getDocumentDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  try {
    const url = await getDocumentDownloadUrl(doc.storagePath);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to sign URL' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  await deleteDocument(doc.storagePath);
  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
