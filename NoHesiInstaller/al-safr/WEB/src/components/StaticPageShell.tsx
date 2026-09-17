import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface StaticPageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StaticPageShell({ title, subtitle, children }: StaticPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Al-Safr
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
