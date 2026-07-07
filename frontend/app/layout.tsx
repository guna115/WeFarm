import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import PushNotificationProvider from '@/components/providers/PushNotificationProvider';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://wefarm.live'),
  title: 'WeFarm - Find Nursery Plants Near You',
  description: 'Find tomato, chilli, brinjal, cauliflower and other nursery seedlings from nearby nurseries across India.',
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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'WeFarm - Find Nursery Plants Near You',
    description: 'Find tomato, chilli, brinjal, cauliflower and other nursery seedlings from nearby nurseries across India.',
    url: 'https://wefarm.live',
    siteName: 'WeFarm',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeFarm - Find Nursery Plants Near You',
    description: 'Find tomato, chilli, brinjal, cauliflower and other nursery seedlings from nearby nurseries across India.',
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
            <PushNotificationProvider>
              <main className="w-full relative">{children}</main>
            </PushNotificationProvider>
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
