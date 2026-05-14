'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  target: number;
  format?: 'plain' | 'comma';
  durationMs?: number;
  className?: string;
}

function fmt(n: number, format: 'plain' | 'comma'): string {
  const v = Math.round(n);
  return format === 'comma' ? v.toLocaleString('en-IN') : v.toString();
}

export default function AnimatedCounter({ target, format = 'plain', durationMs = 1800, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setValue(fmt(target, format));
      return;
    }

    let rafId = 0;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(fmt(target * eased, format));
            if (progress < 1) rafId = requestAnimationFrame(tick);
            else setValue(fmt(target, format));
          };
          rafId = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [target, format, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
