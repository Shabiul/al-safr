import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { TourPackageForm, TourPackageFormData } from '@/components/TourPackageForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTourPackagePage({ params }: PageProps) {
  const { id } = await params;
  const { data: pkg } = await db.from('TourPackage').select('*').eq('id', id).maybeSingle();
  if (!pkg) notFound();

  const initial: TourPackageFormData = {
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    destination: pkg.destination,
    summary: pkg.summary,
    description: pkg.description,
    durationDays: pkg.durationDays,
    priceUsd: pkg.priceUsd,
    images: pkg.images,
    inclusions: pkg.inclusions,
    exclusions: pkg.exclusions,
    itinerary: pkg.itinerary as unknown as TourPackageFormData['itinerary'],
    published: pkg.published,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit {pkg.name}</h1>
      </div>
      <TourPackageForm initial={initial} />
    </div>
  );
}
