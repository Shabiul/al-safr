import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { data: packages, error: dbError } = await db.from('TourPackage').select('*').order('createdAt', { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const body = await request.json();
  const { slug, name, destination, summary, description, durationDays, priceUsd, images, inclusions, exclusions, itinerary, published } = body;

  if (!slug || !name || !destination) {
    return NextResponse.json({ error: 'slug, name and destination are required' }, { status: 400 });
  }

  const { data: pkg, error: dbError } = await db
    .from('TourPackage')
    .insert({
      id: crypto.randomUUID(),
      slug,
      name,
      destination,
      summary: summary || '',
      description: description || '',
      durationDays: Number(durationDays) || 1,
      priceUsd: Number(priceUsd) || 0,
      images: images || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      itinerary: itinerary || [],
      published: published ?? true,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ error: `A package with slug "${slug}" already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: dbError.message || 'Failed to create package' }, { status: 500 });
  }
  return NextResponse.json({ package: pkg });
}
