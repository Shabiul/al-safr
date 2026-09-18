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
  const { slug, name, destination, summary, description, durationDays, priceUsd, images, inclusions, exclusions, itinerary, published } = body;

  const { data: pkg, error: dbError } = await db
    .from('TourPackage')
    .update({
      ...(slug !== undefined && { slug }),
      ...(name !== undefined && { name }),
      ...(destination !== undefined && { destination }),
      ...(summary !== undefined && { summary }),
      ...(description !== undefined && { description }),
      ...(durationDays !== undefined && { durationDays: Number(durationDays) }),
      ...(priceUsd !== undefined && { priceUsd: Number(priceUsd) }),
      ...(images !== undefined && { images }),
      ...(inclusions !== undefined && { inclusions }),
      ...(exclusions !== undefined && { exclusions }),
      ...(itinerary !== undefined && { itinerary }),
      ...(published !== undefined && { published }),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ error: `A package with slug "${slug}" already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
  return NextResponse.json({ package: pkg });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  const { error: dbError } = await db.from('TourPackage').delete().eq('id', id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
