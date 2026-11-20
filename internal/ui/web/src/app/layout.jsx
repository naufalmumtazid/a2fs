import { Suspense } from 'react';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import MarketProvider from '@/context/MarketProvider';
import AppShell from '@/components/AppShell';

const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex' });

export const metadata = { title: 'IDX Terminal', description: 'Stock market terminal UI (dummy data)' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plex.variable}>
      <body>
        <MarketProvider>
          <Suspense fallback={<div className="h-full">{children}</div>}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </MarketProvider>
      </body>
    </html>
  );
}
