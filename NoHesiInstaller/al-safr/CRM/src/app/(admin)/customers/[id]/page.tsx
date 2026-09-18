import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';
import { CustomerNotes } from '@/components/CustomerNotes';
import { DocumentsPanel } from '@/components/DocumentsPanel';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: customer } = await db.from('Customer').select('*').eq('id', id).maybeSingle();
  if (!customer) notFound();

  const [{ data: bookings }, { data: notes }, { data: documents }, { data: leads }] = await Promise.all([
    // Bookings created from the CRM store the customer's contact details as
    // free text and rarely have customerId set (there's no customer picker
    // in the booking form yet), so match by email too or this always shows
    // zero bookings for customers who have real ones.
    db.from('Booking').select('*').or(`customerId.eq.${id},customerEmail.eq.${customer.email}`).order('createdAt', { ascending: false }),
    db.from('CustomerNote').select('*').eq('customerId', id).order('createdAt', { ascending: false }),
    db.from('Document').select('*').eq('customerId', id).order('createdAt', { ascending: false }),
    db.from('Lead').select('*').eq('email', customer.email).order('createdAt', { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{customer.name}</h1>
        <p className="text-slate-500 text-sm mt-1">{customer.email}</p>
        <p className="text-xs text-slate-400 mt-1">Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Bookings ({bookings?.length ?? 0})</h2>
        </div>
        {!bookings || bookings.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-900">{b.serviceType} · ${b.amount.toFixed(2)}</span>
                <span className="text-xs text-slate-400">{b.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Leads ({leads?.length ?? 0})</h2>
        </div>
        {!leads || leads.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No matching leads by email.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {leads.map((l) => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-900">{l.type} · {l.service || l.destination || '—'}</span>
                <span className="text-xs text-slate-400">{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerNotes customerId={customer.id} notes={notes ?? []} />

      <DocumentsPanel customerId={customer.id} documents={documents ?? []} />
    </div>
  );
}
