import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { OpportunityProvider } from '@/contexts/OpportunityContext';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/utils/supabase/server';

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
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="hu">
      <body className={inter.className}>
        <AuthProvider initialSession={session}>
          <OpportunityProvider>
            {children}
            <Toaster />
          </OpportunityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
