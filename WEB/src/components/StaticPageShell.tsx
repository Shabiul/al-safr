import { Header } from '@/components/Header';

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
    <div className="min-h-screen bg-cream text-slate-900">
      <Header />

      <main className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 space-y-10`}>
        <div className="space-y-3">
          <span
            className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full soft-border"
            style={{ backgroundColor: 'var(--color-ticket-orange)', color: 'white' }}
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
