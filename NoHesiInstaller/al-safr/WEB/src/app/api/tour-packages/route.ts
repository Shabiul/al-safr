import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TourPackage } from '@/services/tourPackageData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await prisma.tourPackage.findMany({
      where: { published: true },
      orderBy: { createdAt: 'asc' },
    });

    const packages: TourPackage[] = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      destination: p.destination,
      summary: p.summary,
      description: p.description,
      durationDays: p.durationDays,
      priceUsd: p.priceUsd,
      images: p.images,
      inclusions: p.inclusions,
      exclusions: p.exclusions,
      itinerary: p.itinerary as unknown as TourPackage['itinerary'],
    }));

    return NextResponse.json({ packages });
  } catch (err: any) {
    return NextResponse.json({ packages: [], error: err?.message || 'Failed to load tour packages' }, { status: 500 });
  }
}
