'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import LocalSpotlights from './local-spotlights';
import FloatingPillNavigation from './floating-pill-navigation';
import specData from '../ps2web-executable-hero-spec-v0.2/hero.executable-spec.v0.2.1.json';

type PaintNode = {
  id?: number | string;
  sourceLayerId?: number | null;
  sourcePath?: string;
  sourceType?: string;
  parentId?: number | null;
  children?: PaintNode[];
  renderMode?: string;
  visibility?: string;
  bounds?: { x?: number; y?: number; width?: number; height?: number };
  mask?: {
    hasUserMask?: boolean | null;
    hasVectorMask?: boolean | null;
    userMaskEnabled?: boolean | null;
    vectorMaskEnabled?: boolean | null;
  };
  clipping?: {
    isClippingLayer?: boolean | null;
    clippedToLayerId?: number | null;
    clippedToPath?: string | null;
  };
};

type TextInstruction = {
  sourceLayerId: number;
  sourcePath: string;
  text?: string;
  sourceFontSize?: number | null;
  fontPostScriptName?: string | null;
};

const spec = specData as unknown as {
  paintTree: PaintNode;
  textInstructions?: TextInstruction[];
  stackingContexts?: Array<{ sourceLayerId: number; sourcePath?: string }>;
  clipGroups?: Array<{ sourceLayerId: number; clippedToLayerId?: number | null; clippedToPath?: string | null }>;
  maskInstructions?: Array<{ sourceLayerId: number; maskType?: string; enabled?: boolean | null }>;
};

const textById = new Map<number, TextInstruction>();
for (const entry of spec.textInstructions ?? []) {
  textById.set(entry.sourceLayerId, entry);
}

const stackingById = new Map<number, number>();
for (const [index, entry] of (spec.stackingContexts ?? []).entries()) {
  stackingById.set(entry.sourceLayerId, index + 1);
}

const clipById = new Map<number, { clippedToLayerId?: number | null; clippedToPath?: string | null }>();
for (const entry of spec.clipGroups ?? []) {
  clipById.set(entry.sourceLayerId, {
    clippedToLayerId: entry.clippedToLayerId ?? null,
    clippedToPath: entry.clippedToPath ?? null,
  });
}

const maskById = new Map<number, string | null>();
for (const entry of spec.maskInstructions ?? []) {
  maskById.set(entry.sourceLayerId, entry.maskType ?? null);
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function getBounds(node: PaintNode) {
  const bounds = node.bounds ?? {};
  return {
    left: toNumber(bounds.x, 0),
    top: toNumber(bounds.y, 0),
    width: toNumber(bounds.width, 0),
    height: toNumber(bounds.height, 0),
  };
}

function getShapeStyle(sourceId: number, sourcePath = ''): CSSProperties {
  if (sourceId === 48) {
    return {
      background: 'transparent',
      border: '2px solid #0d63ed',
      borderRadius: '50%',
      zIndex: 2000,
    };
  }

  if (sourceId === 17) return { background: '#000', borderTopRightRadius: '120px' };
  if (sourceId === 16) return { background: '#000', borderTopLeftRadius: '120px' };
  if (sourceId === 15) return { background: '#000' };

  if (['矩形 3', '矩形 3 拷贝 2', '矩形 3 拷贝 3', '矩形 3 拷贝 4'].includes(sourcePath)) {
    return {
      background: 'transparent',
      border: '1px solid #000',
      borderRadius: '999px',
    };
  }

  if (['椭圆 1', '椭圆 1 拷贝', '椭圆 1 拷贝 2'].includes(sourcePath)) {
    return {
      background: '#0d63ed',
      border: '2px solid #000',
      borderRadius: '50%',
    };
  }

  if (sourceId === 51) {
    return {
      background: 'linear-gradient(180deg, #000 0%, #111 48%, #202020 100%)',
    };
  }

  return { background: '#000', borderRadius: 0 };
}

function renderPaintNode(node: PaintNode, index: number): ReactNode {
  const sourceId = typeof node.sourceLayerId === 'number' ? node.sourceLayerId : Number(node.id ?? index);
  const bounds = getBounds(node);
  const clipInfo = clipById.get(sourceId);
  const maskType = maskById.get(sourceId);
  const zIndex = stackingById.get(sourceId) ?? (typeof node.parentId === 'number' ? node.parentId + 1 : index + 1);

  const commonStyle: CSSProperties = {
    position: 'absolute',
    left: `${sourceId === 24 ? 59.5
      : sourceId === 25 ? 64.5
        : sourceId === 30 ? 107.5
          : sourceId === 31 ? 113.5
            : sourceId === 28 ? 155.5
              : sourceId === 29 ? 159.5
                : sourceId === 34 ? 1754
                  : bounds.left}px`,
    top: `${sourceId === 46 ? 133.5 : sourceId === 34 ? 23 : bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${[15, 16, 17].includes(sourceId) ? 777 : bounds.height}px`,
    zIndex: sourceId === 24 ? 100
      : sourceId === 25 ? 101
        : sourceId === 30 ? 102
          : sourceId === 31 ? 103
            : sourceId === 28 ? 104
              : sourceId === 29 ? 105
                : zIndex,
    overflow: 'hidden',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    opacity: [18, 21, 56].includes(sourceId) || node.visibility === 'hidden' ? 0 : 1,
  };

  const children = Array.isArray(node.children) ? node.children : [];

  if (node.sourceType === 'text' || node.renderMode === 'text') {
    const textInstruction = textById.get(sourceId);
    const sourceText = textInstruction?.text ?? node.sourcePath ?? '';
    const textValue = sourceId === 46 || sourceId === 34 || sourceId === 23
      ? sourceText.toUpperCase()
      : sourceText;
    const fontSize = sourceId === 58
      ? 14
      : [37, 39, 41, 43].includes(sourceId)
        ? 18
        : sourceId === 9
          ? 19.588
          : sourceId === 11
            ? 30.625
            : sourceId === 12
              ? 24.747
              : textInstruction?.sourceFontSize ?? 16;
    const fontWeight = [25, 29, 31, 58].includes(sourceId)
      ? 400
      : [37, 39, 41, 43].includes(sourceId)
        ? 500
        : [9, 11, 12].includes(sourceId)
          ? 500
        : sourceId === 52
          ? 400
          : 700;
    const fontFamily = textInstruction?.fontPostScriptName
      ? `${textInstruction.fontPostScriptName}, sans-serif`
      : 'sans-serif';

    return (
      <div
        key={String(sourceId)}
        data-spec-id={String(sourceId)}
        data-render-mode={node.renderMode ?? node.sourceType ?? 'text'}
        data-paint-source={node.sourcePath ?? ''}
        data-clip-target={clipInfo?.clippedToPath ?? undefined}
        data-mask-type={maskType ?? undefined}
        style={{
          ...commonStyle,
          color: sourceId === 52 ? '#5a5a5a' : '#000',
          fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight,
          letterSpacing: '0px',
          display: 'block',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          overflow: 'visible',
          textAlign: 'left',
          whiteSpace: sourceId === 58 ? 'normal' : 'pre',
          lineHeight: sourceId === 58
            ? '22px'
            : sourceId === 9
              ? '19.588px'
              : [11, 12].includes(sourceId)
                ? '24.747px'
                : '1',
          zIndex: sourceId === 52 ? 1400 : commonStyle.zIndex,
        }}
      >
        {textValue}
      </div>
    );
  }

  if (node.sourceType === 'group' || node.renderMode === 'structural-group' || children.length > 0) {
    const centerOffset = node.sourcePath === '标题' ? -11 : 0;

    return (
      <div
        key={String(sourceId)}
        data-spec-id={String(sourceId)}
        data-render-mode={node.renderMode ?? node.sourceType ?? 'group'}
        data-paint-source={node.sourcePath ?? ''}
        data-clip-target={clipInfo?.clippedToPath ?? undefined}
        data-mask-type={maskType ?? undefined}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          overflow: 'visible',
          pointerEvents: 'none',
          transform: centerOffset ? `translateX(${centerOffset}px)` : undefined,
        }}
      >
        {children.map((child, childIndex) => renderPaintNode(child, childIndex))}
      </div>
    );
  }

  return (
    <div
      key={String(sourceId)}
      data-spec-id={String(sourceId)}
      data-render-mode={node.renderMode ?? node.sourceType ?? 'shape'}
      data-paint-source={node.sourcePath ?? ''}
      data-clip-target={clipInfo?.clippedToPath ?? undefined}
      data-mask-type={maskType ?? undefined}
      style={{
        ...commonStyle,
        ...getShapeStyle(sourceId, node.sourcePath),
        overflow: 'hidden',
      }}
    />
  );
}

