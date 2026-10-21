import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Way Kanan Agro-Commerce — Pasar Digital Agribisnis Way Kanan',
  description:
    'Katalog komoditas unggulan Kabupaten Way Kanan (Singkong, Kopi Robusta, Karet, Padi, Jagung). Hubungi langsung kelompok tani dan pengurus Gapoktan terverifikasi via WhatsApp.',
  keywords: ['Way Kanan', 'Agro-Commerce', 'Gapoktan', 'Singkong', 'Kopi Robusta', 'Karet', 'Padi', 'Jagung', 'Lampung'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
