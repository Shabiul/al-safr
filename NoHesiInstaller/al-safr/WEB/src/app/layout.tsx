import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Al-Safr (السفر) | Flights, Live Tracking & Fares',
  description: 'Book flights with real live fares, track aircraft in real time, and follow fare trends — Al-Safr.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        {/* Cabinet Grotesk + Cormorant Garamond — used only by the landing page's
            hero/marketing sections (see LandingHome.tsx), not the rest of the app. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700,800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
