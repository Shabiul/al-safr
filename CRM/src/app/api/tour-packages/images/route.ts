import { NextResponse } from 'next/server';
import { requireStaffSession } from '@/lib/api-auth';
import { uploadPackageImage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  try {
    const url = await uploadPackageImage(path, file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
