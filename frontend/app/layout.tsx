import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'WeFarm — Discover Fresh Nursery Plants Near You',
  description:
    'Find nearby nurseries with fresh vegetable seedlings. Connect directly with sellers. No middlemen, no payments — just real-time plant discovery.',
  keywords: [
    'nursery',
    'plants',
    'seedlings',
    'vegetables',
    'farming',
    'agriculture',
    'nearby nursery',
    'plant discovery',
  ],
  openGraph: {
    title: 'WeFarm — Discover Fresh Nursery Plants Near You',
    description:
      'Real-time nursery discovery platform for farmers and plant lovers.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <LanguageProvider>
            <main className="max-w-lg mx-auto relative">{children}</main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
