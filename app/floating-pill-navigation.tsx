'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import styles from './floating-pill-navigation.module.css';

const entries = [
  { label: 'HOME', id: 'psd-stage' },
  { label: 'ABOUT', id: 'about' },
  { label: 'WORK', id: 'featured-work-title' },
  { label: 'CONTACT', id: 'contact-connect' },
];

export default function FloatingPillNavigation() {
  const [visible, setVisible] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const navigateRef = useRef<((id: string) => void) | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastY = window.scrollY;
    let accumulated = 0;
    let scrollFrame = 0;
    let navigationFrame = 0;
    let navigating = false;

    const finishNavigation = () => {
      navigating = false;
      lastY = window.scrollY;
      accumulated = 0;
      window.cancelAnimationFrame(navigationFrame);
      navigationFrame = 0;
      if (lastY <= 80) setVisible(false);
    };

    const updateDirection = () => {
      scrollFrame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;
      if (y <= 80) {
        accumulated = 0;
        setVisible(false);
        return;
      }
      if (navigating || !delta) return;
      accumulated = accumulated * delta < 0 ? delta : accumulated + delta;
      if (Math.abs(accumulated) >= 18) {
        setVisible(accumulated < 0);
        accumulated = 0;
      }
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateDirection);
    };
    const onScrollEnd = () => { if (navigating) finishNavigation(); };
    const onUserInput = () => { if (navigating) finishNavigation(); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) onUserInput();
    };

    navigateRef.current = (id) => {
      const target = document.getElementById(id);
      if (!target) return;
      finishNavigation();
      const clearance = (navigationRef.current?.offsetTop ?? 32) + (navigationRef.current?.offsetHeight ?? 64) + 16;
      const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const top = id === 'psd-stage' ? 0 : Math.min(maximum, Math.max(0, target.getBoundingClientRect().top + window.scrollY - clearance));
      navigating = true;
      window.history.replaceState(window.history.state, '', `#${id}`);
      window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      // A local fallback also handles browsers without scrollend support.
      const checkArrival = () => {
        if (!navigating) return;
        if (Math.abs(window.scrollY - top) <= 1) finishNavigation();
        else navigationFrame = window.requestAnimationFrame(checkArrival);
      };
      navigationFrame = window.requestAnimationFrame(checkArrival);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd);
    window.addEventListener('wheel', onUserInput, { passive: true });
    window.addEventListener('touchstart', onUserInput, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      navigateRef.current = null;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('touchstart', onUserInput);
      window.removeEventListener('keydown', onKeyDown);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(navigationFrame);
    };
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !navigateRef.current) return;
    event.preventDefault();
    navigateRef.current(id);
  };

  return (
    <nav ref={navigationRef} className={styles.pill} aria-label="Page navigation" aria-hidden={!visible} inert={!visible} data-visible={visible}>
      {entries.map(({ label, id }) => (
        <a key={id} href={`#${id}`} onClick={(event) => navigate(event, id)}>{label}</a>
      ))}
    </nav>
  );
}
