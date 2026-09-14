import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NON-KABOB CRM – Boshqaruv Tizimi',
  description:
    "NON-KABOB milliy fast-food brendi uchun zamonaviy CRM tizimi. Buyurtmalar, mijozlar va filiallarni boshqaring.",
  keywords: ['NON-KABOB', 'CRM', 'fast food', 'Toshkent', 'boshqaruv'],
  authors: [{ name: 'NON-KABOB Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-[#0A0A0A] text-white antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
