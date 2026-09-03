import type { Metadata } from 'next';
import './globals.css';
import { CityProvider } from '@/components/providers/city-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CommerceProvider } from '@/components/providers/commerce-provider';
import { CityGate } from '@/components/shared/city-gate';
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'APPGRADE — магазин техники в Магнитогорске, Белорецке и Троицке',
  description:
    'Смартфоны, ноутбуки, часы, аудио и другая техника. Выгодный Trade-In и магазины APPGRADE в трёх городах.',
  openGraph: {
    title: 'APPGRADE — пора обновиться',
    description:
      'Современный магазин техники в Магнитогорске, Белорецке и Троицке.',
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
          <CommerceProvider>
             <CityGate />
            <Header />
            {children}
            <Footer />
          </CommerceProvider>
        </CityProvider>
      </body>
    </html>
  );
}
