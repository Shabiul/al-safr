import { auth, signOut } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="max-w-2xl mx-auto py-16 px-4 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome, {session?.user?.name}</h1>
      <p className="text-slate-600">
        Admin modules (bookings, staff, markup, promo codes, invoicing, reports) land in later phases.
      </p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
          Log out
        </button>
      </form>
    </main>
  );
}
