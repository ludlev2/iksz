'use client';

import Link from 'next/link';

import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';

export default function AdminAreaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10">
      <ErrorState
        title="Nem sikerült betölteni az admin felületet"
        description="Ellenőrizd, hogy rendelkezésre áll-e a szükséges jogosultság, majd próbáld meg újra."
        onRetry={reset}
      >
        <Button asChild variant="outline">
          <Link href="/">Főoldal</Link>
        </Button>
      </ErrorState>
      {process.env.NODE_ENV !== 'production' && error?.digest ? (
        <p className="mt-4 text-xs text-slate-500">Hibakód: {error.digest}</p>
      ) : null}
    </div>
  );
}
