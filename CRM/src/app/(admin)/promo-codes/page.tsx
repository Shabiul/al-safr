import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { NewPromoCodeForm } from '@/components/NewPromoCodeForm';
import { PromoCodeTable } from '@/components/PromoCodeTable';

export const dynamic = 'force-dynamic';

export default async function PromoCodesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'SUPER_ADMIN') return <ForbiddenNotice />;

  const { data: codes } = await db.from('PromoCode').select('*').order('createdAt', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Promo Codes</h1>
        <p className="text-slate-500 text-sm mt-1">
          Management only for now — there&apos;s no checkout yet for a code to be redeemed against.
        </p>
      </div>

      <NewPromoCodeForm />
      <PromoCodeTable codes={codes ?? []} />
    </div>
  );
}
