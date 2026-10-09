import type { Metadata } from 'next';
import FloatingPin from './floating-pin';
import ProjectDetail, { type ProjectDetailData } from '../project-detail';

export const metadata: Metadata = {
  title: '朱炳仁铜品牌视觉升级提案 — 李帅康',
  description: '2024 年制定的朱炳仁铜自主品牌视觉升级提案，探索以系统化视觉语言连接传统工艺与现代生活。',
};

type Artwork = { src: string; width: number; height: number; alt: string };
// Verified source files in numeric portfolio order. Serve the unchanged originals.
const artworkFiles = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg', '21.jpg', '22.jpg', '23.jpg'];
const artworks: Artwork[] = artworkFiles.map((file) => ({
  src: `/projects/zhu-bingren/${file}`,
  width: 1920,
  height: 1080,
  alt: `朱炳仁铜品牌升级案例 · 原稿 ${file.replace('.jpg', '')}`,
}));

const project: ProjectDetailData = {
  selectionLabel: 'SELECTED PROJECT · 01',
  title: ['朱炳仁铜', '品牌视觉升级提案'],
  eyebrow: 'ZHU BINGREN TONG · 2024',
  category: 'Brand Identity Redesign',
  year: '2024',
  overview: '以朱炳仁铜的非遗铜艺文化与品牌积淀为基础，探索传统工艺品牌如何建立更具当代性的视觉表达。',
  note: '本项目为自主品牌视觉升级提案，围绕品牌识别、色彩、字体、辅助图形与应用场景展开设计探索，以系统化视觉语言连接传统工艺与现代生活。',
  marquee: 'ZHU BINGREN TONG · BRAND UPGRADE · VISUAL IDENTITY SYSTEM · 2024 ·',
  artworks,
  footerColumns: [
    ['Brand Identity Redesign', 'Self-initiated · 2024'],
    ['Zhu Bingren Tong', 'Brand Upgrade Concept'],
    ['Visual System Exploration', 'Color · Typography · Graphics · Imagery'],
  ],
  badge: <FloatingPin />,
};

export default function ProjectDemo() {
  return <ProjectDetail project={project} />;
}
