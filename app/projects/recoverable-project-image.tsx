'use client';

import Image, { type ImageProps } from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

// Mounted only for artwork images. A new lazy image is created only after failure.
export default function RecoverableProjectImage(props: ImageProps) {
  const [attempt, setAttempt] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const statusRef = useRef<'loading' | 'ready' | 'failed'>('loading');
  const attemptsRef = useRef(1);
  const retryAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  const recover = useCallback(() => {
    if (!mountedRef.current || statusRef.current !== 'failed' || attemptsRef.current >= 3 || timerRef.current || !navigator.onLine) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current || statusRef.current !== 'failed' || !navigator.onLine) return;
      statusRef.current = 'loading';
      attemptsRef.current += 1;
      setAttempt((previous) => previous + 1);
    }, Math.max(0, retryAtRef.current - Date.now()));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    window.addEventListener('online', recover);
    // Covers an error dispatched before the effect was installed.
    recover();
    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', recover);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [recover]);

  return <Image
    {...props}
    alt={props.alt}
    key={attempt}
    ref={imageRef}
    onLoad={(event) => {
      if (event.currentTarget !== imageRef.current) return;
      statusRef.current = 'ready';
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    }}
    onError={(event) => {
      if (event.currentTarget !== imageRef.current || statusRef.current === 'failed') return;
      statusRef.current = 'failed';
      retryAtRef.current = Date.now() + (attemptsRef.current === 1 ? 1500 : 5000);
      recover();
    }}
  />;
}
