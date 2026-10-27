import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "./podcast.module.css";
import PodcastList from "./PodcastList";
import { episodeHref, sortedEpisodes } from "./data";
import heroImg from "../../assets/hero-r.png";

export const metadata: Metadata = {
  title: "Podcast - cruisestack",
  description:
    "Expert insights, destination highlights and real stories to help you grow your cruise business.",
};

export default function PodcastPage() {
  const latest = sortedEpisodes[0];

  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={styles.hero}>
        <Image src={heroImg} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>cruisestack Podcast</span>
          <h1>
            Real conversations
            <br />
            about cruising
          </h1>
          <p>Expert insights, destination highlights and real stories to help you grow your cruise business.</p>
          {latest && (
            <Link href={episodeHref(latest)} className={styles.btnPrimary}>
              Watch latest episode
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>
      </section>

      {/* ───── EPISODES ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <PodcastList episodes={sortedEpisodes} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
