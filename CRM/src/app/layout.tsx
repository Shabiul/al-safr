import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Al-Safr CRM',
  description: 'Internal admin panel for Al-Safr Tours N Travels staff.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
