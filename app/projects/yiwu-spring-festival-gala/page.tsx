import type { Metadata } from 'next';
import ProjectDetail, { type ProjectDetailData } from '../project-detail';

export const metadata: Metadata = {
  title: '2025 央视春晚 · 义乌分会场 — 李帅康',
  description: '2025 央视春晚义乌分会场部分 KV 视觉及倒计时系列视觉设计。',
};

// Verified original JPG files, in numeric order; no conversion or cropping.
const artworkFiles = ['01.jpg', '02.jpg'];
const project: ProjectDetailData = {
  selectionLabel: 'SELECTED PROJECT',
  title: ['2025 央视春晚 ·', '义乌分会场'],
  eyebrow: 'CCTV SPRING FESTIVAL GALA · YIWU · 2025',
  category: 'AI-Assisted Campaign Visual Design',
  year: '2025',
  overview: '围绕2025年央视春节联欢晚会义乌分会场的视觉传播需求，结合春节文化与义乌地域特色，运用多种 AI 图像生成工具辅助创作，完成部分 KV 视觉及倒计时系列视觉设计。',
  note: '负责相关视觉的创意构思、AI 辅助生成、画面整合与后期设计优化，将生成式 AI 融入视觉创作流程，形成适用于活动宣传与倒计时传播的系列视觉作品。',
  marquee: 'CCTV SPRING FESTIVAL GALA · YIWU 2025 · AI-ASSISTED VISUAL DESIGN · COUNTDOWN CAMPAIGN',
  artworks: artworkFiles.map((file) => ({
    src: `/projects/yiwu-spring-festival-gala/${file}`,
    width: 1920,
    height: 1080,
    alt: `2025 央视春晚 · 义乌分会场 · 原稿 ${file.replace('.jpg', '')}`,
  })),
  footerColumns: [
    ['AI-Assisted Campaign Visual Design', '2025'],
    ['2025 央视春晚', '义乌分会场'],
    ['AI 辅助视觉设计', 'KV · 倒计时系列'],
  ],
};

export default function YiwuProject() {
  return <ProjectDetail project={project} />;
}
