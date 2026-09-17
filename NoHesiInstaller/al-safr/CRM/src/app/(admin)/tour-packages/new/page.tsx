import { TourPackageForm } from '@/components/TourPackageForm';

export default function NewTourPackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New tour package</h1>
        <p className="text-slate-500 text-sm mt-1">This will be visible on the public site immediately if published.</p>
      </div>
      <TourPackageForm />
    </div>
  );
}