function HeroStructureParallax() {
  const structureRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const structure = structureRef.current;
    const area = structure?.closest<HTMLElement>('.hero-visual');
    if (!structure || !area) return;
    const layers = [...structure.querySelectorAll<SVGUseElement>('.hero-visual__structure-layer')];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let bounds = area.getBoundingClientRect();
    let targetX = 0;
    let targetY = 0;
    const motionLayers = [
      { selector: '.hero-visual__structure-layer--base', x: 0, y: 0, maxX: 3, maxY: 2, damping: 0.075 },
      { selector: '.hero-visual__structure-layer--front', x: 0, y: 0, maxX: 14, maxY: 10, damping: 0.12 },
    ].map((layer) => ({ ...layer, nodes: layers.filter((node) => node.matches(layer.selector)) }));
    let frame = 0;

    const paint = () => {
      motionLayers.forEach((layer) => {
        const transform = layer.x === 0 && layer.y === 0
          ? 'none'
          : `translate3d(${layer.x * layer.maxX}px, ${layer.y * layer.maxY}px, 0)`;
        layer.nodes.forEach((node) => { node.style.transform = transform; });
      });
    };
    const update = () => {
      frame = 0;
      let settled = true;
      motionLayers.forEach((layer) => {
        layer.x += (targetX - layer.x) * layer.damping;
        layer.y += (targetY - layer.y) * layer.damping;
        const layerSettled = Math.abs(targetX - layer.x) < 0.0001 && Math.abs(targetY - layer.y) < 0.0001;
        if (layerSettled) { layer.x = targetX; layer.y = targetY; }
        else settled = false;
      });
      paint();
      if (!settled) frame = window.requestAnimationFrame(update);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const leave = () => { targetX = 0; targetY = 0; schedule(); };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      targetX = inside ? ((event.clientX - bounds.left) / bounds.width) * 2 - 1 : 0;
      targetY = inside ? ((event.clientY - bounds.top) / bounds.height) * 2 - 1 : 0;
      schedule();
    };
    const measure = () => { bounds = area.getBoundingClientRect(); leave(); };
    const preferenceChanged = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      targetX = targetY = 0;
      motionLayers.forEach((layer) => { layer.x = 0; layer.y = 0; });
      paint();
    };
    const exitWindow = (event: PointerEvent) => { if (!event.relatedTarget) leave(); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', exitWindow, { passive: true });
    window.addEventListener('blur', leave);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    reduced.addEventListener('change', preferenceChanged);
    finePointer.addEventListener('change', preferenceChanged);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', exitWindow);
      window.removeEventListener('blur', leave);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      reduced.removeEventListener('change', preferenceChanged);
      finePointer.removeEventListener('change', preferenceChanged);
    };
  }, []);

  return (
    <div className="hero-visual__structure-window">
      <svg ref={structureRef} className="hero-visual__center" viewBox="0 0 1920 777">
        <defs>
          <image id="hero-structure-source" href="/hero-art/structure.png" x="372" y="-238" width="1080" height="1080" />
          <clipPath id="hero-structure-left" clipPathUnits="userSpaceOnUse">
            <rect x="0" y="0" width="516" height="777" />
          </clipPath>
          <clipPath id="hero-structure-center" clipPathUnits="userSpaceOnUse">
            <rect x="552" y="0" width="817" height="777" />
          </clipPath>
          <clipPath id="hero-structure-right" clipPathUnits="userSpaceOnUse">
            <rect x="1404" y="0" width="516" height="777" />
          </clipPath>
        </defs>
        <g clipPath="url(#hero-structure-left)">
          <use href="#hero-structure-source" className="hero-visual__structure-layer hero-visual__structure-layer--base" />
          <use href="#hero-structure-source" className="hero-visual__structure-layer hero-visual__structure-layer--front" />
        </g>
        <g clipPath="url(#hero-structure-center)">
          <use href="#hero-structure-source" className="hero-visual__structure-layer hero-visual__structure-layer--base" />
          <use href="#hero-structure-source" className="hero-visual__structure-layer hero-visual__structure-layer--front" />
        </g>
        <g clipPath="url(#hero-structure-right)">
          <use href="#hero-structure-source" className="hero-visual__structure-layer hero-visual__structure-layer--base" />
          <use href="#hero-structure-source" className="hero-visual__structure-layer hero-visual__structure-layer--front" />
        </g>
      </svg>
    </div>
  );
}

function HeroMarqueeBand({ direction, children }: { direction: 'top' | 'bottom'; children: string }) {
  const trackRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = true;
    let animation: Animation | undefined;
    const start = async () => {
      await document.fonts.ready;
      if (!active) return;
      animation?.cancel();
      if (reduced.matches) return;
      const copy = track.querySelector<HTMLElement>('.hero-visual__marquee-copy')!;
      const period = parseFloat(getComputedStyle(copy).width);
      // Match the accepted footer marquee's distance per second, not its duration.
      const reference = document.querySelector<HTMLElement>('.contact-footer__marquee-copy')!;
      const pixelsPerSecond = parseFloat(getComputedStyle(reference).width) / 44;
      const phase = (1920 - (period - parseFloat(getComputedStyle(copy).paddingRight))) / 2;
      const from = direction === 'top' ? phase : phase - period;
      const to = direction === 'top' ? phase - period : phase;
      animation = track.animate([
        { transform: `translateX(${from}px)`, backgroundPositionX: `${-from}px` },
        { transform: `translateX(${to}px)`, backgroundPositionX: `${-to}px` },
      ], { duration: period / pixelsPerSecond * 1000, iterations: Infinity, easing: 'linear' });
    };
    void start();
    reduced.addEventListener('change', start);
    return () => { active = false; animation?.cancel(); reduced.removeEventListener('change', start); };
  }, [direction]);

  return (
    <div className={`hero-visual__band hero-visual__band--${direction}`}>
      <div className="hero-visual__band-viewport hero-visual__band-viewport--left" />
      <div className="hero-visual__band-viewport hero-visual__band-viewport--center" />
      <div className="hero-visual__band-viewport hero-visual__band-viewport--right" />
      <div className="hero-visual__marquee-window">
        <p className="hero-visual__marquee-track" ref={trackRef}>
          {[0, 1, 2].map((copy) => <span className="hero-visual__marquee-copy" key={copy} aria-hidden={copy > 0 ? true : undefined}>{children}</span>)}
        </p>
      </div>
    </div>
  );
}

const frontierWords = ['從一個', '核心創意', '到', '每一個品牌觸點'] as const;

// Only a growing confirmed prefix and its terminal decoding glyph are updated.
// The last glyph uses the fixed, simple CJK pool; no random values or position changes.
const frontierSteps: readonly { at: number; buffer: number; confirmed?: number; tail: string }[] = [
  { at: 0, buffer: 0, confirmed: 2, tail: '丨' },
  { at: 50, buffer: 0, confirmed: 3, tail: '' },
  { at: 85, buffer: 1, confirmed: 1, tail: '口' },
  { at: 135, buffer: 1, confirmed: 2, tail: '' },
  { at: 165, buffer: 3, confirmed: 2, tail: '丨' },
  { at: 170, buffer: 1, confirmed: 3, tail: '亠' },
  { at: 215, buffer: 3, confirmed: 3, tail: '' },
  { at: 225, buffer: 1, confirmed: 4, tail: '' },
  { at: 250, buffer: 3, confirmed: 4, tail: '口' },
  { at: 260, buffer: 2, tail: '丨' },
  { at: 305, buffer: 3, confirmed: 5, tail: '' },
  { at: 310, buffer: 2, tail: '十' },
  { at: 335, buffer: 3, confirmed: 6, tail: '丨' },
  { at: 355, buffer: 2, confirmed: 1, tail: '' },
  { at: 385, buffer: 3, tail: '口' },
  { at: 430, buffer: 3, tail: '日' },
  { at: 480, buffer: 3, tail: '目' },
  { at: 525, buffer: 3, tail: '田' },
  { at: 575, buffer: 3, tail: '十' },
  { at: 625, buffer: 3, tail: '匚' },
  { at: 675, buffer: 3, tail: '亠' },
  { at: 735, buffer: 3, confirmed: 7, tail: '' },
];

function FrontierText({ text }: { text: string }) {
  return (
    <span className="design-context__frontier-text" aria-hidden="true">
      <span className="design-context__frontier-confirmed">
        {[...text].map((character, index) => <span key={index}>{character}</span>)}
      </span>
      <span className="design-context__frontier-tail" />
    </span>
  );
}

