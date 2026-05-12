"use client";

import type { MotionValue } from "framer-motion";
import { motion, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const SECTION_IDS = [
  "capability-preview",
  "manifesto",
  "selected-cases",
  "project-system",
  "work-flow",
  "about",
  "contact",
] as const;

const SECTION_TO_NAV_KEY: Record<(typeof SECTION_IDS)[number], string> = {
  "capability-preview": "capability",
  manifesto: "manifesto",
  "selected-cases": "work",
  "project-system": "system",
  "work-flow": "work",
  about: "about",
  contact: "contact",
};

const NAV_ITEMS = [
  { navKey: "capability", label: "Capability", scrollId: "capability-preview" },
  { navKey: "manifesto", label: "Manifesto", scrollId: "manifesto" },
  { navKey: "work", label: "Work", scrollId: "selected-cases" },
  { navKey: "system", label: "System", scrollId: "project-system" },
  { navKey: "about", label: "About", scrollId: "about" },
  { navKey: "contact", label: "Contact", scrollId: "contact" },
] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type FloatingNavProps = {
  /** 全局滚动进度，用于轻微漂浮与玻璃亮度 */
  scrollProgress: MotionValue<number>;
};

export function FloatingNav({ scrollProgress }: FloatingNavProps) {
  const [activeNavKey, setActiveNavKey] = useState<string | null>(null);

  const navY = useTransform(scrollProgress, [0, 0.16, 1], [6, 0, -2]);
  const navGlow = useTransform(scrollProgress, [0, 0.16, 1], [0.5, 0.82, 0.72]);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target?.id as (typeof SECTION_IDS)[number] | undefined;
        if (id && SECTION_TO_NAV_KEY[id]) {
          setActiveNavKey(SECTION_TO_NAV_KEY[id]);
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0.02, 0.2, 0.55] },
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ y: navY }}
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-3 pb-[env(safe-area-inset-bottom)]"
    >
      <motion.nav
        style={{ opacity: navGlow }}
        className="pointer-events-auto relative flex max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-white/[0.075] bg-black/25 px-1.5 py-1.5 font-mono shadow-[0_0_0_1px_rgba(255,255,255,0.025)_inset,0_18px_54px_rgba(0,0,0,0.36)] backdrop-blur-2xl backdrop-saturate-[1.35] [scrollbar-width:none]"
        aria-label="Primary"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(255,255,255,0.08),transparent_56%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-65"
          aria-hidden
        />

        <button
          type="button"
          onClick={() => {
            setActiveNavKey(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="relative z-[1] shrink-0 rounded-full px-3 py-1.5 text-[9px] font-normal uppercase tracking-[0.24em] text-zinc-400/75 tabular-nums transition-colors hover:text-zinc-100"
        >
          Index
        </button>
        <span
          className="relative z-[1] mx-0.5 h-3 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent"
          aria-hidden
        />
        {NAV_ITEMS.map((link) => {
          const isActive = activeNavKey === link.navKey;
          return (
            <button
              key={link.navKey}
              type="button"
              onClick={() => scrollToId(link.scrollId)}
              className="relative z-[1] shrink-0 rounded-full px-3 py-1.5 text-[9px] font-normal uppercase tracking-[0.2em] text-zinc-400/75 tabular-nums transition-colors hover:text-zinc-100"
            >
              {isActive ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ring-1 ring-white/[0.06] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10">{link.label}</span>
            </button>
          );
        })}
      </motion.nav>
    </motion.header>
  );
}
