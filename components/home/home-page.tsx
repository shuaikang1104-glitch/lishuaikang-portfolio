"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { FloatingNav } from "./floating-nav";
import { ScrollAmbience } from "./scroll-ambience";
import { WorkCanvas } from "./work-canvas";

const sectionEase = [0.22, 1, 0.36, 1] as const;

const CAPABILITIES = [
  {
    lane: "01",
    title: "运营设计",
    titleEn: "Operational Design",
    body: "把长期运营中的高频触点、活动节奏与页面资产收束成稳定的视觉秩序。",
    projects: [
      { name: "人人都是收藏家", meta: "春拍主视觉 / 全链路运营", src: "/works/project-01/hero.png" },
      { name: "拍卖节点资产", meta: "频道视觉 / 物料延展", src: "/works/project-01/part-05/detail-01.png" },
      { name: "用户路径视觉", meta: "信息层级 / 交易氛围", src: "/works/project-01/part-02/detail-01.png" },
    ],
  },
  {
    lane: "02",
    title: "品牌视觉系统",
    titleEn: "Brand Visual System",
    body: "在东方语境、材料质感与当代界面之间建立可延展的品牌识别语言。",
    projects: [
      { name: "朱炳仁铜艺", meta: "展陈 / 投放 / 品牌视觉", src: "/works/project-02/hero.png" },
      { name: "熔铜十八周年", meta: "主题 KV / 视觉延展", src: "/works/project-02/part-01/detail-01.png" },
      { name: "品牌界面秩序", meta: "图形系统 / 版式规则", src: "/works/project-02/part-03/detail-01.png" },
    ],
  },
  {
    lane: "03",
    title: "宣传物料设计",
    titleEn: "Campaign & Materials",
    body: "在商业传播、活动物料与视觉叙事之间建立节奏，让单次传播沉淀为品牌资产。",
    projects: [
      { name: "515 家庭日", meta: "Campaign KV / 传播物料", src: "/works/project-03/hero.png" },
      { name: "线下活动物料", meta: "主视觉 / 触点延展", src: "/works/project-03/detail-01.png" },
      { name: "节日传播资产", meta: "节奏 / 情绪 / 识别", src: "/works/project-03/detail-03.png" },
    ],
  },
] as const;

const SECONDARY_WORKS = [
  {
    no: "02",
    title: "朱炳仁铜艺",
    label: "Brand visual system",
    summary: "以铜的材料性、展陈语境与数字传播界面并置，建立更当代的东方工艺品牌表达。",
    src: "/works/project-02/hero.png",
  },
  {
    no: "03",
    title: "515 家庭日",
    label: "Campaign & materials",
    summary: "用更轻的情绪线索组织节日传播，把活动主视觉、物料与触点统一成可感知的节奏。",
    src: "/works/project-03/hero.png",
  },
  {
    no: "04",
    title: "运营视觉资产流",
    label: "Operational assets",
    summary: "围绕频道、节点与商品信息建立可复用的版式框架，让日常运营不失去品牌质感。",
    src: "/works/project-01/part-04/detail-01.png",
  },
] as const;

const PROJECT_SYSTEM = [
  {
    title: "项目视觉系统",
    label: "Visual grammar",
    body: "围绕「收藏」建立主视觉、字体、色彩与版式的基础语法。",
    src: "/works/project-01/system/system-01.png",
  },
  {
    title: "品牌规范",
    label: "Brand rules",
    body: "限定字标、比例、留白与组合方式，保证运营延展中的稳定识别。",
    src: "/works/project-01/system/logo-01.png",
  },
  {
    title: "KV 延展",
    label: "Key visual extension",
    body: "从主 KV 拆分出频道页、活动图、内容封面与社媒触点。",
    src: "/works/project-01/system/system-03.png",
  },
  {
    title: "界面语言",
    label: "Interface language",
    body: "把视觉规范落到信息模块、商品叙事与交易场景的界面秩序中。",
    src: "/works/project-01/system/system-04.png",
  },
] as const;

