import type { Metadata } from 'next';
import './globals.css';
import { CityProvider } from '@/components/providers/city-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CommerceProvider } from '@/components/providers/commerce-provider';
import { CityGate } from '@/components/shared/city-gate';
import { PriceProvider } from '@/components/providers/price-provider';
import { siteUrl, isPublicSite } from '@/config/site';
import { homeTitle, homeDescription, siteStructuredData } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { Monitoring } from '@/components/providers/monitoring';

export const metadata: Metadata = {
  robots: isPublicSite ? { index: true, follow: true } : { index: false, follow: false },
  metadataBase: new URL(siteUrl),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.YANDEX_SITE_VERIFICATION || undefined,
  },
  title: homeTitle,
  description: homeDescription,
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    images: ['/og.png'],
    locale: 'ru_RU',
    siteName: 'APPGRADE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APPGRADE — пора обновиться',
    description: homeDescription,
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <JsonLd data={siteStructuredData()} />
        <CityProvider>
          <PriceProvider>
          <CommerceProvider>
             <CityGate />
             <Monitoring />
            <Header />
            {children}
            <Footer />
          </CommerceProvider>
          </PriceProvider>
        </CityProvider>
      </body>
    </html>
  );
}
