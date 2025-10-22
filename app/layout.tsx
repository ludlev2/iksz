import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { OpportunityProvider } from '@/contexts/OpportunityContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IKSZ Finder - Közösségi szolgálat keresés',
  description: 'Találj közösségi szolgálat lehetőségeket és teljesítsd az 50 órás IKSZ kötelezettségedet.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className={inter.className}>
        <AuthProvider initialSession={null}>
          <OpportunityProvider>
            {children}
            <Toaster />
          </OpportunityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
