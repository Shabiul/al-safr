import { ShieldAlert } from 'lucide-react';

export function ForbiddenNotice() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-1">
        <ShieldAlert className="w-7 h-7 text-rose-400" />
      </div>
      <h1 className="font-semibold text-slate-900">Super Admin access required</h1>
      <p className="text-sm text-slate-500">Ask a Super Admin to grant you access to this page.</p>
    </div>
  );
}
