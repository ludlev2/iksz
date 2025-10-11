'use client';

import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
}

export default function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = 'Próbáld újra',
  children,
}: ErrorStateProps) {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? (
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          ) : null}
        </div>
        {(onRetry || children) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onRetry ? (
              <Button onClick={onRetry} variant="default">
                {retryLabel}
              </Button>
            ) : null}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
