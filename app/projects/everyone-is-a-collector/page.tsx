import type { Metadata } from 'next';
import ProjectDetail, { type ProjectDetailData } from '../project-detail';

export const metadata: Metadata = { title: '人人都是收藏家 — 李帅康' };

// Verified originals, in numeric portfolio order; no conversion or cropping.
const artworkFiles = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg'];
const project: ProjectDetailData = {
  selectionLabel: 'SELECTED PROJECT',
  title: ['人人都是收藏家'],
  eyebrow: 'EVERYONE IS A COLLECTOR · 2021–2022',
  category: 'Integrated Campaign Design',
  year: '2021–2022',
  overview: '以「人人都是收藏家」为核心主题，将收藏理念转化为更具大众参与感的品牌沟通语言，建立贯穿品牌传播、用户参与及业务转化场景的整合视觉表达。',
  note: '作为东家 APP 的 P0 级重点项目，主要负责项目视觉创意、核心视觉体系及多场景应用延展，推动统一的 Campaign 视觉语言在不同传播触点中的落地。',
  marquee: 'DONGJIA APP · EVERYONE IS A COLLECTOR · INTEGRATED CAMPAIGN · 2021–2022',
  artworks: artworkFiles.map((file) => ({
    src: `/projects/everyone-is-a-collector/${file}`,
    width: 1920,
    height: 1080,
    alt: `人人都是收藏家 · 原稿 ${file.replace('.jpg', '')}`,
  })),
  footerColumns: [
    ['Category pending', 'Year pending'],
    ['Project name pending', 'Project description pending'],
    ['Project keywords pending', 'Content pending'],
  ],
};

export default function CollectorProject() {
  return <ProjectDetail project={project} />;
}
