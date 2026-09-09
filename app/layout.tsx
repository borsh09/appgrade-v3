import type { Metadata } from 'next';
import './globals.css';
import { CityProvider } from '@/components/providers/city-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CommerceProvider } from '@/components/providers/commerce-provider';
import { CityGate } from '@/components/shared/city-gate';
import { PriceProvider } from '@/components/providers/price-provider';
import { siteUrl, isPublicSite } from '@/config/site';

export const metadata: Metadata = {
  robots: isPublicSite ? { index: true, follow: true } : { index: false, follow: false },
  metadataBase: new URL(siteUrl),
  title: 'APPGRADE — техника в Магнитогорске, Белорецке, Троицке и Сибае',
  description:
    'Смартфоны, ноутбуки, часы, аудио и другая техника. Выгодный Trade-In. APPGRADE — Магнитогорск, Белорецк, Троицк и Сибай.',
  openGraph: {
    title: 'APPGRADE — пора обновиться',
    description:
      'APPGRADE — техника в Магнитогорске, Белорецке, Троицке и Сибае.',
    images: ['/og.png'],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APPGRADE — пора обновиться',
    description: 'Техника для следующего шага.',
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
        <CityProvider>
          <PriceProvider>
          <CommerceProvider>
             <CityGate />
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
