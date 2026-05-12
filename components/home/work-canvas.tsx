"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

type WorkCanvasProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * 项目主画面容器：无边框硬线，玻璃叠层 + 内发光 + 轻视差。
 */
export function WorkCanvas({ children, className = "" }: WorkCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 38, damping: 34 });
  const innerY = useTransform(smooth, [0, 1], [12, -10]);
  const innerBright = useTransform(smooth, [0, 0.5, 1], [0.55, 1, 0.62]);

  return (
    <motion.div
      ref={ref}
      className={`relative min-h-[50dvh] w-full overflow-hidden rounded-[1.5rem] md:rounded-[1.875rem] ${className}`}
    >
      {/* 玻璃体积：无描边，靠渐变与 blur 分界 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.055] via-zinc-950/25 to-black/55" />
      <div className="absolute inset-0 backdrop-blur-xl backdrop-saturate-125" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(255,255,255,0.06),transparent_55%)]" />

      {/* 内缘柔光扫过（scroll-linked 强度） */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(130,138,170,0.12),transparent_65%)]"
        style={{ opacity: innerBright }}
      />

      <motion.div
        className="relative z-[1] flex min-h-[50dvh] w-full flex-col"
        style={{ y: innerY }}
      >
        {children ?? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-20">
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600 tabular-nums">
              Media layer
            </span>
            <span className="max-w-xs text-center font-sans text-xs font-light leading-relaxed text-zinc-500">
              画面接入区 — 无硬边框，由光与雾界定体积
            </span>
          </div>
        )}
      </motion.div>

      {/* 底缘消隐进黑场 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
    </motion.div>
  );
}