function createVerticalCopyReveal(section: HTMLElement) {
  const groupSelectors = [
    '.design-context__vertical-group--right',
    '.design-context__vertical-group--middle',
    '.design-context__card-copy',
  ];
  const groups = groupSelectors.map((selector) => {
    const group = section.querySelector<HTMLElement>(selector)!;
    return {
      group,
      paragraph: group.querySelector<HTMLElement>('.design-context__copy-flow')!,
      circle: group.querySelector<HTMLElement>('.design-context__circle')!,
    };
  });
  const animations = new Set<Animation>();
  const copies = new Set<HTMLElement>();
  let generation = 0;

  const reset = () => {
    generation += 1;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    copies.forEach((copy) => copy.remove());
    copies.clear();
    groups.forEach(({ group, paragraph }) => {
      group.dataset.copyState = 'pending';
      paragraph.style.removeProperty('color');
      if (!paragraph.style.length) paragraph.removeAttribute('style');
    });
  };
  const play = () => {
    const token = ++generation;
    groups.forEach(({ group, paragraph, circle }, groupIndex) => {
      const style = getComputedStyle(paragraph);
      const width = parseFloat(style.width);
      const columnWidth = parseFloat(style.lineHeight);
      const columnCount = Math.round(width / columnWidth);
      const groupDelay = 140 + groupIndex * 100;
      const groupCopies: HTMLElement[] = [];
      const groupAnimations: Animation[] = [];

      // Each copy retains the complete paragraph and original vertical typesetting.
      // Fixed column clips reveal it without splitting or repositioning any text.
      for (let column = 0; column < columnCount; column += 1) {
        const copy = paragraph.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        copy.dataset.copyRevealColumn = String(column);
        const right = column * columnWidth;
        const left = Math.max(0, width - (column + 1) * columnWidth);
        const hidden = `inset(0px ${right}px 100% ${left}px)`;
        const visible = `inset(0px ${right}px 0% ${left}px)`;
        copy.style.clipPath = hidden;
        paragraph.parentElement!.append(copy);
        copies.add(copy);
        groupCopies.push(copy);
        const animation = copy.animate([{ clipPath: hidden }, { clipPath: visible }], {
          delay: groupDelay + column * 50,
          duration: 500,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        });
        animations.add(animation);
        groupAnimations.push(animation);
      }
      // Keep the semantic paragraph in place; only its clipped paint copies reveal.
      paragraph.style.color = 'transparent';
      const marker = circle.animate([
        { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' },
      ], { delay: groupDelay, duration: 90, fill: 'both' });
      animations.add(marker);
      groupAnimations.push(marker);
      void Promise.all(groupAnimations.map((animation) => animation.finished)).then(() => {
        if (token !== generation) return;
        group.dataset.copyState = 'complete';
        paragraph.style.removeProperty('color');
        if (!paragraph.style.length) paragraph.removeAttribute('style');
        groupCopies.forEach((copy) => { copy.remove(); copies.delete(copy); });
        groupAnimations.forEach((animation) => { animation.cancel(); animations.delete(animation); });
      }).catch(() => { /* Exit/reset restores the unchanged semantic paragraph. */ });
    });
  };
  return { play, reset };
}

function DesignContextSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const title = section.querySelector<HTMLElement>('.design-context__title');
    const giant = section.querySelector<HTMLElement>('.design-context__giant');
    if (!title || !giant) return;
    const buffers = [...title.querySelectorAll<HTMLElement>('.design-context__frontier-text')].map((buffer) => {
      const confirmedText = buffer.querySelector<HTMLElement>('.design-context__frontier-confirmed')!;
      const decodingTail = buffer.querySelector<HTMLElement>('.design-context__frontier-tail')!;
      const tailText = document.createTextNode('');
      decodingTail.append(tailText);
      return { confirmedText, tailText, characters: [...confirmedText.children], count: confirmedText.childElementCount };
    });
    const copyReveal = createVerticalCopyReveal(section);
    const timers = new Set<number>();
    let active = true;
    let playing = false;
    let completed = false;
    let generation = 0;
    let frame = 0;

    const applyStep = ({ buffer, confirmed, tail }: typeof frontierSteps[number]) => {
      const target = buffers[buffer];
      if (confirmed !== undefined) {
        // Append only new, already-correct nodes. Locked characters are never touched.
        while (target.count < confirmed) {
          target.confirmedText.append(target.characters[target.count]);
          target.count += 1;
        }
      }
      target.tailText.data = tail;
    };
    const reset = () => {
      section.dataset.motionState = 'pending';
      copyReveal.reset();
      generation += 1;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      buffers.forEach((buffer) => {
        buffer.characters.forEach((character) => buffer.confirmedText.append(character));
        buffer.tailText.data = '';
        buffer.count = buffer.characters.length;
      });
      playing = false;
      completed = false;
    };
    const play = async () => {
      if (playing || completed) return;
      playing = true;
      const token = ++generation;
      const font = getComputedStyle(title);
      await document.fonts.load(`${font.fontWeight} ${font.fontSize} ${font.fontFamily}`, '丨口日目田十匚亠');
      await document.fonts.ready;
      if (!active || token !== generation) return;
      buffers.forEach((buffer, index) => {
        const keep = index === 0 ? 2 : 0;
        buffer.characters.slice(keep).forEach((character) => character.remove());
        buffer.count = keep;
        buffer.tailText.data = '';
      });
      const startTimer = window.setTimeout(() => {
        timers.delete(startTimer);
        if (!active || token !== generation) return;
        if (Number(section.style.getPropertyValue('--design-context-buffer-opacity')) < 1) {
          playing = false;
          return;
        }
        applyStep(frontierSteps[0]);
        section.dataset.motionState = 'playing';
        for (const step of frontierSteps.slice(1)) {
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            if (!active || token !== generation) return;
            applyStep(step);
            if (step.at === 735) { playing = false; completed = true; section.dataset.motionState = 'complete'; }
          }, step.at);
          timers.add(timer);
        }
        copyReveal.play();
      }, 70);
      timers.add(startTimer);
    };
    const checkPosition = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const giantTop = giant.getBoundingClientRect().top;
      // The whole blue skeleton builds as the giant heading enters the lower screen.
      const opacity = Math.min(1, Math.max(0, (viewportHeight - giantTop) / (viewportHeight * 0.32)));
      section.style.setProperty('--design-context-buffer-opacity', String(opacity));
      const bounds = title.getBoundingClientRect();
      const center = bounds.top + bounds.height / 2;
      if (opacity === 1 && center > 0 && center <= viewportHeight * 0.82) void play();
    };
    const scheduleCheck = () => {
      if (!frame) frame = window.requestAnimationFrame(checkPosition);
    };
    const exitObserver = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio <= 0.08 && (playing || completed)) reset();
    }, { threshold: [0, 0.08] });
    exitObserver.observe(section);
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck);
    scheduleCheck();
    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      exitObserver.disconnect();
      reset();
      buffers.forEach((buffer) => buffer.tailText.remove());
    };
  }, []);

  return (
    <section className="design-context" data-motion-state="pending" aria-labelledby="design-context-title" ref={sectionRef}>
      <div className="design-context__stage">
        <h2 id="design-context-title" className="design-context__title" aria-label="從一個 核心創意 到 每一個品牌觸點">
          <span>
            <b className="design-context__title-unit design-context__title-unit--from"><span className="design-context__title-background" aria-hidden="true" /><FrontierText text={frontierWords[0]} /></b>
            <b className="design-context__title-unit design-context__title-unit--core"><span className="design-context__title-background" aria-hidden="true" /><FrontierText text={frontierWords[1]} /></b>
            <b className="design-context__title-unit design-context__title-unit--to"><span className="design-context__title-background" aria-hidden="true" /><FrontierText text={frontierWords[2]} /></b>
          </span>
          <span>
            <b className="design-context__title-unit design-context__title-unit--touchpoints"><span className="design-context__title-background" aria-hidden="true" /><FrontierText text={frontierWords[3]} /></b>
          </span>
        </h2>

        <p className="design-context__intro">
          Starting from a core idea, establish a clear and<br />
          distinctive visual expression.<br />
          Let the visuals continue to develop in different media and scenarios,<br />
          forming a consistent brand experience.
        </p>

        <div className="design-context__vertical-group design-context__vertical-group--right" data-copy-state="pending">
          <span className="design-context__circle design-context__circle--right" aria-hidden="true" />
          <p className="design-context__copy-flow">我習慣從品牌與活動主題中提煉核心概念，將策略與信息轉化為清晰、有辨識度的視覺表達，而不是從單一畫面開始設計。</p>
        </div>

        <div className="design-context__vertical-group design-context__vertical-group--middle" data-copy-state="pending">
          <span className="design-context__circle design-context__circle--middle" aria-hidden="true" />
          <p className="design-context__copy-flow">核心視覺不是最終結果。我更關注它如何延展至運營傳播、線下物料、展陳與空間等不同場景，並保持統一而有變化的體驗。</p>
        </div>

        <article className="design-context__card">
          <div className="design-context__card-copy" data-copy-state="pending">
            <span className="design-context__circle design-context__circle--card" aria-hidden="true" />
            <p className="design-context__copy-flow">設計最終需要進入真實場景。從屏幕到空間，從一次 CAMPAIGN 到長期品牌表達，讓創意在不同觸點中保持一致，也回應具體的使用需求。</p>
          </div>
          <ul className="design-context__project-list">
            <li>東嶽大型春秋拍賣會</li>
            <li>朱炳仁銅品牌升級項目</li>
            <li>朱炳仁銅博18周年</li>
            <li>春晚義烏分會場部分KV</li>
            <li>展陳視覺部分KV</li>
            <li>復星515家庭日部分物料</li>
            <li>其他專項設計</li>
          </ul>
        </article>

        <div className="design-context__giant" aria-hidden="true">
          <span className="design-context__giant-unit design-context__giant-unit--design"><span className="design-context__giant-char">設</span></span>
          <span className="design-context__giant-unit design-context__giant-unit--plan"><span className="design-context__giant-char">計</span></span>
          <span className="design-context__giant-unit design-context__giant-unit--vein"><span className="design-context__giant-char">脈</span></span>
          <span className="design-context__giant-unit design-context__giant-unit--context"><span className="design-context__giant-char">絡</span></span>
        </div>
        <div className="design-context__divider" aria-hidden="true" />
      </div>
    </section>
  );
}

const aboutRows = [
  {
    index: '1',
    value: '8',
    label: 'YEARS',
    copy: <>從運營 CAMPAIGN、品牌活動到展陳與線下<br />場景，持續參與品牌如何通過視覺被看見、<br />理解與體驗。</>,
  },
  {
    index: '2',
    value: '3',
    label: 'DIMENSIONS',
    copy: <>運營視覺全案、品牌展陳視覺與專項設計，<br />覆蓋從日常傳播到大型品牌事件的不同視覺<br />任務。</>,
  },
  {
    index: '3',
    value: '2',
    label: 'MULTI TOUCHPOINTS',
    copy: <>從主 KV 出發，延展至社交傳播、活動頁<br />面、物料、門店與展陳，讓視覺語言在不同<br />場景中保持統一，同時適應真實使用需求。</>,
  },
];