function SectionBleed({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative z-10 scroll-mt-24 ${className}`}>
      {children}
    </section>
  );
}

function EyebrowEn({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-normal uppercase tracking-[0.32em] text-zinc-500 tabular-nums">
      {children}
    </p>
  );
}

function SectionReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-16%" }}
      transition={{ duration: 1.05, ease: sectionEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AmbientDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative z-10 h-[8vh] overflow-hidden bg-black ${className}`}
      aria-hidden
    >
      <motion.div
        className="absolute inset-x-[-20%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  );
}

function MediaImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1280px) 1200px, 96vw"
      className={`object-cover ${className}`}
    />
  );
}

function HeroCapabilityMap() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.95, ease: sectionEase }}
      className="mt-12 grid w-full max-w-5xl gap-5 border-t border-white/[0.08] pt-7 md:grid-cols-3 md:gap-8"
      role="group"
      aria-label="Core design capabilities"
    >
      {CAPABILITIES.map((capability) => (
        <a
          href="#capability-preview"
          key={capability.lane}
          className="group relative block overflow-hidden rounded-[1.25rem] border border-white/[0.045] bg-white/[0.025] p-5 transition-colors duration-500 hover:bg-white/[0.055]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-zinc-200/10 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600 tabular-nums">
            Capability {capability.lane}
          </p>
          <h2 className="mt-5 font-serif-cn text-xl font-medium tracking-[0.02em] text-zinc-200">
            {capability.title}
          </h2>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
            {capability.titleEn}
          </p>
          <p className="mt-5 max-w-xs font-sans text-[12px] font-light leading-relaxed text-zinc-500">
            {capability.body}
          </p>
        </a>
      ))}
    </motion.div>
  );
}

