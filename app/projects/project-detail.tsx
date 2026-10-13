import RecoverableProjectImage from './recoverable-project-image';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import CaseMarquee from './zhu-bingren-brand-upgrade/case-marquee';
import styles from './zhu-bingren-brand-upgrade/case.module.css';

export type ProjectDetailData = {
  selectionLabel: string;
  title: string[];
  eyebrow: string;
  category: string;
  year: string;
  overview: string;
  note: string;
  marquee: string;
  artworks: { src: string; width: number; height: number; alt: string }[];
  footerColumns: [string, string][];
  badge?: ReactNode;
};

export default function ProjectDetail({ project }: { project: ProjectDetailData }) {
  return (
    <main className={styles.casePage}>
      <header className={styles.header}>
        {project.badge ?? <div className={styles.floatingPin} aria-hidden="true" />}
        <nav className={styles.topNav} aria-label="项目导航">
          <Link className={styles.backLink} href="/#featured-work-title" prefetch={false}><span className={styles.backArrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg></span><span>BACK TO SELECTED WORK</span></Link>
          <span>{project.selectionLabel}</span>
        </nav>
        <div className={styles.headline}>
          <p className={styles.eyebrow}>{project.eyebrow}</p>
          <h1>{project.title.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</h1>
        </div>
        <div className={styles.projectInfo}>
          <dl>
            <div><dt>CATEGORY</dt><dd>{project.category}</dd></div>
            <div><dt>YEAR</dt><dd>{project.year}</dd></div>
          </dl>
          <div className={styles.intro}>
            <p>{project.overview}</p>
            <p className={styles.demoNote}>{project.note}</p>
          </div>
        </div>
      </header>

      <div className={styles.smallMarqueeFrame}>
        <CaseMarquee text={project.marquee} />
      </div>

      <section className={styles.artworks} aria-labelledby="artworks-title">
        <div className={styles.artworkHeading}>
          <h2 id="artworks-title">PROJECT IMAGES</h2>
          <span aria-hidden="true">&nbsp;</span>
        </div>
        {project.artworks.map((artwork, index) => (
          <Fragment key={artwork.alt}>
            {index > 0 && <hr className={styles.imageDivider} />}
            <figure className={styles.artwork}>
              <RecoverableProjectImage
                key={artwork.src}
                className={styles.originalImage}
                src={artwork.src}
                width={artwork.width}
                height={artwork.height}
                alt={artwork.alt}
                sizes="(max-width: 1600px) 92vw, 1480px"
                loading="lazy"
                decoding="async"
                unoptimized
              />
              <figcaption aria-hidden="true" style={{ visibility: 'hidden' }}>{artwork.alt}</figcaption>
            </figure>
          </Fragment>
        ))}
      </section>

      <footer className={styles.footer}>
        <CaseMarquee large text="FROM INSIGHT TO SYSTEM, FROM SYSTEM TO EXPERIENCE" />
        <div className={styles.footerMeta}>
          {project.footerColumns.map(([first, second], index) => <div key={index}><p>{first}</p><p>{second}</p></div>)}
          <div className={styles.footerIndex}>
            <div><b>01</b><p>视觉 / Visual System</p></div>
            <div><b>02</b><p>传播 / Campaign Visual</p></div>
            <div><b>03</b><p>体验 / Brand Experience</p></div>
          </div>
        </div>
        <nav className={styles.bottomNav} aria-label="项目间导航">
          <Link className={styles.backLink} href="/#featured-work-title" prefetch={false}><span className={styles.backArrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg></span><span>BACK TO SELECTED WORK</span></Link>
          <div aria-hidden="true" style={{ visibility: 'hidden' }}><span aria-disabled="true">NEXT PROJECT →</span><small>下一项目待建立</small></div>
        </nav>
      </footer>
    </main>
  );
}
