import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface StaticPageShellProps {
  title: string;
  subtitle?: string;
  /** Widens the page from max-w-3xl to max-w-5xl for content-heavy pages
   * (multi-column layouts, image banners) — narrow (default) suits plain
   * prose pages like Privacy Policy or Terms. */
  wide?: boolean;
  children: React.ReactNode;
}

export function StaticPageShell({ title, subtitle, wide, children }: StaticPageShellProps) {
  const maxWidth = wide ? 'max-w-5xl' : 'max-w-3xl';
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 w-full bg-white border-b-[3px]" style={{ borderColor: 'var(--color-ink)' }}>
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3`}>
          <Link
            href="/"
            className="focus-ring max-press inline-flex items-center gap-2 text-sm font-black px-3 py-1.5 rounded-lg max-border"
            style={{ backgroundColor: 'var(--color-max-yellow)', color: 'var(--color-ink)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Al-Safr
          </Link>
        </div>
      </header>

      <main className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10`}>
        <div className="space-y-3">
          <span
            className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full max-border -rotate-2"
            style={{ backgroundColor: 'var(--color-max-orange)', color: 'white' }}
          >
            Al-Safr
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
