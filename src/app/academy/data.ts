import type { StaticImageData } from "next/image";
import coverShip from "../../assets/hero-r.png";
import shipBlue from "../../assets/book.webp";
import seaDeck from "../../assets/faq-cta.png";
import shipPort from "../../assets/ftr.png";

// ─── Academy content ────────────────────────────────────────────────────────
// Everything on the Academy pages comes from this file. To publish a video, set
// `videoUrl` on its chapter: a YouTube or Vimeo link, or a direct .mp4/.webm URL.
// A chapter without `videoUrl` shows a "Video coming soon" frame. YouTube chapters
// use the video's own thumbnail unless `thumbnail` is set.
// Channel: https://www.youtube.com/@cruisestackacademy

export type ModuleIcon = "pin" | "bed" | "document" | "card" | "calendar";

export interface Chapter {
  slug: string;
  title: string;
  description: string;
  duration?: string; // "8:24"
  updated?: string; // "Aug 2024"
  videoUrl?: string;
  thumbnail?: StaticImageData | string; // defaults to the YouTube thumbnail, then the module cover
}

export interface AcademyModule {
  slug: string;
  number: number;
  title: string;
  description: string;
  icon: ModuleIcon;
  cover: StaticImageData;
  chapters: Chapter[];
}

export const academyModules: AcademyModule[] = [
  {
    slug: "destinations-ports-cruise-lines",
    number: 1,
    title: "Destinations, ports & cruise lines",
    description:
      "Learn about popular destinations, key cities, best season months, active departure ports and top cruise lines.",
    icon: "pin",
    cover: coverShip,
    chapters: [
      {
        slug: "top-10-destinations-percentage-of-traffic",
        title: "Top 10 destinations, percentage of traffic",
        description:
          "Learn about the top 10 cruise destinations based on search and booking traffic in cruisestack.",
        duration: "3:40",
        updated: "Sep 2026",
        videoUrl: "https://www.youtube.com/watch?v=vsrzSXGnmS4",
      },
      {
        slug: "top-10-destinations-key-cities",
        title: "Top 10 destinations and key cities covered",
        description: "Explore the key cities and popular ports covered within the top 10 destinations.",
        duration: "6:21",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=rpepvA0WLro",
      },
      {
        slug: "top-10-destinations-season-months",
        title: "Top 10 destinations and season months",
        description: "Understand the best time to visit each destination based on seasonality and demand.",
        duration: "3:47",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=hPQqVPBrdA0",
      },
      {
        slug: "top-10-destinations-departure-ports",
        title: "Top 10 destinations and most active departure ports",
        description:
          "Learn which departure ports are most active for each destination and how to find them in cruisestack.",
        duration: "3:06",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=ygfW6FDkvYw",
      },
      {
        slug: "top-10-destinations-cruise-lines",
        title: "Top 10 destinations and most active cruise lines",
        description: "See which cruise lines are most active for each destination and how to compare options.",
        duration: "4:40",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=IIINaA9XP20",
      },
    ],
  },
  {
    slug: "room-categories-decks-cabins",
    number: 2,
    title: "Room categories, decks & cabins",
    description:
      "Understand room categories, guarantee cabins, special packages, deck selection and cabin inventory.",
    icon: "bed",
    cover: shipBlue,
    chapters: [],
  },
  {
    slug: "trip-summaries",
    number: 3,
    title: "Trip summaries",
    description:
      "Learn how to read, share and use trip summaries, including sailing times, shore excursions and inclusions/exclusions.",
    icon: "document",
    cover: seaDeck,
    chapters: [],
  },
  {
    slug: "pricing-taxation-payments",
    number: 4,
    title: "Pricing, taxation & payments",
    description:
      "Understand price breakdowns, payment methods in INR and USD, how TCS & GST work, and required documents.",
    icon: "card",
    cover: shipPort,
    chapters: [],
  },
  {
    slug: "payment-cancellation-terms",
    number: 5,
    title: "Payment & cancellation terms",
    description:
      "Learn about deposits, payment deadlines, cancellation terms, currency conversion, bank charges and group discounts.",
    icon: "calendar",
    cover: coverShip,
    chapters: [],
  },
];

// ─── Lookups ────────────────────────────────────────────────────────────────

export function getModule(slug: string) {
  const index = academyModules.findIndex((m) => m.slug === slug);
  if (index === -1) return null;
  return {
    module: academyModules[index],
    prev: academyModules[index - 1] ?? null,
    next: academyModules[index + 1] ?? null,
  };
}

export function getChapter(moduleSlug: string, chapterSlug: string) {
  const found = getModule(moduleSlug);
  if (!found) return null;
  const { chapters } = found.module;
  const index = chapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) return null;
  return {
    module: found.module,
    chapter: chapters[index],
    index,
    prev: chapters[index - 1] ?? null,
    next: chapters[index + 1] ?? null,
  };
}

export const moduleHref = (m: AcademyModule) => `/academy/${m.slug}`;

// YouTube video ID from a watch, youtu.be, shorts or embed link; null for anything else.
export function youtubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      return u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || null;
    }
  } catch {}
  return null;
}

export function chapterThumbnail(m: AcademyModule, c: Chapter): StaticImageData | string {
  if (c.thumbnail) return c.thumbnail;
  const id = youtubeId(c.videoUrl);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : m.cover;
}

export const chapterHref = (m: AcademyModule, c: Chapter) => `/academy/${m.slug}/${c.slug}`;
