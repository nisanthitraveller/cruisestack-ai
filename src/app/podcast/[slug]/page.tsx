import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import { youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";
import styles from "../podcast.module.css";
import { episodeHref, formatEpisodeDate, getEpisode, podcastEpisodes, sortedEpisodes } from "../data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return podcastEpisodes.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const episode = getEpisode((await params).slug);
  if (!episode) return {};
  return {
    title: `${episode.title} - cruisestack Podcast`,
    description: episode.description,
  };
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
);

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export default async function EpisodePage({ params }: Props) {
  const episode = getEpisode((await params).slug);
  if (!episode) notFound();

  const embed = youtubeEmbedUrl(episode.videoUrl);
  const more = sortedEpisodes.filter((e) => e.slug !== episode.slug).slice(0, 4);

  return (
    <div className={styles.page}>
      <Header />

      <div className={`${styles.container} ${styles.detail}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <Chevron />
          <Link href="/podcast">Podcast</Link>
          <Chevron />
          <span aria-current="page">{episode.title}</span>
        </nav>

        {/* ───── VIDEO ───── */}
        <div className={styles.player}>
          {embed ? (
            <iframe
              src={embed}
              title={episode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <a href={episode.videoUrl} target="_blank" rel="noreferrer" className={styles.playerFallback}>
              Watch this episode
            </a>
          )}
        </div>

        <h1 className={styles.detailTitle}>{episode.title}</h1>
        <p className={styles.detailMeta}>
          <span>
            <CalendarIcon /> {formatEpisodeDate(episode.date)}
          </span>
          {episode.duration && (
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {episode.duration}
            </span>
          )}
        </p>
        <p className={styles.detailAbout}>{episode.about ?? episode.description}</p>

        {/* ───── MORE EPISODES ───── */}
        {more.length > 0 && (
          <section className={styles.more}>
            <div className={styles.moreHead}>
              <h2>More episodes</h2>
              <Link href="/podcast" className={styles.textLink}>
                View all episodes
                <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
            <ul className={styles.moreGrid}>
              {more.map((e) => {
                const thumb = youtubeThumbnail(e.videoUrl);
                return (
                  <li key={e.slug}>
                    <Link href={episodeHref(e)} className={styles.moreCard}>
                      <span className={styles.thumb}>
                        {thumb && (
                          <Image src={thumb} alt="" fill sizes="(max-width: 780px) 100vw, (max-width: 1100px) 50vw, 320px" className={styles.thumbImg} />
                        )}
                        {e.duration && <span className={styles.time}>{e.duration}</span>}
                      </span>
                      <strong>{e.title}</strong>
                      <span className={styles.date}>
                        <CalendarIcon /> {formatEpisodeDate(e.date)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