function CapabilityPreview() {
  return (
    <SectionBleed
      id="capability-preview"
      className="bg-[linear-gradient(180deg,#000000,#040406_45%,#010101)] px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <SectionReveal className="mx-auto max-w-[min(96vw,1280px)]">
        <div className="mb-12 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <EyebrowEn>Capability archive</EyebrowEn>
            <h2 className="mt-6 font-serif-cn text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-100 md:text-5xl">
              三种能力不是三个项目，而是一套完整的视觉工作方式。
            </h2>
          </div>
          <p className="max-w-xl font-sans text-sm font-light leading-[1.9] text-zinc-500 md:justify-self-end">
            每个方向都对应多个真实触点：从主视觉到系统规范，从频道运营到传播物料，形成可持续的品牌视觉资产。
          </p>
        </div>

        <div className="grid gap-10">
          {CAPABILITIES.map((capability) => (
            <div
              key={capability.lane}
              className="group grid gap-5 border-t border-white/[0.07] pt-6 md:grid-cols-[0.42fr_1fr] md:gap-8"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-600 tabular-nums">
                  {capability.lane} · {capability.titleEn}
                </p>
                <h3 className="mt-4 font-serif-cn text-2xl font-medium text-zinc-200">
                  {capability.title}
                </h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {capability.projects.map((project) => (
                  <div
                    key={project.name}
                    className="relative overflow-hidden rounded-[1.125rem] bg-white/[0.025] p-2 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.05]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[0.875rem] bg-zinc-950">
                      <MediaImage
                        src={project.src}
                        alt={project.name}
                        className="opacity-70 saturate-[0.78] transition duration-700 hover:scale-[1.04] hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
                    </div>
                    <div className="px-2 pb-2 pt-4">
                      <p className="font-serif-cn text-base font-medium text-zinc-300">
                        {project.name}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-zinc-600">
                        {project.meta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>
    </SectionBleed>
  );
}

function CaseMedia({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <WorkCanvas className={`min-h-[50dvh] md:min-h-[58dvh] ${className}`}>
      <div className="relative min-h-[50dvh] md:min-h-[58dvh]">
        <MediaImage src={src} alt={alt} className="opacity-86 saturate-[0.82]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.2)_70%,rgba(0,0,0,0.52))]" />
      </div>
    </WorkCanvas>
  );
}

function MainCase() {
  return (
    <SectionBleed
      id="selected-cases"
      className="bg-[linear-gradient(180deg,#010101,#030304_32%,#000000)] px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <SectionReveal className="mx-auto max-w-[min(96vw,1280px)]">
        <header className="mb-10 grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:gap-16">
          <div className="border-t border-white/[0.08] pt-5">
            <EyebrowEn>Main Case · 01</EyebrowEn>
            <p className="mt-5 max-w-xs font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-zinc-600">
              Operational design · Brand rules · Campaign interface
            </p>
          </div>
          <div>
            <p className="max-w-3xl font-serif-cn text-2xl font-light leading-[1.58] tracking-[0.02em] text-zinc-400 md:text-[2rem]">
              把「人人都是收藏家」从一句活动口号，扩展成覆盖运营、品牌规范与界面语言的视觉系统。
            </p>
            <h2 className="mt-8 font-serif-cn text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-zinc-50 md:text-7xl">
              人人都是收藏家
            </h2>
            <p className="mt-5 max-w-xl font-sans text-sm font-light leading-relaxed text-zinc-500">
              东家 · 春季拍卖会。主视觉、活动页面、运营触点、品牌规范与传播资产的系统化设计。
            </p>
          </div>
        </header>
        <CaseMedia src="/works/project-01/hero.png" alt="人人都是收藏家项目主视觉" />
      </SectionReveal>
    </SectionBleed>
  );
}

function ProjectSystemSection() {
  return (
    <SectionBleed
      id="project-system"
      className="overflow-hidden bg-[linear-gradient(180deg,#000000,#050506_46%,#010101)] px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <motion.div
        className="pointer-events-none absolute left-1/2 top-10 h-64 w-[80vw] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.075),transparent)] blur-3xl"
        animate={{ x: ["-8%", "8%", "-8%"] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <SectionReveal className="mx-auto max-w-[min(96vw,1280px)]">
        <div className="mb-12 grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:gap-16">
          <div>
            <EyebrowEn>Inside Case 01</EyebrowEn>
            <h2 className="mt-6 font-serif-cn text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-100 md:text-5xl">
              项目视觉系统拆解
            </h2>
          </div>
          <p className="max-w-2xl font-sans text-sm font-light leading-[1.9] text-zinc-500">
            这里不是个人作品集的全站视觉规范，而是「人人都是收藏家」项目内部的设计规范：从品牌规范到 KV 延展，再落到界面语言。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {PROJECT_SYSTEM.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-14%" }}
              transition={{ duration: 0.8, delay: index * 0.08, ease: sectionEase }}
              className="group relative overflow-hidden rounded-[1.25rem] border border-white/[0.055] bg-white/[0.025] p-3"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-zinc-950">
                <MediaImage
                  src={item.src}
                  alt={item.title}
                  className="opacity-72 saturate-[0.75] transition duration-700 group-hover:scale-[1.035] group-hover:opacity-88"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_0%,rgba(255,255,255,0.1),transparent_58%)] opacity-70" />
              </div>
              <div className="p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                  {item.label}
                </p>
                <h3 className="mt-4 font-serif-cn text-xl font-medium text-zinc-200">
                  {item.title}
                </h3>
                <p className="mt-3 font-sans text-[12px] font-light leading-relaxed text-zinc-500">
                  {item.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </SectionReveal>
    </SectionBleed>
  );
}

function SecondaryWorkFlow() {
  return (
    <SectionBleed
      id="work-flow"
      className="bg-[linear-gradient(180deg,#010101,#030305_50%,#000000)] px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <SectionReveal className="mx-auto max-w-[min(96vw,1280px)]">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <EyebrowEn>Work flow</EyebrowEn>
            <h2 className="mt-6 max-w-2xl font-serif-cn text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-100 md:text-5xl">
              主案例之后，是持续输出的次级项目流。
            </h2>
          </div>
          <p className="max-w-md font-sans text-sm font-light leading-[1.85] text-zinc-500">
            不做 Behance 网格，而用横向档案流呈现不同商业场景下的视觉判断。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {SECONDARY_WORKS.map((work) => (
            <article
              key={work.title}
              className="group relative overflow-hidden rounded-[1.5rem] bg-white/[0.025] p-3 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.15rem] bg-zinc-950">
                <MediaImage
                  src={work.src}
                  alt={work.title}
                  className="opacity-72 saturate-[0.78] transition duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.58))]" />
                <p className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                  {work.no}
                </p>
              </div>
              <div className="grid gap-5 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                  {work.label}
                </p>
                <h3 className="font-serif-cn text-2xl font-medium text-zinc-100">
                  {work.title}
                </h3>
                <p className="font-sans text-[13px] font-light leading-relaxed text-zinc-500">
                  {work.summary}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionReveal>
    </SectionBleed>
  );
}

function StudioProfile() {
  return (
    <SectionBleed
      id="about"
      className="bg-[linear-gradient(180deg,#000000,#040404_52%,#010101)] px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <SectionReveal className="mx-auto grid max-w-[min(96vw,1180px)] gap-12 md:grid-cols-[0.72fr_1.28fr] md:gap-20">
        <div>
          <EyebrowEn>Studio profile</EyebrowEn>
          <h2 className="mt-8 font-serif-cn text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-zinc-100 md:text-6xl">
            以设计工作室的方式，处理品牌的长期视觉资产。
          </h2>
        </div>
        <div className="space-y-8 border-t border-white/[0.08] pt-8 md:border-l md:border-t-0 md:pl-16 md:pt-0">
          <p className="text-pretty font-serif-cn text-xl font-light leading-[1.75] tracking-[0.02em] text-zinc-300">
            聚焦品牌视觉系统、运营视觉秩序与商业传播材料。不是单张海报式输出，而是把每一次项目沉淀为可复用、可延展、可识别的视觉语言。
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {["Brand interface", "Campaign rhythm", "Eastern restraint"].map((item) => (
              <div key={item} className="border-t border-white/[0.06] pt-4">
                <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-zinc-600">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <dl className="grid gap-5 pt-2 font-sans text-sm text-zinc-500">
            <div className="flex justify-between gap-8 border-b border-white/[0.06] pb-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                Role
              </dt>
              <dd className="text-right text-zinc-400">Senior visual designer</dd>
            </div>
            <div className="flex justify-between gap-8 border-b border-white/[0.06] pb-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                Focus
              </dt>
              <dd className="text-right text-zinc-400">
                Brand system · Operation · Materials
              </dd>
            </div>
          </dl>
        </div>
      </SectionReveal>
    </SectionBleed>
  );
}

function ContactEnding() {
  return (
    <SectionBleed
      id="contact"
      className="min-h-[58dvh] overflow-hidden bg-black px-6 pb-28 pt-16 md:px-12 md:pb-32 md:pt-20 lg:px-16"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_80%_48%_at_50%_88%,rgba(110,116,145,0.2),transparent_62%)]"
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <SectionReveal className="relative mx-auto flex min-h-[44dvh] max-w-[min(96vw,1280px)] flex-col justify-end border-t border-white/[0.08] pt-8">
        <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr] md:items-end">
          <div>
            <EyebrowEn>End frame</EyebrowEn>
            <h2 className="mt-8 max-w-4xl font-serif-cn text-[clamp(3rem,10vw,8rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-zinc-50">
              让品牌视觉成为长期秩序。
            </h2>
          </div>
          <div className="md:text-right">
            <p className="font-mono text-xl tracking-tight text-zinc-200 tabular-nums md:text-2xl">
              hello@placeholder.design
            </p>
            <p className="mt-5 font-sans text-sm font-light leading-relaxed text-zinc-600">
              Brand visual system / campaign / operational design
            </p>
          </div>
        </div>
      </SectionReveal>
    </SectionBleed>
  );
}

export function HomePage() {
  const { scrollYProgress } = useScroll();
  const scrollSmooth = useSpring(scrollYProgress, {
    stiffness: 28,
    damping: 32,
    mass: 0.35,
  });

  const heroY = useTransform(scrollSmooth, [0, 0.22], [0, 46]);
  const heroScale = useTransform(scrollSmooth, [0, 0.26], [1, 0.94]);
  const heroOpacity = useTransform(scrollSmooth, [0, 0.22], [1, 0.78]);
  const heroBloom = useTransform(scrollSmooth, [0, 0.18], [0.24, 0.06]);

  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden text-zinc-100">
      <ScrollAmbience progress={scrollSmooth} />
      <FloatingNav scrollProgress={scrollSmooth} />

      <motion.div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-transparent via-zinc-300/25 to-transparent"
        style={{ scaleX: scrollYProgress }}
        aria-hidden
      />

      <section
        id="hero"
        className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-20 md:pt-28 lg:px-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_68%_46%_at_50%_108%,rgba(0,0,0,0.78),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_62%_at_50%_-10%,rgba(95,100,130,0.18),transparent_58%)]" />

        <motion.div
          className="relative max-w-[min(98vw,1320px)]"
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
        >
          <motion.div
            className="pointer-events-none absolute -left-[8%] top-[16%] h-[42%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(130,138,175,0.14),transparent_68%)] blur-3xl"
            style={{ opacity: heroBloom }}
          />
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.1, delayChildren: 0.08 },
              },
            }}
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.85, ease: sectionEase }}
              className="mb-9 max-w-md font-sans text-[11px] font-normal uppercase tracking-[0.24em] text-zinc-500"
            >
              Visual designer · system / operation / materials
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 36 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 1.05, ease: sectionEase }}
              className="relative max-w-[95vw] font-serif-cn text-[clamp(4.2rem,17vw,12.5rem)] font-black leading-[0.86] tracking-[-0.045em] text-zinc-50 [text-shadow:0_0_80px_rgba(0,0,0,0.55)]"
            >
              李帅康
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 28 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.95, ease: sectionEase }}
              className="mt-6 max-w-2xl font-serif-cn text-[clamp(1.25rem,3vw,2.2rem)] font-light leading-snug tracking-[0.02em] text-zinc-400"
            >
              以运营设计、品牌视觉系统与宣传物料设计，建立东方语境下的商业视觉秩序。
            </motion.p>
            <HeroCapabilityMap />
          </motion.div>
        </motion.div>
      </section>

      <CapabilityPreview />
      <AmbientDivider />
      <SectionBleed
        id="manifesto"
        className="flex min-h-[56dvh] items-center bg-[linear-gradient(180deg,#000000,#030303_58%,#010101)] px-6 py-16 md:px-12 md:py-20 lg:px-16"
      >
        <SectionReveal className="mx-auto max-w-4xl">
          <EyebrowEn>Manifesto</EyebrowEn>
          <p className="mt-10 text-pretty font-serif-cn text-2xl font-light leading-[1.78] tracking-[0.02em] text-zinc-300 md:text-[1.8rem] md:leading-[1.72]">
            视觉不是装饰，而是商业内容被感知、被信任、被持续记住的秩序。我的工作是在东方叙事与数字界面之间，建立足够克制、但可被长期使用的品牌语言。
          </p>
        </SectionReveal>
      </SectionBleed>
      <AmbientDivider />
      <MainCase />
      <ProjectSystemSection />
      <SecondaryWorkFlow />
      <AmbientDivider />
      <StudioProfile />
      <ContactEnding />
    </div>
  );
}
