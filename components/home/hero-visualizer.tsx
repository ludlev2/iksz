'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

const TOTAL_HOURS = 50;
const SCROLL_SENSITIVITY = 1600;
const TOUCH_SENSITIVITY = 450;
const LOCK_THRESHOLD_RATIO = 0.35;

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export function HeroVisualizer() {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const lastTouchY = useRef<number | null>(null);
  const lockPositionRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const getLockPosition = () => {
      const element = containerRef.current;
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const threshold = window.innerHeight * LOCK_THRESHOLD_RATIO;
      return Math.max(window.scrollY + rect.top - threshold, 0);
    };

    const shouldLock = (delta: number) => {
      const element = containerRef.current;
      if (!element) {
        return false;
      }

      const rect = element.getBoundingClientRect();
      const threshold = window.innerHeight * LOCK_THRESHOLD_RATIO;
      const current = progressRef.current;

      if (delta > 0) {
        return rect.top <= threshold && current < 1;
      }

      if (delta < 0) {
        return rect.top <= threshold && current > 0;
      }

      return lockPositionRef.current !== null;
    };

    const maintainLock = () => {
      if (lockPositionRef.current !== null) {
        window.scrollTo({ top: lockPositionRef.current });
      }
    };

    const updateProgress = (delta: number, divisor: number) => {
      if (divisor === 0 || delta === 0) {
        return;
      }

      const current = progressRef.current;
      const next = clamp(current + delta / divisor);

      if (next === current) {
        return;
      }

      progressRef.current = next;
      setProgress(next);
    };

    const releaseLockIfComplete = (delta: number) => {
      if (delta > 0 && progressRef.current >= 1) {
        lockPositionRef.current = null;
      } else if (delta < 0 && progressRef.current <= 0) {
        lockPositionRef.current = null;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const delta = event.deltaY;
      const lockActive = lockPositionRef.current !== null;

      if (!lockActive && !shouldLock(delta)) {
        if (lockPositionRef.current !== null && (progressRef.current <= 0 || progressRef.current >= 1)) {
          lockPositionRef.current = null;
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (lockPositionRef.current === null) {
        lockPositionRef.current = getLockPosition();
      }

      maintainLock();
      updateProgress(delta, SCROLL_SENSITIVITY);
      maintainLock();
      releaseLockIfComplete(delta);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        lastTouchY.current = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const currentY = event.touches[0].clientY;

      if (lastTouchY.current === null) {
        lastTouchY.current = currentY;
        return;
      }

      const delta = lastTouchY.current - currentY;
      const lockActive = lockPositionRef.current !== null;

      if (!lockActive && !shouldLock(delta)) {
        lastTouchY.current = currentY;
        return;
      }

      event.preventDefault();

      if (lockPositionRef.current === null) {
        lockPositionRef.current = getLockPosition();
      }

      updateProgress(delta, TOUCH_SENSITIVITY);
      maintainLock();
      releaseLockIfComplete(delta);
      lastTouchY.current = currentY;
    };

    const handleTouchEnd = () => {
      lastTouchY.current = null;
      if (progressRef.current <= 0 || progressRef.current >= 1) {
        lockPositionRef.current = null;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const filledHours = Math.round(progress * TOTAL_HOURS);
  const remainingHours = Math.max(TOTAL_HOURS - filledHours, 0);
  const progressWidth = `${progress * 100}%`;
  const progressPercent = Math.round(progress * 100);

  return (
    <div ref={containerRef} className="relative aspect-[3/4] w-full max-w-lg">
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-sky-300/45 via-indigo-300/35 to-cyan-200/45 blur-3xl" />
      <div className="relative z-10 flex h-full flex-col justify-between rounded-[3rem] border border-white/15 bg-white/[0.14] p-10 shadow-[0_38px_70px_-18px_rgba(6,19,45,0.75)] backdrop-blur">
        <header className="flex items-center justify-between text-sm text-slate-100/85">
          <span className="rounded-full border border-white/20 px-5 py-1.5 text-xs uppercase tracking-[0.35em]">
            Live
          </span>
          <span className="text-base font-semibold tracking-wide text-slate-100">IKSZ Dashboard</span>
        </header>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Következő műszakod</h3>
            <div className="rounded-2xl border border-white/15 bg-white/[0.15] p-5 text-base text-slate-100">
              <p className="flex items-center gap-3 text-white">
                <Sparkles className="h-5 w-5 text-sky-200" />
                Napfény Idősek Otthona
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.35em] text-slate-200/85">
                Október 18. · 17:30–21:00 · 4 óra
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.45em] text-slate-200/80">
              Éves előrehaladás
            </h4>
            <div className="rounded-3xl border border-white/15 bg-white/[0.15] p-6 text-sm sm:text-base">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-200/85">
                <span className="text-slate-100/90">Teljesített órák</span>
                <span className="text-slate-50">
                  {filledHours} / {TOTAL_HOURS}
                </span>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-cyan-300 transition-[width] duration-150 ease-out"
                  style={{ width: progressWidth }}
                />
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs text-slate-200/85">
                <Check className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium text-slate-100">
                  {remainingHours > 0 ? `${remainingHours} óra a cél eléréséig` : 'Minden óra teljesítve 🎉'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.16] p-5 text-sm text-slate-100">
          <span className="text-slate-100/85">IKSZ napló automatikusan frissítve</span>
          <span className="rounded-full bg-indigo-300/40 px-5 py-1.5 text-base font-semibold text-indigo-50">
            {progressPercent}%
          </span>
        </footer>
      </div>
    </div>
  );
}
