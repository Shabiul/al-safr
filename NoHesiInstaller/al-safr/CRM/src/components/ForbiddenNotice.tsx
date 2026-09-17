import { ShieldAlert } from 'lucide-react';

export function ForbiddenNotice() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
      <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
      <h1 className="font-semibold text-slate-900">Super Admin access required</h1>
      <p className="text-sm text-slate-500">Ask a Super Admin to grant you access to this page.</p>
    </div>
  );
}
