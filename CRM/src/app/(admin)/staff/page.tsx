import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { StaffTable } from '@/components/StaffTable';
import { NewStaffForm } from '@/components/NewStaffForm';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'SUPER_ADMIN') return <ForbiddenNotice />;

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const { data: staff } = await db
    .from('StaffUser')
    .select('id, email, name, role, active, createdAt')
    .order('createdAt', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Staff</h1>
        <p className="text-slate-500 text-sm mt-1">{staff?.length ?? 0} staff accounts.</p>
      </div>

      <NewStaffForm />

      <StaffTable staff={staff ?? []} currentUserId={currentUserId} />
    </div>
  );
}
