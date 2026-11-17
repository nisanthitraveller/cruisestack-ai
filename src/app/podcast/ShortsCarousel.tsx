"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./podcast.module.css";
import { SHORTS_CHANNEL_URL, type PodcastShort } from "./data";
import { youtubeId } from "@/lib/youtube";

const Arrow = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
  </svg>
);

// "Short clips" carousel: scrolls sideways, and a click plays the Short in a pop-up player.
export default function ShortsCarousel({ shorts }: { shorts: PodcastShort[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [playing, setPlaying] = useState<PodcastShort | null>(null);

  const updateEdges = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  // Close the player with Escape, and stop the page scrolling behind it
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playing]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!shorts.length) return null;
  const playingId = youtubeId(playing?.videoUrl);

  return (
    <section className={styles.shorts} aria-labelledby="short-clips">
      <div className={styles.listHead}>
        <h2 id="short-clips">Short clips</h2>
        <a href={SHORTS_CHANNEL_URL} target="_blank" rel="noreferrer" className={styles.textLink}>
          View all clips <Arrow dir="right" />
        </a>
      </div>

      <div className={styles.shortsWrap}>
        <button type="button" className={`${styles.shortsArrow} ${styles.shortsPrev}`} onClick={() => scroll(-1)} disabled={atStart} aria-label="Previous clips">
          <Arrow dir="left" />
        </button>

        <ul ref={track} className={styles.shortsTrack} onScroll={updateEdges}>
          {shorts.map((s) => (
            <li key={s.videoUrl}>
              <button type="button" className={styles.shortCard} onClick={() => setPlaying(s)}>
                <span className={styles.shortThumb}>
                  <Image src={s.thumbnail} alt="" fill sizes="(max-width: 780px) 46vw, 200px" className={styles.thumbImg} />
                  <span className={styles.play} aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.5v13l11-6.5z" />
                    </svg>
                  </span>
                  <span className={styles.time}>{s.duration}</span>
                </span>
                <strong>{s.title}</strong>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className={`${styles.shortsArrow} ${styles.shortsNext}`} onClick={() => scroll(1)} disabled={atEnd} aria-label="Next clips">
          <Arrow dir="right" />
        </button>
      </div>

      {playing && playingId && (
        <div className={styles.shortModal} role="dialog" aria-modal="true" aria-label={playing.title} onClick={() => setPlaying(null)}>
          <div className={styles.shortPlayer} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.shortClose} onClick={() => setPlaying(null)} aria-label="Close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${playingId}?autoplay=1&rel=0&playsinline=1`}
              title={playing.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
