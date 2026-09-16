import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

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
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
