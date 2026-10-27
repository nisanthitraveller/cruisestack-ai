"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./podcast.module.css";
import { episodeHref, formatEpisodeDate, type PodcastEpisode } from "./data";
import { youtubeThumbnail } from "@/lib/youtube";

const PER_PAGE = 9;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

// 1 … 4 5 6 … 12 style page list
function pageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export default function PodcastList({ episodes }: { episodes: PodcastEpisode[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [destination, setDestination] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const topics = useMemo(() => uniqueSorted(episodes.flatMap((e) => e.topics)), [episodes]);
  const destinations = useMemo(() => uniqueSorted(episodes.flatMap((e) => e.destinations)), [episodes]);
  const languages = useMemo(() => uniqueSorted(episodes.map((e) => e.language)), [episodes]);

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = episodes.filter((e) => {
      if (topic && !e.topics.includes(topic)) return false;
      if (destination && !e.destinations.includes(destination)) return false;
      if (language && e.language !== language) return false;
      const text = [e.title, e.description, ...e.topics, ...e.destinations].join(" ").toLowerCase();
      return words.every((w) => text.includes(w));
    });
    return list.sort((a, b) => (sort === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  }, [episodes, query, topic, destination, language, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const hasFilters = Boolean(query || topic || destination || language);

  // any filter change starts again from page 1
  const update = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  function goTo(p: number) {
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilters() {
    setQuery("");
    setTopic("");
    setDestination("");
    setLanguage("");
    setPage(1);
  }

  if (!episodes.length) {
    return (
      <div className={styles.empty}>
        <strong>First episodes coming soon</strong>
        <p>We&apos;re getting the first conversations ready. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className={styles.listWrap}>
      {/* ───── FILTERS ───── */}
      <div className={styles.filters}>
        <label className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m20 20-4.5-4.5" />
          </svg>
          <input
            type="search"
            placeholder="Search podcasts..."
            aria-label="Search podcasts"
            value={query}
            onChange={(e) => update(setQuery)(e.target.value)}
          />
        </label>
        {/* a filter only shows once there are at least two values to choose between */}
        {topics.length > 1 && (
          <select aria-label="Topic" value={topic} onChange={(e) => update(setTopic)(e.target.value)}>
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}
        {destinations.length > 1 && (
          <select aria-label="Destination" value={destination} onChange={(e) => update(setDestination)(e.target.value)}>
            <option value="">All destinations</option>
            {destinations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        )}
        {languages.length > 1 && (
          <select aria-label="Language" value={language} onChange={(e) => update(setLanguage)(e.target.value)}>
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        )}
        {episodes.length > 1 && (
          <select
            aria-label="Sort"
            value={sort}
            onChange={(e) => update(setSort)(e.target.value as "newest" | "oldest")}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        )}
      </div>

      {/* ───── EPISODES ───── */}
      {visible.length ? (
        <ul className={styles.grid}>
          {visible.map((e) => {
            const thumb = youtubeThumbnail(e.videoUrl);
            return (
              <li key={e.slug}>
                <Link href={episodeHref(e)} className={styles.card}>
                  <span className={styles.thumb}>
                    {thumb && (
                      <Image src={thumb} alt="" fill sizes="(max-width: 780px) 100vw, (max-width: 1100px) 50vw, 420px" className={styles.thumbImg} />
                    )}
                    <span className={styles.play} aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                      </svg>
                    </span>
                    {e.duration && <span className={styles.time}>{e.duration}</span>}
                  </span>
                  <span className={styles.body}>
                    <strong>{e.title}</strong>
                    <span className={styles.desc}>{e.description}</span>
                    <span className={styles.date}>
                      <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
                        <rect x="3.5" y="5" width="17" height="15" rx="2" />
                        <path d="M3.5 9.5h17M8 3v4M16 3v4" />
                      </svg>
                      {formatEpisodeDate(e.date)}
                    </span>
                    <span className={styles.tags}>
                      {[...e.destinations, ...e.topics].slice(0, 3).map((t) => (
                        <span key={t} className={styles.tag}>
                          {t}
                        </span>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          <strong>No episodes match your search</strong>
          <p>Try a different keyword or clear the filters.</p>
          {hasFilters && (
            <button type="button" className={styles.reset} onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ───── PAGINATION ───── */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Episode pages">
          <button type="button" className={styles.pageArrow} onClick={() => goTo(current - 1)} disabled={current === 1} aria-label="Previous page">
            <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          {pageList(current, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className={styles.gap}>
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={p === current ? styles.pageActive : styles.pageNum}
                onClick={() => goTo(p)}
                aria-current={p === current ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
          <button type="button" className={styles.pageArrow} onClick={() => goTo(current + 1)} disabled={current === totalPages} aria-label="Next page">
            <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </nav>
      )}
    </div>
  );
}
