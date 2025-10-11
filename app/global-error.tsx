'use client';

import Link from 'next/link';

import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="hu">
      <body className="min-h-screen bg-gray-100">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
          <ErrorState
            title="Váratlan hiba történt"
            description="Sajnáljuk, valami elromlott. Próbáld meg frissíteni az oldalt, vagy térj vissza a főoldalra."
            onRetry={reset}
          >
            <Button asChild variant="outline">
              <Link href="/">Vissza a főoldalra</Link>
            </Button>
          </ErrorState>
          {process.env.NODE_ENV !== 'production' && error?.digest ? (
            <p className="mt-6 text-xs text-slate-500">Hibakód: {error.digest}</p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
