import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CityProvider } from '@/components/providers/city-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CommerceProvider } from '@/components/providers/commerce-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'APPGRADE — магазин техники в Магнитогорске, Белорецке и Троицке',
  description: 'Смартфоны, ноутбуки, часы, аудио и другая техника. Выгодный Trade-In и магазины APPGRADE в трёх городах.',
  openGraph: {
    title: 'APPGRADE — пора обновиться',
    description: 'Современный магазин техники в Магнитогорске, Белорецке и Троицке.',
    images: ['/og.png'],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'APPGRADE — пора обновиться', description: 'Техника для следующего шага.', images: ['/og.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CityProvider><CommerceProvider><Header />{children}<Footer /></CommerceProvider></CityProvider>
      </body>
    </html>
  );
}
