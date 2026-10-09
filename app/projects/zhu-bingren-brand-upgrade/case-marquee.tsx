'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './case.module.css';

// Same repeated-track / linear animation mechanism as the homepage, scoped to this demo.
export default function CaseMarquee({ text, large = false }: { text: string; large?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = true;
    let animation: Animation | undefined;
    const start = async () => {
      await document.fonts.ready;
      if (!active) return;
      animation?.cancel();
      const copy = track.firstElementChild as HTMLElement;
      const period = copy.getBoundingClientRect().width;
      if (!period) return;
      setCopies(Math.max(3, Math.ceil(viewport.clientWidth / period) + 2));
      if (reduced.matches) return;
      animation = track.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(${-period}px)` }],
        { duration: period / 90 * 1000, iterations: Infinity, easing: 'linear' },
      );
    };
    const observer = new ResizeObserver(() => { void start(); });
    observer.observe(viewport);
    reduced.addEventListener('change', start);
    return () => {
      active = false;
      observer.disconnect();
      animation?.cancel();
      reduced.removeEventListener('change', start);
    };
  }, [text]);

  return (
    <div ref={viewportRef} className={`${styles.marquee} ${large ? styles.largeMarquee : styles.smallMarquee}`} role="img" aria-label={text}>
      <div ref={trackRef} className={styles.marqueeTrack} aria-hidden="true">
        {Array.from({ length: copies }, (_, index) => <span className={styles.marqueeCopy} key={index}>{text}</span>)}
      </div>
    </div>
  );
}
