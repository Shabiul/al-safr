'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface TourPackageRowProps {
  pkg: {
    id: string;
    name: string;
    destination: string;
    priceUsd: number;
    published: boolean;
  };
}

export function TourPackageRow({ pkg }: TourPackageRowProps) {
  const router = useRouter();
  const [published, setPublished] = useState(pkg.published);
  const [isDeleting, setIsDeleting] = useState(false);

  const togglePublished = async () => {
    const next = !published;
    setPublished(next);
    await fetch(`/api/tour-packages/${pkg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: next }),
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${pkg.name}"? This can't be undone.`)) return;
    setIsDeleting(true);
    await fetch(`/api/tour-packages/${pkg.id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
      <div className="min-w-0">
        <div className="font-medium text-slate-900 truncate">{pkg.name}</div>
        <div className="text-sm text-slate-500">{pkg.destination} · ${pkg.priceUsd}</div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={togglePublished}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
            published ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {published ? 'Published' : 'Unpublished'}
        </button>
        <Link href={`/tour-packages/${pkg.id}/edit`} className="text-slate-400 hover:text-brand-700">
          <Pencil className="w-4 h-4" />
        </Link>
        <button onClick={handleDelete} disabled={isDeleting} className="text-slate-400 hover:text-rose-600 disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
