'use client';

import Link from 'next/link';

import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';

export default function ProviderNewOpportunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10">
      <ErrorState
        title="Nem sikerült betölteni az új lehetőség űrlapot"
        description="Ellenőrizd az internetkapcsolatot, majd próbáld újra megnyitni az űrlapot."
        onRetry={reset}
      >
        <Button asChild variant="outline">
          <Link href="/provider/dashboard">Vissza a dashboardra</Link>
        </Button>
      </ErrorState>
      {process.env.NODE_ENV !== 'production' && error?.digest ? (
        <p className="mt-4 text-xs text-slate-500">Hibakód: {error.digest}</p>
      ) : null}
    </div>
  );
}
