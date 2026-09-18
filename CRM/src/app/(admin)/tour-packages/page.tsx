import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import { TourPackageRow } from '@/components/TourPackageRow';

export const dynamic = 'force-dynamic';

export default async function TourPackagesPage() {
  const { data: packages } = await db.from('TourPackage').select('*').order('createdAt', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tour Packages</h1>
          <p className="text-slate-500 text-sm mt-1">{packages?.length ?? 0} packages in the catalogue.</p>
        </div>
        <Link
          href="/tour-packages/new"
          className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          New package
        </Link>
      </div>

      <div className="card divide-y divide-slate-100">
        {(packages ?? []).map((pkg) => (
          <TourPackageRow key={pkg.id} pkg={{ id: pkg.id, name: pkg.name, destination: pkg.destination, priceUsd: pkg.priceUsd, published: pkg.published }} />
        ))}
      </div>
    </div>
  );
}
