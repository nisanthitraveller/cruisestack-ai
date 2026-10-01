import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import ChapterVideo from "../../ChapterVideo";
import styles from "../../academy.module.css";
import { academyModules, chapterHref, chapterThumbnail, getChapter, moduleHref } from "../../data";
import { ArrowLeft, ArrowRight, Chevron, Clock } from "../../icons";

type Props = { params: Promise<{ moduleSlug: string; chapterSlug: string }> };

export function generateStaticParams() {
  return academyModules.flatMap((m) => m.chapters.map((c) => ({ moduleSlug: m.slug, chapterSlug: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleSlug, chapterSlug } = await params;
  const found = getChapter(moduleSlug, chapterSlug);
  if (!found) return {};
  return {
    title: `${found.chapter.title} - cruisestack Academy`,
    description: found.chapter.description,
  };
}

export default async function ChapterPage({ params }: Props) {
  const { moduleSlug, chapterSlug } = await params;
  const found = getChapter(moduleSlug, chapterSlug);
  if (!found) notFound();
  const { module: m, chapter, prev, next } = found;

  return (
    <div className={styles.page}>
      <Header />

      <div className={`${styles.container} ${styles.watch}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/academy">Academy</Link>
          <Chevron />
          <Link href="/academy#modules">Modules</Link>
          <Chevron />
          <Link href={moduleHref(m)}>{m.title}</Link>
          <Chevron />
          <span aria-current="page">{chapter.title}</span>
        </nav>

        <div className={styles.watchGrid}>
          {/* ───── SIDEBAR ───── */}
          <aside className={styles.sidebar}>
            <Link href="/academy#modules" className={styles.backLink}>
              <ArrowLeft size={18} /> Back to all modules
            </Link>
            <span className={styles.sidebarModule}>Module {m.number}</span>
            <Link href={moduleHref(m)} className={styles.sidebarTitle}>
              {m.title}
            </Link>
            <ol className={styles.sidebarList}>
              {m.chapters.map((c, i) => {
                const active = c.slug === chapter.slug;
                return (
                  <li key={c.slug}>
                    <Link
                      href={chapterHref(m, c)}
                      className={active ? styles.sidebarActive : undefined}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={styles.sidebarNum}>{i + 1}</span>
                      <span>
                        <span className={styles.sidebarChapter}>{c.title}</span>
                        {c.duration && (
                          <span className={styles.meta}>
                            <Clock /> {c.duration}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* ───── VIDEO ───── */}
          <main className={styles.watchMain}>
            <span className={styles.eyebrow}>Module {m.number}</span>
            <p className={styles.watchModule}>{m.title}</p>
            <h1 className={styles.watchTitle}>{chapter.title}</h1>
            {(chapter.duration || chapter.updated) && (
              <p className={`${styles.meta} ${styles.watchMeta}`}>
                {chapter.duration && (
                  <>
                    <Clock size={18} /> {chapter.duration}
                  </>
                )}
                {chapter.duration && chapter.updated && <span aria-hidden="true">&bull;</span>}
                {chapter.updated && <>Updated {chapter.updated}</>}
              </p>
            )}
            <ChapterVideo title={chapter.title} videoUrl={chapter.videoUrl} poster={chapterThumbnail(m, chapter)} />
          </main>
        </div>

        {/* ───── PREV / NEXT CHAPTER ───── */}
        <nav className={styles.pager} aria-label="Chapters">
          {prev ? (
            <Link href={chapterHref(m, prev)} className={styles.pagerLink}>
              <span className={styles.roundArrow}>
                <ArrowLeft />
              </span>
              <span>
                <strong>Previous chapter</strong>
                <span>{prev.title}</span>
              </span>
            </Link>
          ) : (
            <div className={`${styles.pagerLink} ${styles.pagerDisabled}`}>
              <span className={styles.roundArrow}>
                <ArrowLeft />
              </span>
              <span>
                <strong>Previous chapter</strong>
                <span>(Not available)</span>
              </span>
            </div>
          )}
          {next ? (
            <Link href={chapterHref(m, next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
              <span>
                <strong>Next chapter</strong>
                <span>{next.title}</span>
              </span>
              <span className={styles.roundArrow}>
                <ArrowRight />
              </span>
            </Link>
          ) : (
            <div className={`${styles.pagerLink} ${styles.pagerNext} ${styles.pagerDisabled}`}>
              <span>
                <strong>Next chapter</strong>
                <span>(Not available)</span>
              </span>
              <span className={styles.roundArrow}>
                <ArrowRight />
              </span>
            </div>
          )}
        </nav>
      </div>

      <Footer />
    </div>
  );
}
