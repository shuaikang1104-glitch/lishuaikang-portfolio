import type { Metadata } from 'next';
import ProjectDetail, { type ProjectDetailData } from '../project-detail';

export const metadata: Metadata = {
  title: '朱炳仁 · 熔铜18周年展 — 李帅康',
  description: '中国国家博物馆 · 2024 · 展览主视觉与线上传播视觉设计。',
};

// Verified original JPG files, in numeric order; no conversion or cropping.
const artworkFiles = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'];
const project: ProjectDetailData = {
  selectionLabel: 'SELECTED PROJECT',
  title: ['朱炳仁 ·', '熔铜18周年展'],
  eyebrow: 'ZHU BINGREN · 18 YEARS OF MOLTEN COPPER ART · 2024',
  category: 'Exhibition Campaign Visual Design',
  year: '2024',
  overview: '以「熔铜18周年展」为核心，围绕朱炳仁熔铜艺术的创作历程与艺术表达，独立完成展览主视觉的创意构思与设计，将熔铜艺术的材质特征转化为具有辨识度的视觉语言。',
  note: '负责展览主 KV 及线上传播视觉设计，围绕核心视觉进行数字传播延展，建立一致的展览传播形象。',
  marquee: 'ZHU BINGREN · 18 YEARS OF MOLTEN COPPER ART · EXHIBITION VISUAL · 2024',
  artworks: artworkFiles.map((file) => ({
    src: `/projects/zhubingren-national-museum/${file}`,
    width: 1920,
    height: 1080,
    alt: `朱炳仁 · 熔铜18周年展 · 原稿 ${file.replace('.jpg', '')}`,
  })),
  footerColumns: [
    ['Exhibition Campaign Visual Design', '2024'],
    ['朱炳仁 · 熔铜18周年展', '中国国家博物馆'],
    ['展览主 KV · 线上传播视觉设计', '数字传播延展'],
  ],
};

export default function NationalMuseumProject() {
  return <ProjectDetail project={project} />;
}
