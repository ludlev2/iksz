'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  quote: string;
  name: string;
  role: string;
}

interface InfiniteMovingCardsProps {
  items: CardProps[];
  orientation?: 'horizontal' | 'vertical';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const speedMap = {
  slow: 100,
  normal: 75,
  fast: 50,
};

export function InfiniteMovingCards({
  items,
  orientation = 'horizontal',
  speed = 'normal',
  className,
}: InfiniteMovingCardsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const [start, setStart] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;

    if (!container || !scroller) return;

    const animation = scroller.animate(
      [
        orientation === 'horizontal'
          ? { transform: 'translateX(0)' }
          : { transform: 'translateY(0)' },
        orientation === 'horizontal'
          ? { transform: 'translateX(-50%)' }
          : { transform: 'translateY(-50%)' },
      ],
      {
        duration: speedMap[speed] * 1000,
        iterations: Infinity,
        easing: 'linear',
      },
    );

    setStart(true);

    return () => animation.cancel();
  }, [orientation, speed]);

  const cards = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-1',
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          !start && 'opacity-0',
        )}
      >
        {cards.map((item, index) => (
          <Card key={`${item.name}-${index}`} {...item} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 via-slate-950/60 to-transparent" />
    </div>
  );
}

function Card({ quote, name, role }: CardProps) {
  return (
    <div className="relative flex h-full w-[320px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-[0_15px_40px_-20px_rgba(15,23,42,0.65)] backdrop-blur">
      <p className="text-sm text-slate-200/85">“{quote}”</p>
      <div className="mt-6 text-sm text-slate-200/70">
        <div className="text-white">{name}</div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{role}</div>
      </div>
    </div>
  );
}
