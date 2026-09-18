'use client';

import { useEffect, useRef, useState } from 'react';

// Animates "10,000+" -> counts 0 to 10000, then re-appends the "+" suffix.
// Runs once, the first time the stat scrolls into view.
export function CountUpStat({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value.replace(/[\d,]+/, '0'));
  const hasRun = useRef(false);

  useEffect(() => {
    const match = value.match(/^([\d,]+)(.*)$/);
    const el = ref.current;
    if (!match || !el) return;

    const numeric = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = match[2];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(`${Math.round(numeric * eased).toLocaleString('en-IN')}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
