import Image from "next/image";
import type { StaticImageData } from "next/image";
import styles from "./academy.module.css";
import { youtubeId } from "./data";
import { Play } from "./icons";

// Turns a YouTube/Vimeo page link into its embed URL; anything else is treated as a video file.
function toEmbedUrl(url: string): string | null {
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0`;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}`;
    if (host === "player.vimeo.com") return url;
  } catch {}
  return null;
}

export default function ChapterVideo({
  title,
  videoUrl,
  poster,
}: {
  title: string;
  videoUrl?: string;
  poster: StaticImageData | string;
}) {
  if (!videoUrl) {
    return (
      <div className={styles.video}>
        <Image src={poster} alt="" fill sizes="(max-width: 1100px) 100vw, 760px" className={styles.videoPoster} />
        <div className={styles.videoSoon}>
          <span className={styles.videoPlay}>
            <Play size={34} />
          </span>
          <strong>Video coming soon</strong>
        </div>
      </div>
    );
  }

  const embed = toEmbedUrl(videoUrl);

  return (
    <div className={styles.video}>
      {embed ? (
        <iframe
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video controls preload="metadata" poster={typeof poster === "string" ? poster : poster.src}>
          <source src={videoUrl} />
          Your browser does not support embedded video.
        </video>
      )}
    </div>
  );
}
