import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TourPackage } from '@/services/tourPackageData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: rows, error } = await db
    .from('TourPackage')
    .select('*')
    .eq('published', true)
    .order('createdAt', { ascending: true });

  if (error) {
    return NextResponse.json({ packages: [], error: error.message }, { status: 500 });
  }

  const packages: TourPackage[] = (rows ?? []).map((p) => ({
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
    featured: p.featured ?? false,
    tourType: p.tourType ?? null,
    originalPriceUsd: p.originalPriceUsd ?? null,
  }));

  return NextResponse.json({ packages });
}
