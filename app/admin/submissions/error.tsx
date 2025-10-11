'use client';

import Link from 'next/link';

import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';

export default function AdminSubmissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10">
      <ErrorState
        title="Nem sikerült betölteni a beküldések listáját"
        description="Frissítsd az oldalt, vagy térj vissza az admin kezdőlapra, és próbáld meg újra."
        onRetry={reset}
      >
        <Button asChild variant="outline">
          <Link href="/admin/submissions">Lista frissítése</Link>
        </Button>
      </ErrorState>
      {process.env.NODE_ENV !== 'production' && error?.digest ? (
        <p className="mt-4 text-xs text-slate-500">Hibakód: {error.digest}</p>
      ) : null}
    </div>
  );
}
