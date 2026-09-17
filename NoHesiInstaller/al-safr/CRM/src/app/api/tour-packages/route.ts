import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaffSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireStaffSession();
  if (error) return error;

  const packages = await prisma.tourPackage.findMany({ orderBy: { createdAt: 'desc' } });
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

  try {
    const pkg = await prisma.tourPackage.create({
      data: {
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
      },
    });
    return NextResponse.json({ package: pkg });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: `A package with slug "${slug}" already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to create package' }, { status: 500 });
  }
}
