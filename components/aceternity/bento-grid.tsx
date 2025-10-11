'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function BentoGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[22rem] gap-6 md:grid-cols-2 xl:grid-cols-3',
        className,
      )}
      {...props}
    />
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  icon,
  children,
}: {
  className?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.7)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.08]',
        className,
      )}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="space-y-4">
        {icon ? <div className="text-indigo-200">{icon}</div> : null}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-200/80">{description}</p>
      </div>
      {children ? <div className="mt-6 text-sm text-slate-300/80">{children}</div> : null}
    </div>
  );
}
