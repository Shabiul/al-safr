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
  const { slug, name, destination, summary, description, durationDays, priceUsd, images, inclusions, exclusions, itinerary, published } = body;

  try {
    const pkg = await prisma.tourPackage.update({
      where: { id },
      data: {
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
      },
    });
    return NextResponse.json({ package: pkg });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: `A package with slug "${slug}" already exists` }, { status: 409 });
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { error } = await requireStaffSession();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.tourPackage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || 'Failed to delete package' }, { status: 500 });
  }
}
