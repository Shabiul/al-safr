import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = (session.user as { role?: string }).role ?? 'STAFF';

  async function handleLogout() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar staffName={session.user.name ?? 'Staff'} role={role} onLogout={handleLogout} />
      <main className="flex-1 min-w-0 p-6 sm:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
