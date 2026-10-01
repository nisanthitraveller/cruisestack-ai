import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "../academy.module.css";
import { academyModules, chapterHref, chapterThumbnail, getModule, moduleHref } from "../data";
import { ArrowLeft, ArrowRight, Chevron, Clock, Play } from "../icons";
import academyIllustration from "../../../assets/academy-illustration.svg";

type Props = { params: Promise<{ moduleSlug: string }> };

export function generateStaticParams() {
  return academyModules.map((m) => ({ moduleSlug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getModule((await params).moduleSlug);
  if (!found) return {};
  return {
    title: `Module ${found.module.number}: ${found.module.title} - cruisestack Academy`,
    description: found.module.description,
  };
}

export default async function ModulePage({ params }: Props) {
  const found = getModule((await params).moduleSlug);
  if (!found) notFound();
  const { module: m, prev, next } = found;

  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={`${styles.hero} ${styles.heroCompact}`}>
        <Image src={m.cover} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/academy">Academy</Link>
            <Chevron />
            <Link href="/academy#modules">Modules</Link>
            <Chevron />
            <span aria-current="page">{m.title}</span>
          </nav>
          <span className={styles.eyebrow}>Module {m.number}</span>
          <h1>{m.title}</h1>
          <p>{m.description}</p>
        </div>
      </section>

      {/* ───── CHAPTERS ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.split}>
            <div className={styles.illustration} aria-hidden="true">
              <Image src={academyIllustration} alt="" />
            </div>
            <div>
              <div className={styles.chaptersHead}>
                <h2>Chapters ({m.chapters.length})</h2>
                <p>Watch the videos in order or jump to any chapter you need.</p>
              </div>

              {m.chapters.length ? (
                <ol className={styles.chapterList}>
                  {m.chapters.map((c, i) => (
                    <li key={c.slug}>
                      <Link href={chapterHref(m, c)} className={styles.chapterCard}>
                        <span className={styles.thumb}>
                          <Image src={chapterThumbnail(m, c)} alt="" fill sizes="(max-width: 780px) 100vw, 220px" className={styles.thumbImg} />
                          <span className={styles.thumbPlay}>
                            <Play />
                          </span>
                          {c.duration && <span className={styles.thumbTime}>{c.duration}</span>}
                        </span>
                        <span className={styles.chapterNum}>{i + 1}</span>
                        <span className={styles.chapterText}>
                          <strong>{c.title}</strong>
                          {c.duration && (
                            <span className={styles.meta}>
                              <Clock /> {c.duration}
                            </span>
                          )}
                          <span className={styles.chapterDesc}>{c.description}</span>
                        </span>
                        <span className={styles.roundArrow}>
                          <ArrowRight />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className={styles.empty}>
                  <strong>Chapters coming soon</strong>
                  <p>We&apos;re recording the videos for this module. Check back shortly.</p>
                </div>
              )}
            </div>
          </div>

          {/* ───── PREV / NEXT MODULE ───── */}
          <nav className={styles.pager} aria-label="Modules">
            {prev ? (
              <Link href={moduleHref(prev)} className={styles.pagerLink}>
                <span className={styles.roundArrow}>
                  <ArrowLeft />
                </span>
                <span>
                  <strong>Previous module</strong>
                  <span>{prev.title}</span>
                </span>
              </Link>
            ) : (
              <div className={`${styles.pagerLink} ${styles.pagerDisabled}`}>
                <span className={styles.roundArrow}>
                  <ArrowLeft />
                </span>
                <span>
                  <strong>Previous module</strong>
                  <span>(Not available)</span>
                </span>
              </div>
            )}
            {next ? (
              <Link href={moduleHref(next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span>
                  <strong>Next module</strong>
                  <span>{next.title}</span>
                </span>
                <span className={styles.roundArrow}>
                  <ArrowRight />
                </span>
              </Link>
            ) : (
              <div className={`${styles.pagerLink} ${styles.pagerNext} ${styles.pagerDisabled}`}>
                <span>
                  <strong>Next module</strong>
                  <span>(Not available)</span>
                </span>
                <span className={styles.roundArrow}>
                  <ArrowRight />
                </span>
              </div>
            )}
          </nav>
        </div>
      </section>

      <Footer />
    </div>
  );
}
