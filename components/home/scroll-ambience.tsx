"use client";

import type { MotionValue } from "framer-motion";
import { motion, useMotionTemplate, useTransform } from "framer-motion";

/**
 * 固定层：黑阶渐变、scroll-linked 游移柔光、极弱数字网格、呼吸层。
 * 无 WebGL，纯 CSS + motion。
 */
export function ScrollAmbience({ progress }: { progress: MotionValue<number> }) {
  const p = progress;

  const ax = useTransform(p, [0, 0.45, 1], [22, 48, 76]);
  const ay = useTransform(p, [0, 0.5, 1], [28, 42, 68]);
  const glowPrimary = useMotionTemplate`radial-gradient(ellipse 130% 95% at ${ax}% ${ay}%, rgba(118, 128, 168, 0.2), transparent 58%)`;

  const bx = useTransform(p, [0, 1], [78, 26]);
  const by = useTransform(p, [0, 1], [62, 22]);
  const glowSecondary = useMotionTemplate`radial-gradient(ellipse 90% 75% at ${bx}% ${by}%, rgba(70, 82, 110, 0.12), transparent 52%)`;

  const vignetteLift = useTransform(p, [0, 0.35], [0.72, 0.88]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      {/* 基底黑阶 */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#010101_0%,#050508_42%,#020203_100%)]" />
      {/* 极弱冷边，增加空间深度 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_100%_0%,rgba(30,32,42,0.55),transparent_55%),radial-gradient(ellipse_90%_80%_at_0%_100%,rgba(12,12,16,0.9),transparent_50%)]" />

      {/* Scroll-linked 主光 */}
      <motion.div className="absolute inset-0 mix-blend-screen" style={{ background: glowPrimary }} />
      <motion.div className="absolute inset-0 opacity-80" style={{ background: glowSecondary }} />

      {/* 数字空气：极淡网格 */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 40%, black 10%, transparent 75%)",
        }}
      />

      {/* 呼吸：慢周期第二层柔光 */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_88%,rgba(90,95,120,0.09),transparent_60%)]"
        animate={{ opacity: [0.35, 0.85, 0.35] }}
        transition={{
          duration: 6.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* 电影暗角：随滚动略抬，避免死黑一块 */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_72%_72%_at_50%_45%,transparent_0%,rgba(0,0,0,0.52)_78%,#000000_100%)]"
        style={{ opacity: vignetteLift }}
      />
    </div>
  );
}
