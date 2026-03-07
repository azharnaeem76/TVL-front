import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ClientLayout } from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: {
    default: 'TVL - The Value of Law | According to Spirit Of Law',
    template: '%s | TVL - The Value of Law',
  },
  description:
    'TVL — The Value of Law. Pakistan\'s most comprehensive AI-powered legal research platform. Search case laws from Supreme Court, High Courts, and Federal Shariat Court in English, Urdu, or Roman Urdu. According to Spirit Of Law.',
  keywords: [
    'TVL',
    'The Value of Law',
    'Pakistani law',
    'case law search',
    'legal research Pakistan',
    'Supreme Court Pakistan',
    'High Court judgments',
    'PLD citations',
    'SCMR',
    'CLC',
    'AI legal assistant',
    'Urdu legal search',
    'criminal law Pakistan',
    'family law Pakistan',
    'constitutional law Pakistan',
    'bail procedure Pakistan',
    'khula divorce Pakistan',
    'According to Spirit Of Law',
  ],
  authors: [{ name: 'TVL - The Value of Law' }],
  creator: 'TVL',
  publisher: 'TVL - The Value of Law',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'TVL - The Value of Law',
    title: 'TVL - The Value of Law | According to Spirit Of Law',
    description:
      'Pakistan\'s most comprehensive AI legal research platform. Search case laws in English, Urdu, or Roman Urdu. According to Spirit Of Law.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TVL - The Value of Law',
    description: 'AI-powered legal research. According to Spirit Of Law.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0e1a" />
        <script src="https://accounts.google.com/gsi/client" async defer />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'TVL - The Value of Law',
              description: 'Pakistan\'s most comprehensive AI-powered legal research platform. According to Spirit Of Law.',
              applicationCategory: 'LegalService',
              operatingSystem: 'Web',
              slogan: 'According to Spirit Of Law',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'PKR',
              },
              availableLanguage: ['English', 'Urdu'],
              areaServed: {
                '@type': 'Country',
                name: 'Pakistan',
              },
            }),
          }}
        />
      </head>
      <body className="bg-navy-950">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