function createAboutTitleReveal(section: HTMLElement, title: HTMLElement, lines: HTMLElement[]) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  let started = false;
  let generation = 0;
  let active = true;
  const maskProperties = ['mask-image', 'mask-size', 'mask-position', 'mask-repeat'];
  const reset = () => {
    generation += 1;
    started = false;
    title.dataset.titleState = reduced.matches ? 'complete' : 'pending';
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    lines.forEach((line) => {
      maskProperties.forEach((property) => line.style.removeProperty(property));
      if (!line.style.length) line.removeAttribute('style');
    });
  };
  const play = async () => {
    if (started || reduced.matches) return;
    started = true;
    const token = ++generation;
    await document.fonts.ready;
    if (!active || token !== generation) return;
    title.dataset.titleState = 'playing';
    const sequence = lines.map((line, index) => {
      const range = document.createRange();
      range.selectNodeContents(line);
      const scale = title.getBoundingClientRect().width / title.offsetWidth;
      const width = range.getBoundingClientRect().width / scale;
      const feather = 92;
      line.style.maskImage = `linear-gradient(to right, #000 0px, #000 ${width}px, transparent ${width + feather}px)`;
      line.style.maskSize = `${width * 2 + feather}px 100%`;
      line.style.maskRepeat = 'no-repeat';
      line.style.maskPosition = `${-(width + feather)}px 0px`;
      const animation = line.animate([
        { maskPosition: `${-(width + feather)}px 0px` },
        { maskPosition: '0px 0px' },
      ], { delay: index * 80, duration: index === 2 ? 500 : 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
      animations.add(animation);
      return animation.finished;
    });
    void Promise.all(sequence).then(() => {
      if (!active || token !== generation) return;
      title.dataset.titleState = 'complete';
      lines.forEach((line) => {
        maskProperties.forEach((property) => line.style.removeProperty(property));
        if (!line.style.length) line.removeAttribute('style');
      });
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    }).catch(() => { /* Leaving far outside the section cancels and resets the mask. */ });
  };
  const exitObserver = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio <= 0.08 && started) reset();
  }, { threshold: [0, 0.08] });
  exitObserver.observe(section);
  reset();
  return {
    check: (center: number, viewportHeight: number) => {
      if (center > 0 && center <= viewportHeight * 0.82) void play();
    },
    destroy: () => { active = false; exitObserver.disconnect(); reset(); },
  };
}

