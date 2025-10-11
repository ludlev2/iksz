'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface HeroHighlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HeroHighlight({ className, children, ...props }: HeroHighlightProps) {
  return (
    <div
      className={cn(
        'group relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center overflow-hidden rounded-[40px] border border-white/10 bg-white/5 px-6 py-24 text-center shadow-[0_35px_120px_-25px_rgba(59,130,246,0.45)] backdrop-blur',
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl transition duration-500 group-hover:bg-blue-400/30" />
        <div className="absolute inset-x-10 bottom-[-160px] h-[380px] rounded-full bg-purple-500/20 blur-3xl transition duration-500 group-hover:bg-purple-400/30" />
        <div className="absolute left-8 top-20 h-40 w-40 rounded-full bg-cyan-400/30 blur-2xl" />
        <div className="absolute right-8 top-28 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">{children}</div>
    </div>
  );
}

export function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-200',
        className,
      )}
    >
      {children}
    </span>
  );
}
