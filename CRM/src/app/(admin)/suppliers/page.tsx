import { prisma } from '@/lib/db';
import { NewSupplierForm } from '@/components/NewSupplierForm';
import { SupplierTable } from '@/components/SupplierTable';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Suppliers</h1>
        <p className="text-slate-500 text-sm mt-1">Hotels, cab operators, and tour vendors you work with directly.</p>
      </div>
      <NewSupplierForm />
      <SupplierTable suppliers={suppliers} />
    </div>
  );
}