function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const title = section.querySelector<HTMLElement>('.about-section__title');
    const titleLines = Array.from(section.querySelectorAll<HTMLElement>('.about-section__title span'));
    const intro = section.querySelector<HTMLElement>('.about-section__intro');
    const rows = Array.from(section.querySelectorAll<HTMLElement>('.about-section__row'));
    if (!title || titleLines.length !== 3 || !intro || rows.length !== 3) return;

    const titleReveal = createAboutTitleReveal(section, title, titleLines);
    let frame = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const smoothstep = (value: number) => {
      const progress = clamp(value);
      return progress * progress * (3 - (2 * progress));
    };

    const updateMotion = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const titleBounds = title.getBoundingClientRect();
      const titleCenter = titleBounds.top + (title.offsetHeight / 2);
      const titleStart = viewportHeight * 0.78;
      const titleEnd = viewportHeight * 0.48;
      const titleProgress = clamp((titleStart - titleCenter) / (titleStart - titleEnd));

      titleReveal.check(titleBounds.top + titleBounds.height / 2, viewportHeight);

      const introProgress = smoothstep((titleProgress - 0.72) / 0.28);
      intro.style.setProperty('--about-intro-opacity', introProgress.toFixed(4));
      intro.style.setProperty('--about-intro-y', `${((1 - introProgress) * 9).toFixed(3)}px`);

      rows.forEach((row) => {
        const bounds = row.getBoundingClientRect();
        const rowCenter = bounds.top + (row.offsetHeight / 2);
        const rowStart = viewportHeight * 0.8;
        const rowEnd = viewportHeight * 0.5;
        const progress = clamp((rowStart - rowCenter) / (rowStart - rowEnd));
        const lineProgress = smoothstep(progress / 0.4);
        const indexProgress = smoothstep((progress - 0.1) / 0.35);
        const numberProgress = smoothstep((progress - 0.16) / 0.52);
        const labelProgress = smoothstep((progress - 0.32) / 0.48);
        const copyProgress = smoothstep((progress - 0.46) / 0.48);

        row.style.setProperty('--about-line-scale', lineProgress.toFixed(4));
        row.style.setProperty('--about-index-opacity', indexProgress.toFixed(4));
        row.style.setProperty('--about-index-y', `${((1 - indexProgress) * 3).toFixed(3)}px`);
        row.style.setProperty('--about-number-opacity', (0.08 + (numberProgress * 0.92)).toFixed(4));
        row.style.setProperty('--about-number-y', `${((1 - numberProgress) * 16).toFixed(3)}px`);
        row.style.setProperty('--about-number-clip', `${((1 - numberProgress) * 100).toFixed(3)}%`);
        row.style.setProperty('--about-label-opacity', labelProgress.toFixed(4));
        row.style.setProperty('--about-label-y', `${((1 - labelProgress) * 7).toFixed(3)}px`);
        row.style.setProperty('--about-copy-opacity', copyProgress.toFixed(4));
        row.style.setProperty('--about-copy-y', `${((1 - copyProgress) * 9).toFixed(3)}px`);
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateMotion);
    };

    updateMotion();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      titleReveal.destroy();
    };
  }, []);

  return (
    <section id="about" className="about-section" aria-labelledby="about-title" ref={sectionRef}>
      <div className="about-section__stage">
        <p className="about-section__eyebrow">ABOUT&nbsp; · &nbsp;WHO I AM</p>
        <h2 id="about-title" className="about-section__title" data-title-state="pending">
          <span>我把每一次創意看作一個完整的體驗系統——</span>
          <span>從主題與主視覺出發</span>
          <span>直到它真正進入傳播/空間與人的體驗之中</span>
        </h2>
        <p className="about-section__intro">
          I view each creative idea as a complete experience system -<br />
          starting from the theme and main visual,<br />
          until it truly enters the realm of communication, space, and human experience.
        </p>

        <div className="about-section__rows">
          {aboutRows.map((row) => (
            <article className="about-section__row" key={row.index}>
              <span className="about-section__row-line" aria-hidden="true" />
              <span className="about-section__index">{row.index}</span>
              <strong className="about-section__number">{row.value}</strong>
              <span className="about-section__label">{row.label}</span>
              <p className="about-section__copy">{row.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const trustTrackCopy = 'Creative Direction · Concept Development · Key Visual Design · Visual System · Campaign Rollout · Event & Exhibition · Retail Experience · Digital Content · Brand Activation · Cross-channel Adaptation ·';

const trustPills = [
  { label: 'Brand Upgrade', x: 378, y: 351, width: 520, row: 0, scatterX: -16, scatterY: -12 },
  { label: 'Campaign', x: 919, y: 351, width: 370, row: 0, scatterX: 0, scatterY: -12 },
  { label: 'Event', x: 1305, y: 351, width: 250, row: 0, scatterX: 16, scatterY: -12 },
  { label: 'Exhibition', x: 635, y: 444, width: 378, row: 1, scatterX: -14, scatterY: -3 },
  { label: 'Retail', x: 1036, y: 444, width: 254, row: 1, scatterX: 14, scatterY: 3 },
  { label: 'Content', x: 448, y: 537, width: 322, row: 2, scatterX: -16, scatterY: 12 },
  { label: 'Co-branding', x: 792, y: 537, width: 458, row: 2, scatterX: 0, scatterY: 12 },
  { label: 'O2O', x: 1271, y: 537, width: 205, row: 2, scatterX: 16, scatterY: 12 },
];

function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const eyebrow = section.querySelector<HTMLElement>('.trust-section__eyebrow');
    const pillRows = [0, 1, 2].map((row) => (
      Array.from(section.querySelectorAll<HTMLElement>(`[data-trust-row="${row}"]`))
    ));
    const stage = section.querySelector<HTMLElement>('.trust-section__stage');
    const pills = pillRows.flat();
    if (!eyebrow || !stage || pills.length === 0) return;
    const pillGroupTop = Math.min(...pills.map((pill) => pill.offsetTop));
    const pillGroupBottom = Math.max(...pills.map((pill) => pill.offsetTop + pill.offsetHeight));
    const pillGroupCenter = (pillGroupTop + pillGroupBottom) / 2;

    let frame = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const smoothstep = (value: number) => {
      const progress = clamp(value);
      return progress * progress * (3 - (2 * progress));
    };

    const updateEntrance = () => {
      frame = 0;
      const stageBounds = stage.getBoundingClientRect();
      const stageScale = stageBounds.width / 1920;
      const groupCenter = stageBounds.top + (pillGroupCenter * stageScale);
      const start = window.innerHeight * 0.78;
      const end = window.innerHeight * 0.535;
      const progress = clamp((start - groupCenter) / (start - end));
      const eyebrowProgress = smoothstep(progress / 0.55);
      const rowProgresses = [
        smoothstep((progress - 0.14) / 0.64),
        smoothstep((progress - 0.16) / 0.64),
        smoothstep((progress - 0.18) / 0.64),
      ];

      eyebrow.style.setProperty('--trust-entrance-opacity', eyebrowProgress.toFixed(4));
      eyebrow.style.setProperty('--trust-entrance-y', `${((1 - eyebrowProgress) * 10).toFixed(3)}px`);
      pillRows.forEach((row, index) => {
        row.forEach((pill) => {
          const scatterX = Number(pill.dataset.trustScatterX) || 0;
          const scatterY = Number(pill.dataset.trustScatterY) || 0;
          const rowProgress = rowProgresses[index];
          pill.style.setProperty('--trust-entrance-opacity', (0.42 + (rowProgress * 0.58)).toFixed(4));
          pill.style.setProperty('--trust-entrance-x', `${((1 - rowProgress) * scatterX).toFixed(3)}px`);
          pill.style.setProperty('--trust-entrance-y', `${((1 - rowProgress) * scatterY).toFixed(3)}px`);
        });
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateEntrance);
    };

    updateEntrance();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="trust-section" aria-labelledby="trust-title" ref={sectionRef}>
      <div className="trust-section__stage">
        <div className="trust-section__track" aria-label="Creative capabilities">
          <div className="trust-section__track-marquee">
            <p className="trust-section__track-copy">{trustTrackCopy}</p>
            <p className="trust-section__track-copy" aria-hidden="true">{trustTrackCopy}</p>
          </div>
          <span className="trust-section__track-line" aria-hidden="true" />
        </div>
        <p id="trust-title" className="trust-section__eyebrow">TRUST BY&nbsp; · &nbsp;WHAT I’VE DONE</p>
        <div className="trust-section__pills">
          {trustPills.map((pill) => (
            <div
              className="trust-section__pill"
              data-trust-row={pill.row}
              data-trust-scatter-x={pill.scatterX}
              data-trust-scatter-y={pill.scatterY}
              key={pill.label}
              style={{
                left: pill.x,
                top: pill.y,
                width: pill.width,
                '--trust-entrance-x': `${pill.scatterX}px`,
                '--trust-entrance-y': `${pill.scatterY}px`,
              } as CSSProperties}
            >
              {pill.label}
            </div>
          ))}
        </div>
        <span className="trust-section__bottom-line" aria-hidden="true" />
      </div>
    </section>
  );
}

const featuredProjects = [
  { brand: 'Dong Jia APP', project: '东家大型春季拍卖会', year: '2021', x: 46, y: 376, src: '/featured-work/work-01-dongjia-auction.png', href: '/projects/everyone-is-a-collector' },
  { brand: 'Zhu Bingren Tong', project: '朱炳仁铜品牌升级案例', year: '2024', x: 980, y: 376, src: '/featured-work/work-02-zbr-brand-upgrade.png', href: '/projects/zhu-bingren-brand-upgrade' },
  { brand: 'Zhu Bingren Tong', project: '熔铜18周年联合国博展', year: '2024', x: 46, y: 1359, src: '/featured-work/work-03-rongtong-18th-guobo.png', href: '/projects/zhubingren-national-museum' },
  { brand: 'Bi Jian Wen Hua', project: '春晚义乌分会场部分视觉', year: '2025', x: 980, y: 1359, src: '/featured-work/work-04-cctv-spring-festival-yiwu.png', href: '/projects/yiwu-spring-festival-gala' },
];

function PixelatedProjectImage({ src, hovered }: { src: string; hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const canvasFailedRef = useRef(false);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixelSizeRef = useRef(56);
  const colorMixRef = useRef(0);
  const colorFrameRef = useRef<number | null>(null);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const sourceImage = sourceImageRef.current;
    if (!canvas || !sourceImage?.complete || !sourceImage.naturalWidth) return;

    if (canvasFailedRef.current) {
      if (fallbackRef.current) fallbackRef.current.style.filter = `grayscale(${1 - colorMixRef.current})`;
      return;
    }

    try {
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Project canvas context unavailable');

      const pixelSize = pixelSizeRef.current;
      const sampleWidth = Math.max(1, Math.ceil(canvas.width / pixelSize));
      const sampleHeight = Math.max(1, Math.ceil(canvas.height / pixelSize));
      const sampleCanvas = sampleCanvasRef.current ?? document.createElement('canvas');
      sampleCanvasRef.current = sampleCanvas;
      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;

      const sampleContext = sampleCanvas.getContext('2d');
      if (!sampleContext) throw new Error('Project sample context unavailable');

      const sourceRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
      const targetRatio = sampleWidth / sampleHeight;
      let drawWidth = sampleWidth;
      let drawHeight = sampleHeight;
      let drawX = 0;
      let drawY = 0;

      if (sourceRatio > targetRatio) {
        drawHeight = sampleWidth / sourceRatio;
        drawY = (sampleHeight - drawHeight) / 2;
      } else {
        drawWidth = sampleHeight * sourceRatio;
        drawX = (sampleWidth - drawWidth) / 2;
      }

      sampleContext.clearRect(0, 0, sampleWidth, sampleHeight);
      sampleContext.imageSmoothingEnabled = true;
      sampleContext.filter = `grayscale(${((1 - colorMixRef.current) * 100).toFixed(2)}%)`;
      sampleContext.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = false;
      context.drawImage(sampleCanvas, 0, 0, canvas.width, canvas.height);
    } catch {
      canvasFailedRef.current = true;
      setFallbackSrc(sourceImage.src);
    }
  }, []);

  const updatePixelation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();
    const revealDistance = window.innerHeight * 0.75;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / revealDistance));
    const nextPixelSize = Math.max(1, Math.round(1 + ((1 - progress) ** 1.6) * 55));
    if (nextPixelSize === pixelSizeRef.current && sourceImageRef.current) return;
    pixelSizeRef.current = nextPixelSize;
    drawImage();
  }, [drawImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let started = false;
    let controller: AbortController | null = null;
    let timeout = 0;
    let retryTimeout = 0;
    let objectUrl: string | null = null;
    let observer: IntersectionObserver | null = null;

    const loadImage = async () => {
      if (started || disposed) return;
      started = true;
      observer?.disconnect();
      // Finish or abort each request before the single retry can start.
      for (let attempt = 0; attempt < 2 && !disposed; attempt += 1) {
        controller = new AbortController();
        timeout = window.setTimeout(() => controller?.abort(), 45000);
        try {
          const response = await fetch(src, { signal: controller.signal });
          if (!response.ok) {
            await response.body?.cancel();
            throw new Error('Project image request failed');
          }
          const blob = await response.blob();
          if (disposed) return;
          objectUrl = URL.createObjectURL(blob);
          const image = new Image();
          image.src = objectUrl;
          const signal = controller.signal;
          await new Promise<void>((resolve, reject) => {
            const abortDecode = () => {
              signal.removeEventListener('abort', abortDecode);
              image.removeAttribute('src');
              reject(new Error('Project image decoding timed out'));
            };
            if (signal.aborted) {
              abortDecode();
              return;
            }
            signal.addEventListener('abort', abortDecode, { once: true });
            image.decode().then(resolve, reject).finally(() => {
              signal.removeEventListener('abort', abortDecode);
            });
          });
          if (disposed) return;
          sourceImageRef.current = image;
          // Measure the current scroll position, including late image arrivals.
          updatePixelation();
          drawImage();
          return;
        } catch {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        } finally {
          window.clearTimeout(timeout);
        }
        if (attempt === 0 && !disposed) {
          await new Promise<void>((resolve) => {
            retryTimeout = window.setTimeout(resolve, 500);
          });
        }
      }
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) void loadImage();
      }, { rootMargin: '600px 0px' });
      observer.observe(canvas);
    } else {
      void loadImage();
    }

    let scrollFrame = 0;
    const requestUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        updatePixelation();
      });
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      disposed = true;
      observer?.disconnect();
      controller?.abort();
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, [drawImage, src, updatePixelation]);

  useEffect(() => {
    if (colorFrameRef.current) window.cancelAnimationFrame(colorFrameRef.current);
    const startValue = colorMixRef.current;
    const targetValue = hovered ? 1 : 0;
    const startTime = performance.now();

    const updateColor = (time: number) => {
      const progress = Math.min(1, (time - startTime) / 500);
      const eased = 1 - ((1 - progress) ** 3);
      colorMixRef.current = startValue + ((targetValue - startValue) * eased);
      drawImage();

      if (progress < 1) {
        colorFrameRef.current = window.requestAnimationFrame(updateColor);
      } else {
        colorFrameRef.current = null;
      }
    };

    colorFrameRef.current = window.requestAnimationFrame(updateColor);
    return () => {
      if (colorFrameRef.current) window.cancelAnimationFrame(colorFrameRef.current);
    };
  }, [drawImage, hovered]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="featured-work__image"
        width={893}
        height={900}
        aria-hidden="true"
        style={fallbackSrc ? { display: 'none' } : undefined}
      />
      {fallbackSrc && (
        <img
          ref={fallbackRef}
          src={fallbackSrc}
          className="featured-work__image"
          width={893}
          height={900}
          alt=""
          aria-hidden="true"
          style={{ filter: `grayscale(${1 - colorMixRef.current})` }}
        />
      )}
    </>
  );
}

