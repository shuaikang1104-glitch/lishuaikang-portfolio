'use client';

import { useEffect } from 'react';

// Independent background interaction; existing parallax and entrance controllers are untouched.
export default function LocalSpotlights() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};

    const configure = () => {
      dispose();
      if (!finePointer.matches || reducedMotion.matches) return;
      const cleanups: (() => void)[] = [];

      const attach = (area: HTMLElement, panels: HTMLElement[], glyphs: HTMLElement[], hero: boolean, continuationPanels: HTMLElement[] = []) => {
        const layers = panels.map((panel) => {
          const layer = document.createElement('div');
          layer.className = `local-spotlight local-spotlight--${hero ? 'hero' : 'context'}`;
          layer.setAttribute('aria-hidden', 'true');
          panel.prepend(layer);
          return layer;
        });
        const continuationLayers = continuationPanels.map((panel) => {
          const layer = document.createElement('div');
          layer.className = 'local-spotlight local-spotlight--hero-continuation';
          layer.setAttribute('aria-hidden', 'true');
          panel.prepend(layer);
          return layer;
        });
        glyphs.forEach((glyph) => glyph.setAttribute('data-local-light', ''));
        const targets = [...layers, ...glyphs];
        let bounds: DOMRect[] = [];
        let scales: number[] = [];
        let panelBounds: DOMRect[] = [];
        let cornerRadii: number[] = [];
        let x = 0;
        let y = 0;
        let strength = 0;
        let wantedStrength = 0;
        let pointerInsideArea = false;
        let frame = 0;
        let continuationBounds: DOMRect[] = [];
        let continuationScales: number[] = [];
        let continuationStrength = 0;
        let wantedContinuationStrength = 0;

        const measure = () => {
          continuationBounds = continuationLayers.map((layer) => layer.getBoundingClientRect());
          continuationScales = continuationLayers.map((layer, index) => continuationBounds[index].width / layer.offsetWidth || 1);
          panelBounds = panels.map((panel) => panel.getBoundingClientRect());
          cornerRadii = panels.map((panel, index) => 120 * panelBounds[index].width / panel.offsetWidth);
          bounds = targets.map((target) => target.getBoundingClientRect());
          scales = targets.map((target, index) => bounds[index].width / target.offsetWidth || 1);
          // Bright glyph overlays also stay clear of the frozen marquee bands.
          if (hero) {
            const visual = area.querySelector<HTMLElement>('.hero-visual')!;
            const visualBounds = visual.getBoundingClientRect();
            const scale = visualBounds.width / visual.offsetWidth;
            glyphs.forEach((glyph, index) => {
              const rect = bounds[layers.length + index];
              const glyphScale = scales[layers.length + index];
              const top = Math.max(0, (visualBounds.top + 110 * scale - rect.top) / glyphScale);
              const bottom = Math.max(0, (rect.bottom - (visualBounds.bottom - 110 * scale)) / glyphScale);
              glyph.style.clipPath = `inset(${top}px 0 ${bottom}px 0)`;
            });
          }
        };
        const paint = () => {
          frame = 0;
          strength += (wantedStrength - strength) * 0.18;
          if (Math.abs(wantedStrength - strength) < 0.002) strength = wantedStrength;
          targets.forEach((target, index) => {
            const scale = scales[index];
            target.style.setProperty('--local-light-x', `${(x - bounds[index].left) / scale}px`);
            target.style.setProperty('--local-light-y', `${(y - bounds[index].top) / scale}px`);
            if (index < layers.length) {
              target.style.setProperty('--local-background-light-radius', `${(hero ? 576 : 600) / scale}px`);
            } else {
              target.style.setProperty('--local-light-radius', `${480 / scale}px`);
            }
            target.style.setProperty('--local-light-strength', String(strength));
          });
          continuationStrength += (wantedContinuationStrength - continuationStrength) * 0.18;
          if (Math.abs(wantedContinuationStrength - continuationStrength) < 0.002) continuationStrength = wantedContinuationStrength;
          continuationLayers.forEach((layer, index) => {
            const scale = continuationScales[index];
            layer.style.setProperty('--local-light-x', `${(x - continuationBounds[index].left) / scale}px`);
            layer.style.setProperty('--local-light-y', `${(y - continuationBounds[index].top) / scale}px`);
            layer.style.setProperty('--local-background-light-radius', `${576 / scale}px`);
            layer.style.setProperty('--local-light-strength', String(continuationStrength));
          });
          if (strength !== wantedStrength || continuationStrength !== wantedContinuationStrength) frame = requestAnimationFrame(paint);
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
        const containsPointer = () => panelBounds.some((rect, index) => {
          const px = x - rect.left;
          const py = y - rect.top;
          if (px < 0 || py < 0 || px > rect.width || py > rect.height) return false;
          if (!hero || index === 1) return true;
          const radius = cornerRadii[index];
          const cornerX = index === 0 ? rect.width - radius : radius;
          const inCorner = py < radius && (index === 0 ? px > cornerX : px < cornerX);
          return !inCorner || (px - cornerX) ** 2 + (py - radius) ** 2 <= radius ** 2;
        });
        const containsContinuationPointer = () => continuationBounds.some((rect) =>
          x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        const leave = () => { pointerInsideArea = false; wantedStrength = 0; wantedContinuationStrength = 0; schedule(); };
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          pointerInsideArea = true;
          x = event.clientX;
          y = event.clientY;
          wantedStrength = containsPointer() ? 1 : 0;
          wantedContinuationStrength = containsContinuationPointer() ? 1 : 0;
          schedule();
        };
        const refresh = () => {
          measure();
          // Scrolling updates local geometry without extinguishing a pointer still inside.
          wantedStrength = pointerInsideArea && containsPointer() ? 1 : 0;
          wantedContinuationStrength = pointerInsideArea && containsContinuationPointer() ? 1 : 0;
          schedule();
        };
        measure();
        area.addEventListener('pointermove', move, { passive: true });
        area.addEventListener('pointerleave', leave);
        window.addEventListener('blur', leave);
        window.addEventListener('resize', refresh, { passive: true });
        window.addEventListener('scroll', refresh, { passive: true });
        cleanups.push(() => {
          cancelAnimationFrame(frame);
          area.removeEventListener('pointermove', move);
          area.removeEventListener('pointerleave', leave);
          window.removeEventListener('blur', leave);
          window.removeEventListener('resize', refresh);
          window.removeEventListener('scroll', refresh);
          layers.forEach((layer) => layer.remove());
          continuationLayers.forEach((layer) => layer.remove());
          glyphs.forEach((glyph) => {
            glyph.removeAttribute('data-local-light');
            glyph.style.removeProperty('clip-path');
            ['x', 'y', 'radius', 'strength'].forEach((key) => glyph.style.removeProperty(`--local-light-${key}`));
          });
        });
      };

      const hero = document.querySelector<HTMLElement>('#psd-stage');
      const panels = ['17', '15', '16'].map((id) => hero?.querySelector<HTMLElement>(`[data-spec-id="${id}"]`));
      if (hero && panels.every((panel) => panel)) {
        const transition = hero.querySelector<HTMLElement>('[data-spec-id="51"]');
        const canvas = hero.querySelector<HTMLElement>('.psd-canvas');
        const bottomLine = hero.querySelector<HTMLElement>('.hero-bottom-line');
        const continuationPanels: HTMLElement[] = [];
        if (transition && canvas && bottomLine) {
          const informationBackground = document.createElement('div');
          informationBackground.className = 'hero-local-light-information';
          informationBackground.setAttribute('aria-hidden', 'true');
          const top = transition.offsetTop + transition.offsetHeight;
          informationBackground.style.top = `${top}px`;
          informationBackground.style.height = `${bottomLine.offsetTop - top}px`;
          canvas.append(informationBackground);
          continuationPanels.push(transition, informationBackground);
          cleanups.push(() => informationBackground.remove());
        }
        attach(hero, panels as HTMLElement[], Array.from(hero.querySelectorAll<HTMLElement>('.hero-visual__character-layer--light')), true, continuationPanels);
      }
      const context = document.querySelector<HTMLElement>('.design-context');
      const stage = context?.querySelector<HTMLElement>('.design-context__stage');
      if (context && stage) attach(context, [stage], [], false);
      dispose = () => cleanups.forEach((cleanup) => cleanup());
    };

    configure();
    finePointer.addEventListener('change', configure);
    reducedMotion.addEventListener('change', configure);
    return () => {
      dispose();
      finePointer.removeEventListener('change', configure);
      reducedMotion.removeEventListener('change', configure);
    };
  }, []);

  return null;
}