function FeaturedWorkSection() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const headingRef = useRef<HTMLElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const cursorFrameRef = useRef<number | null>(null);
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const cursorInitializedRef = useRef(false);

  const updateCursorTarget = (event: ReactPointerEvent<HTMLElement>) => {
    cursorTargetRef.current = { x: event.clientX + 16, y: event.clientY + 16 };
    if (!cursorInitializedRef.current) {
      cursorPositionRef.current = cursorTargetRef.current;
      cursorInitializedRef.current = true;
    }

    if (cursorFrameRef.current) return;
    let previousTime = performance.now();

    const followCursor = (time: number) => {
      const elapsed = Math.min(40, time - previousTime);
      previousTime = time;
      const easing = 1 - Math.exp(-elapsed / 85);
      const position = cursorPositionRef.current;
      const target = cursorTargetRef.current;
      position.x += (target.x - position.x) * easing;
      position.y += (target.y - position.y) * easing;

      if (cursorLabelRef.current) {
        cursorLabelRef.current.style.transform = `translate3d(${position.x.toFixed(2)}px, ${position.y.toFixed(2)}px, 0)`;
      }

      if (Math.abs(target.x - position.x) > 0.1 || Math.abs(target.y - position.y) > 0.1) {
        cursorFrameRef.current = window.requestAnimationFrame(followCursor);
      } else {
        cursorFrameRef.current = null;
      }
    };

    cursorFrameRef.current = window.requestAnimationFrame(followCursor);
  };

  useEffect(() => () => {
    if (cursorFrameRef.current) window.cancelAnimationFrame(cursorFrameRef.current);
  }, []);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const eyebrow = heading.querySelector<HTMLElement>('p');
    const title = heading.querySelector<HTMLElement>('h2');
    if (!eyebrow || !title) return;

    let frame = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const smoothstep = (value: number) => {
      const progress = clamp(value);
      return progress * progress * (3 - (2 * progress));
    };

    const updateHeading = () => {
      frame = 0;
      const headingBounds = heading.getBoundingClientRect();
      const headingCenter = headingBounds.top + (heading.offsetHeight / 2);
      const start = window.innerHeight * 0.74;
      const end = window.innerHeight * 0.525;
      const scrollProgress = clamp((start - headingCenter) / (start - end));
      const eyebrowProgress = smoothstep(scrollProgress / 0.92);
      const titleProgress = smoothstep((scrollProgress - 0.08) / 0.92);

      eyebrow.style.setProperty('--featured-heading-opacity', (0.08 + (eyebrowProgress * 0.92)).toFixed(4));
      eyebrow.style.setProperty('--featured-heading-y', `${((1 - eyebrowProgress) * 10).toFixed(3)}px`);
      title.style.setProperty('--featured-heading-opacity', (0.08 + (titleProgress * 0.92)).toFixed(4));
      title.style.setProperty('--featured-heading-y', `${((1 - titleProgress) * 12).toFixed(3)}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeading);
    };

    updateHeading();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="featured-work" aria-labelledby="featured-work-title">
      <div className="featured-work__stage">
        <header className="featured-work__heading" ref={headingRef}>
          <p>RECENT · PROJECTS</p>
          <h2 id="featured-work-title">Selected Work</h2>
        </header>

        <div className="featured-work__projects">
          {featuredProjects.map((item, index) => (
            <article
              className="featured-work__project"
              key={`${item.brand}-${item.year}`}
              style={{ left: item.x, top: item.y }}
            >
              <div
                className="featured-work__image-region"
                onPointerEnter={(event) => {
                  setHoveredProject(index);
                  updateCursorTarget(event);
                }}
                onPointerMove={updateCursorTarget}
                onPointerLeave={() => setHoveredProject(null)}
              >
                {item.href ? (
                  <Link href={item.href} prefetch={false} aria-label={`查看${item.project}`} style={{ display: 'block', width: '100%', height: '100%', cursor: 'inherit' }}>
                    <PixelatedProjectImage src={item.src} hovered={hoveredProject === index} />
                  </Link>
                ) : (
                  <PixelatedProjectImage src={item.src} hovered={hoveredProject === index} />
                )}
              </div>
              <div className="featured-work__meta">
                <span className="featured-work__brand">{item.brand}</span>
                <span className="featured-work__name">{item.project}</span>
                <span className="featured-work__year">{item.year}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <span
        ref={cursorLabelRef}
        className={`featured-work__cursor-label${hoveredProject !== null ? ' featured-work__cursor-label--visible' : ''}`}
        aria-hidden="true"
      >
        VIEW CASE
      </span>
    </section>
  );
}

const serviceItems = [
  { label: 'Campaign Visual', smallY: 205, largeY: 158, image: '/services/service-campaign-visual.png' },
  { label: 'Brand Experience', smallY: 342, largeY: 300, image: '/services/service-brand-experience.png' },
  { label: 'Visual System', smallY: 479, largeY: 442, image: '/services/service-visual-system.png' },
  { label: 'Exhibition Visual', smallY: 616, largeY: 583, image: '/services/service-exhibition-visual.png' },
  { label: 'Art Direction', smallY: 750, largeY: 710, image: '/services/service-art-direction.png' },
];

function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeService, setActiveService] = useState<number | null>(null);
  const [displayedService, setDisplayedService] = useState<number | null>(null);
  const [imageVisible, setImageVisible] = useState(false);
  const activeServiceRef = useRef<number | null>(null);
  const displayedServiceRef = useRef<number | null>(null);
  const imageRequestRef = useRef(0);
  const swapTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const imageLoadsRef = useRef(new Map<number, Promise<boolean>>());

  const prepareImage = useCallback((index: number) => {
    const cached = imageLoadsRef.current.get(index);
    if (cached) return cached;
    const ready = new Promise<boolean>((resolve) => {
      const image = new Image();
      let settled = false;
      const finish = (success: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        if (!success) image.removeAttribute('src');
        resolve(success);
      };
      // A failed or stalled image leaves the last working image in place; no retry loop.
      const timeout = window.setTimeout(() => finish(false), 15000);
      image.onload = () => {
        image.decode().then(() => finish(true), () => finish(false));
      };
      image.onerror = () => finish(false);
      image.src = serviceItems[index].image;
    });
    imageLoadsRef.current.set(index, ready);
    return ready;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let observer: IntersectionObserver | null = null;
    let preloaded = false;
    const preloadImages = () => {
      if (preloaded) return;
      preloaded = true;
      observer?.disconnect();
      serviceItems.forEach((_, index) => { void prepareImage(index); });
    };
    if ('IntersectionObserver' in window && sectionRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) preloadImages();
      }, { rootMargin: '600px 0px' });
      observer.observe(sectionRef.current);
    } else {
      preloadImages();
    }

    return () => {
      mountedRef.current = false;
      observer?.disconnect();
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    };
  }, [prepareImage]);

  const activateService = (index: number) => {
    const request = ++imageRequestRef.current;
    activeServiceRef.current = index;
    setActiveService(index);
    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    swapTimerRef.current = null;
    if (displayedServiceRef.current !== null) setImageVisible(true);

    void prepareImage(index).then((ready) => {
      if (!ready || !mountedRef.current || imageRequestRef.current !== request
        || activeServiceRef.current !== index) return;
      // Keep the same image element and replace its source only after decoding.
      displayedServiceRef.current = index;
      setDisplayedService(index);
      setImageVisible(true);
    });
  };

  const deactivateServices = () => {
    imageRequestRef.current += 1;
    activeServiceRef.current = null;
    setActiveService(null);
    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    setImageVisible(false);
    swapTimerRef.current = window.setTimeout(() => {
      swapTimerRef.current = null;
      if (activeServiceRef.current !== null) return;
      displayedServiceRef.current = null;
      setDisplayedService(null);
    }, 90);
  };

  const serviceCenters = serviceItems.map((item) => item.largeY + 48);
  const hoverRows = serviceItems.map((_, index) => {
    const top = index === 0
      ? serviceCenters[index] - (serviceCenters[index + 1] - serviceCenters[index]) / 2
      : (serviceCenters[index - 1] + serviceCenters[index]) / 2;
    const bottom = index === serviceItems.length - 1
      ? serviceCenters[index] + (serviceCenters[index] - serviceCenters[index - 1]) / 2
      : (serviceCenters[index] + serviceCenters[index + 1]) / 2;
    return { top, height: bottom - top };
  });
  const hoverLayerTop = hoverRows[0].top;
  const hoverLayerHeight = hoverRows[hoverRows.length - 1].top
    + hoverRows[hoverRows.length - 1].height
    - hoverLayerTop;

  return (
    <section ref={sectionRef} className="services-section" aria-labelledby="services-title">
      <div className="services-section__stage">
        <p id="services-title" className="services-section__eyebrow">SERVICES · WHAT I DO</p>

        <div className="services-section__items">
          {serviceItems.map((item, index) => (
            <div
              className={`services-section__item${activeService === index ? ' services-section__item--active' : ''}`}
              key={item.label}
            >
              <span className="services-section__label" style={{ top: item.smallY }}>
                {item.label}
              </span>
              <span className="services-section__title" style={{ top: item.largeY }}>
                {item.label}
              </span>
            </div>
          ))}

          <div
            className="services-section__hover-layer"
            style={{ top: hoverLayerTop, height: hoverLayerHeight }}
            onMouseLeave={deactivateServices}
            aria-hidden="true"
          >
            {hoverRows.map((row, index) => (
              <span
                className="services-section__hover-row"
                key={serviceItems[index].label}
                style={{ top: row.top - hoverLayerTop, height: row.height }}
                onMouseEnter={() => activateService(index)}
              />
            ))}
          </div>
        </div>

        <div className="services-section__image" aria-hidden="true">
          {displayedService !== null && (
            <img
              className={`services-section__image-media${imageVisible ? ' services-section__image-media--visible' : ''}`}
              src={serviceItems[displayedService].image}
              alt=""
            />
          )}
        </div>
      </div>
    </section>
  );
}

const workItems = [
  { number: '01', department: '品牌部', company: '杭州朱炳仁铜艺股份有限公司', keywords: '铜艺 / 流动 / 跨界', logo: '/experience/exp-01-zbr-logo.png' },
  { number: '02', department: 'UED', company: '杭州有朋网络科技有限公司', keywords: '东方 / 收藏 / 内容', logo: '/experience/exp-02-dongjia-logo.png' },
  { number: '03', department: '品牌设计', company: '杭州栖牛茶楼有限公司', keywords: '新中式 / 简约 / 现代', logo: '/experience/exp-03-qiniu-logo.png' },
  { number: '04', department: '电商视觉', company: '杭州多赢网络科技有限公司', keywords: '电商 / 运营 / 转化', logo: '/experience/exp-04-duoying-logo.png' },
];

function WorkCard({ item }: { item: (typeof workItems)[number] }) {
  const isFirstExperience = item.number === '01';
  const isSecondExperience = item.number === '02';
  const isThirdExperience = item.number === '03';
  const isFourthExperience = item.number === '04';
  const isConfirmedExperience = isFirstExperience || isSecondExperience || isThirdExperience || isFourthExperience;

  return (
    <article className="my-work__card">
      <div className="my-work__card-index">
        <p><span className="my-work__card-visual">{isConfirmedExperience ? 'EXP' : 'Work'}<br /><strong>{item.number}</strong></span></p>
        <p>
          <span className="my-work__card-visual">
            {isSecondExperience ? '2021.03' : isThirdExperience ? '2019.01' : isFourthExperience ? '2018.01' : '2024.05'}<br />
            {isConfirmedExperience ? '—' : '～'}<br />
            {isSecondExperience ? '2023.10' : isThirdExperience ? '2020.12' : isFourthExperience ? '2019.01' : '2024.09'}
          </span>
        </p>
      </div>
      <div className="my-work__card-copy">
        <p className="my-work__card-lead">
          <span className="my-work__card-visual">
            {isFirstExperience
              ? '朱炳仁铜是中国当代铜艺领域具有代表性的文化品牌与企业，承袭国家级非物质文化遗产“铜雕技艺”，持续推动传统铜艺向当代生活转化。品牌与故宫博物院、敦煌美术研究所、中国航天等文化机构及 IP 展开合作，形成覆盖艺术、文创、零售与跨界合作的多元品牌体系。'
              : isSecondExperience
                ? '杭州有朋网络科技有限公司运营东家 APP，围绕东方文化、艺术收藏与生活方式内容，连接创作者、品牌与消费用户，并通过内容、电商及线上活动等形式构建文化消费场景。平台持续策划主题营销、品牌合作与线上专题，形成兼具内容传播与商业转化的运营体系。'
                : isThirdExperience
                  ? '杭州栖牛茶楼有限公司以线下茶楼空间、茶品及品牌传播为主要触点，围绕东方茶文化与当代消费场景展开品牌经营。通过门店空间、产品包装与传播物料等多类接触点，构建兼具新中式气质与现代商业感的品牌体验，并持续强化消费者对品牌形象与茶文化内容的认知。'
                  : '杭州多赢网络科技有限公司主要围绕电商平台运营及视觉内容展开业务，服务淘宝、京东及网易考拉海购等线上消费场景。通过店铺页面、活动专题、运营推广及产品展示等触点，为不同品类提供面向电商转化与平台传播的视觉内容支持。'}
          </span>
        </p>
        <p
          className="my-work__card-detail"
          style={isConfirmedExperience ? { color: '#949494', fontSize: '17px', lineHeight: 1.75 } : undefined}
        >
          {isFirstExperience
            ? <span className="my-work__card-visual">负责品牌营销与重点项目的视觉创意及落地，围绕品牌活动、文化展览、跨界合作与线下零售等场景，从创意概念、主视觉设计到多触点延展，建立统一的视觉表达。<br />期间参与中国国家博物馆朱炳仁艺术展、品牌升级、周年活动及门店营销等重点项目，覆盖线上传播、活动物料、展陈空间与零售终端，并协同策划、市场、空间及供应商团队推进项目落地。</span>
            : isSecondExperience
              ? <span className="my-work__card-visual">负责东家 APP 日常运营及重点 Campaign 的视觉设计与延展，围绕春秋拍、人人都是收藏家、主题拍卖及品牌联动等项目，完成主视觉、活动页面、H5 专题、海报及多端传播物料。<br />期间参与复星 515 家庭日等品牌合作项目，并承担线上展览、内容专题与 APP 运营页面设计，在高频迭代中延续平台统一的东方美学与文化内容气质，协同运营、策划与开发推进项目上线。</span>
              : isThirdExperience
                ? <span className="my-work__card-visual">负责品牌视觉体系升级及日常视觉设计，围绕线下门店、茶品包装与品牌传播等场景，从视觉语言梳理、主视觉设计到各类物料延展，持续建立简约、现代且具有新中式识别度的品牌视觉表达。<br />期间完成门店宣传物料、茶品包装及品牌推广视觉，并根据不同消费与空间场景进行应用延展，提升品牌视觉一致性与识别度，支持线下门店品牌体验的持续优化。</span>
                : <span className="my-work__card-visual">负责淘宝、京东及网易考拉海购等平台的电商视觉设计，覆盖店铺首页、商品详情、活动专题、运营海报及 UI 页面等内容，根据不同平台规范与营销节点完成视觉制作与页面延展。<br />期间持续参与日常运营与促销活动物料输出，在高频需求中完成多品类、多规格页面适配与上线交付，逐步建立从需求拆解、视觉执行到平台落地的完整电商设计流程。</span>}
        </p>
      </div>
      <div className="my-work__card-brand">
        <div className="my-work__logo my-work__card-visual">
          <img className="my-work__logo-image" src={item.logo} alt="" aria-hidden="true" />
        </div>
        <p><span className="my-work__card-visual">{item.company}</span></p>
        <p><span className="my-work__card-visual">{item.keywords}</span></p>
      </div>
    </article>
  );
}

function WorkMeta({ item }: { item: (typeof workItems)[number] }) {
  return (
    <aside className="my-work__meta">
      <div className="my-work__meta-visual">
        <div className="my-work__meta-inner">
          <span className="my-work__pill" style={item.number === '04' ? { width: '106px' } : undefined}>{item.department}</span>
          <div className="my-work__meta-detail-clip">
            <div className="my-work__meta-detail">
              <h3>{item.number === '01' ? '品牌营销视觉设计' : item.number === '03' ? '品牌视觉设计' : item.number === '04' ? '电商视觉设计' : '品牌营销视觉'}</h3>
              <p>
                {item.number === '01'
                  ? <>创意概念<br />活动视觉<br />文化展览<br />跨界联动<br />零售触点</>
                  : item.number === '02'
                    ? <>活动视觉<br />APP 运营<br />H5 专题<br />东方美学<br />多端延展</>
                    : item.number === '03'
                      ? <>品牌升级<br />门店视觉<br />茶品包装<br />新中式简约<br />视觉延展</>
                      : <>店铺视觉<br />活动页面<br />运营海报<br />UI 界面<br />多平台适配</>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MyWorkSection() {
  const motionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = motionRef.current;
    if (!motion) return;

    const cardLayers = Array.from(motion.querySelectorAll<HTMLElement>('.my-work__card-layer'));
    const metaGroups = Array.from(motion.querySelectorAll<HTMLElement>('.my-work__meta'));
    const metaDetails = Array.from(motion.querySelectorAll<HTMLElement>('.my-work__meta-detail'));
    const section = motion.closest<HTMLElement>('.my-work');
    const headingGroup = section?.querySelector<HTMLElement>('.my-work__heading-group');
    const heroTitle = section?.querySelector<HTMLElement>('.my-work__hero h2');
    const heroCaptions = Array.from(section?.querySelectorAll<HTMLElement>('.my-work__hero-caption p') ?? []);
    let frame = 0;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const smoothstep = (value: number) => {
      const progress = clamp(value);
      return progress * progress * (3 - 2 * progress);
    };

    const update = () => {
      frame = 0;
      if (cardLayers.length < 2) return;

      if (headingGroup && heroTitle && heroCaptions.length >= 2) {
        const revealStart = window.innerHeight * 0.76;
        const revealEnd = window.innerHeight * -0.2;
        const revealScroll = clamp((revealStart - headingGroup.getBoundingClientRect().top) / (revealStart - revealEnd));
        const reveal = 1 - (1 - revealScroll) ** 2;
        const revealBand = 200;
        const revealBoundary = (1 - reveal) * (heroTitle.offsetHeight + revealBand) - revealBand;
        const careerReveal = smoothstep((reveal - 0.75) / 0.16);
        const professionalReveal = smoothstep((reveal - 0.82) / 0.12);

        heroTitle.style.setProperty('--my-work-reveal-y', `${revealBoundary.toFixed(3)}px`);
        heroCaptions[0].style.setProperty('--my-work-caption-opacity', careerReveal.toFixed(4));
        heroCaptions[0].style.setProperty('--my-work-caption-y', `${((1 - careerReveal) * 16).toFixed(3)}px`);
        heroCaptions[1].style.setProperty('--my-work-caption-opacity', professionalReveal.toFixed(4));
        heroCaptions[1].style.setProperty('--my-work-caption-y', `${((1 - professionalReveal) * 18).toFixed(3)}px`);
      }

      const stickyTop = Number.parseFloat(window.getComputedStyle(cardLayers[0]).top) || 0;
      const progresses = cardLayers.slice(0, -1).map((layer, index) => {
        const layerHeight = layer.getBoundingClientRect().height;
        const incomingTop = cardLayers[index + 1].getBoundingClientRect().top;
        return clamp((stickyTop + layerHeight - incomingTop) / layerHeight);
      });

      cardLayers.forEach((layer, index) => {
        const takeover = progresses[index] ?? 0;
        const outgoing = smoothstep(takeover);
        layer.style.setProperty('--work-card-brightness', (1 - outgoing * 0.34).toFixed(4));
        layer.style.setProperty('--work-card-saturation', (1 - outgoing * 0.72).toFixed(4));
        layer.style.setProperty('--work-card-blur', `${(outgoing * 2.1).toFixed(3)}px`);
      });

      metaGroups.forEach((meta, index) => {
        const takeover = progresses[index] ?? 0;
        const detailCollapse = smoothstep(takeover / 0.45);
        const pillFade = smoothstep((takeover - 0.35) / 0.35);
        const detailHeight = metaDetails[index]?.scrollHeight ?? 0;
        const detailTravel = detailHeight + 12;
        const metaTop = meta.getBoundingClientRect().top;
        const anchorCompensation = takeover > 0 ? Math.max(0, stickyTop - metaTop) : 0;
        meta.style.setProperty('--work-meta-anchor-y', `${anchorCompensation.toFixed(3)}px`);
        meta.style.setProperty('--work-meta-detail-y', `${(-detailCollapse * detailTravel).toFixed(3)}px`);
        meta.style.setProperty('--work-meta-pill-opacity', (1 - pillFade).toFixed(4));
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="my-work" aria-labelledby="my-work-title">
      <div className="my-work__stage">
        <header className="my-work__hero">
          <div className="my-work__heading-group">
            <h2 id="my-work-title">My Work</h2>
            <div className="my-work__hero-caption">
              <p>CAREER · HISTORY</p>
              <p>Professional Experience</p>
            </div>
          </div>
        </header>
      </div>

      <div className="my-work__motion" ref={motionRef}>
        <span className="my-work__rail" aria-hidden="true" />

        <div className="my-work__meta-list">
          {workItems.map((item) => (
            <div className="my-work__meta-chapter" key={item.number}>
              <WorkMeta item={item} />
            </div>
          ))}
        </div>

        <div className="my-work__card-stack">
          {workItems.map((item, index) => (
            <div
              className="my-work__card-layer"
              key={item.number}
              style={{ zIndex: index + 1 }}
            >
              <WorkCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const contactMethods = [
  {
    label: 'EMAIL ADDRESS',
    value: 'shuaikang.1104@gmail.com',
    note: '谷歌邮箱',
  },
  {
    label: 'MOBILE PHONE NUMBER & WECHAT',
    value: '15558121106',
    note: '手机账号&微信',
  },
];

function ContactFooterSection() {
  const ctaRevealRef = useRef<HTMLDivElement>(null);
  const connectRevealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closing = ctaRevealRef.current;
    const trigger = closing?.querySelector('.contact-footer__statement');
    if (!closing || !trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        closing.classList.add('contact-footer__closing--revealed');
        observer.disconnect();
      },
      { rootMargin: '0px 0px -22% 0px', threshold: 0 },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const connect = connectRevealRef.current;
    const trigger = connect?.querySelector('.contact-footer__connect-title');
    if (!connect || !trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        connect.classList.add('contact-footer__connect--revealed');
        observer.disconnect();
      },
      { rootMargin: '0px 0px -22% 0px', threshold: 0 },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="contact-footer" aria-labelledby="contact-footer-title">
      <div className="contact-footer__stage">
        <div className="contact-footer__closing" ref={ctaRevealRef}>
          <div className="contact-footer__statement" id="contact-footer-title">
            <span className="contact-footer__paren contact-footer__paren--left" aria-hidden="true">(</span>
            <div className="contact-footer__statement-copy">
              <p><span>Have </span><span className="contact-footer__muted">something</span><span> meaningful</span></p>
              <p><span>in mind? Let’s </span><span className="contact-footer__muted">bring</span><span> it to life</span></p>
              <p>together.</p>
            </div>
            <span className="contact-footer__paren contact-footer__paren--right" aria-hidden="true">)</span>
          </div>
          <p className="contact-footer__intro">心怀一个值得实现的想法？让我们一起让它实现。</p>
        </div>

        <div id="contact-connect" className="contact-footer__connect" ref={connectRevealRef}>
          <header className="contact-footer__connect-title">
            <p>RECENT · PROJECTS</p>
            <h2>Connect Me</h2>
          </header>

          <div className="contact-footer__methods">
            {contactMethods.map((method) => (
              <div className="contact-footer__method" key={method.label}>
                <span className="contact-footer__dot" aria-hidden="true" />
                <div>
                  <p className="contact-footer__method-label">{method.label}</p>
                  <p className="contact-footer__method-value">{method.value}</p>
                  <p className="contact-footer__method-note">{method.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-footer__marquee" aria-label="FROM INSIGHT TO SYSTEM, FROM SYSTEM TO EXPERIENCE">
          <div className="contact-footer__marquee-track" style={{ animationDuration: "44s" }}>
            <p className="contact-footer__marquee-copy">FROM INSIGHT TO SYSTEM, FROM SYSTEM TO EXPERIENCE</p>
            <p className="contact-footer__marquee-copy" aria-hidden="true">FROM INSIGHT TO SYSTEM, FROM SYSTEM TO EXPERIENCE</p>
          </div>
        </div>

        <footer className="contact-footer__meta">
          <div>
            <p>Brand Design / Campaign Visual / Experience Design</p>
            <p>SELECTED WORKS 2017—2026</p>
          </div>
          <div>
            <p>04&nbsp; Selected Projects</p>
            <p>02&nbsp; Professional Skills</p>
          </div>
          <p>From a core idea, build a distinctive visual system<br />across every touchpoint.</p>
          <div className="contact-footer__meta-index">
            <div><b>01</b><p><span>视觉</span><span>Visual System</span></p></div>
            <i aria-hidden="true" />
            <div><b>02</b><p><span>传播</span><span>Campaign Visual</span></p></div>
            <i aria-hidden="true" />
            <div><b>03</b><p><span>体验</span><span>Brand Experience</span></p></div>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default function Home() {
  const rootChildren = useMemo(
    () => (Array.isArray(spec.paintTree?.children) ? spec.paintTree.children : []),
    [],
  );

  return (
    <>
      <FloatingPillNavigation />
      <main
        id="psd-stage"
        aria-label="PSD stage"
      >
        <div
          aria-hidden="true"
          className="psd-canvas"
        >
          {rootChildren.map((child, index) => renderPaintNode(child, index))}
          <div className="hero-visual" aria-hidden="true">
            <HeroMarqueeBand direction="top">FROM A SINGLE IDEA TO A DISTINCT VISUAL WORLD</HeroMarqueeBand>
            <div className="hero-visual__side-clip hero-visual__side-clip--left">
              <div className="hero-visual__character hero-visual__character--left">
                <img
                  className="hero-visual__character-layer hero-visual__character-layer--dark"
                  src="/hero-art/force-dark.png"
                  alt=""
                />
                <img
                  className="hero-visual__character-layer hero-visual__character-layer--light"
                  src="/hero-art/force-light.png"
                  alt=""
                />
              </div>
            </div>
            <div className="hero-visual__side-clip hero-visual__side-clip--right">
              <div className="hero-visual__character hero-visual__character--right">
                <img
                  className="hero-visual__character-layer hero-visual__character-layer--dark"
                  src="/hero-art/form-dark.png"
                  alt=""
                />
                <img
                  className="hero-visual__character-layer hero-visual__character-layer--light"
                  src="/hero-art/form-light.png"
                  alt=""
                />
              </div>
            </div>
            <HeroStructureParallax />
            <HeroMarqueeBand direction="bottom">ACROSS SCREENS, SPACES AND EVERY BRAND TOUCHPOINT</HeroMarqueeBand>
          </div>
          <div className="hero-meta" aria-hidden="true">
            <div className="hero-meta__identity">
              <p>Brand Design / Campaign Visual / Experience Design</p>
              <p>SELECTED WORKS 2017—2026</p>
            </div>
            <div className="hero-meta__skills">
              <p>04&nbsp; Selected Projects</p>
              <p>02&nbsp; Professional Skills</p>
            </div>
            <p className="hero-meta__statement">
              From a core idea, build a distinctive visual system<br />
              across every touchpoint.
            </p>
            <div className="hero-meta__item hero-meta__item--one">
              <p>01</p>
              <p><span>视觉</span><span>Visual System</span></p>
            </div>
            <div className="hero-meta__item hero-meta__item--two">
              <p>02</p>
              <i aria-hidden="true" />
              <p><span>传播</span><span>Campaign Visual</span></p>
            </div>
            <div className="hero-meta__item hero-meta__item--three">
              <p>03</p>
              <i aria-hidden="true" />
              <p><span>体验</span><span>Brand Experience</span></p>
            </div>
          </div>
          <div className="hero-bottom-line" aria-hidden="true" />
        </div>
      </main>
      <LocalSpotlights />
      <DesignContextSection />
      <AboutSection />
      <TrustSection />
      <FeaturedWorkSection />
      <ServicesSection />
      <MyWorkSection />
      <ContactFooterSection />
    </>
  );
}
