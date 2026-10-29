import type { StaticImageData } from "next/image";
import { youtubeId, youtubeThumbnail } from "@/lib/youtube";
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
  // SEO overrides; each falls back to `title` / `description`
  cardTitle?: string; // chapter card headline (h2) on the module page
  heading?: string; // h1 on the chapter page
  seoTitle?: string; // <title> of the chapter page
  seoDescription?: string; // meta description of the chapter page
}

export interface AcademyModule {
  slug: string;
  number: number;
  title: string;
  cardTitle?: string; // headline on the /academy module card (h3); module pages keep `title`
  description: string;
  // SEO overrides for the module page; each falls back to `title` / `description`
  heading?: string; // h1
  intro?: string; // text under the h1
  seoTitle?: string; // <title>
  seoDescription?: string; // meta description
  icon: ModuleIcon;
  cover: StaticImageData;
  chapters: Chapter[];
}

export const academyModules: AcademyModule[] = [
  {
    slug: "destinations-ports-cruise-lines",
    number: 1,
    title: "Destinations, ports & cruise lines",
    cardTitle: "Cruise destinations, ports & cruise lines",
    heading: "Cruise destinations, ports & cruise lines: Module 1 of CruiseStack Academy",
    intro:
      "This module teaches you how to match a client to the right cruise destination, port and cruise line. You'll see which destinations get the most search and booking traffic, when each is best to sail, where ships depart from, and which lines are most active there.",
    seoTitle: "Cruise Destinations, Ports & Cruise Lines Guide for Agents | Module 1",
    seoDescription:
      "Learn the top cruise destinations, key cities, best season months, departure ports and most active cruise lines, with video chapters inside CruiseStack.",
    description:
      "Learn about popular destinations, key cities, best season months, active departure ports and top cruise lines.",
    icon: "pin",
    cover: coverShip,
    chapters: [
      {
        slug: "top-10-destinations-percentage-of-traffic",
        title: "Top 10 destinations, percentage of traffic",
        cardTitle: "Understanding the top 10 cruise destinations by passenger traffic",
        seoTitle: "Top 10 Cruise Destinations by Search & Booking Traffic | CruiseStack Academy",
        seoDescription:
          "See the top 10 cruise destinations ranked by share of search and booking traffic in CruiseStack. 3:40 video tutorial.",
        description:
          "Learn about the top 10 cruise destinations based on search and booking traffic in cruisestack.",
        duration: "3:40",
        updated: "Sep 2026",
        videoUrl: "https://www.youtube.com/watch?v=vsrzSXGnmS4",
      },
      {
        slug: "top-10-destinations-key-cities",
        title: "Top 10 destinations and key cities covered",
        cardTitle: "Learn the key cities and ports covered by the top 10 cruise destinations",
        heading: "Top 10 cruise destinations and the key cities covered",
        seoTitle: "Top Cruise Destinations and Key Cities & Ports Covered | CruiseStack Academy",
        seoDescription:
          "Explore key cities and popular ports inside each of the top 10 cruise destinations. 6:21 video.",
        description: "Explore the key cities and popular ports covered within the top 10 destinations.",
        duration: "6:21",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=rpepvA0WLro",
      },
      {
        slug: "top-10-destinations-season-months",
        title: "Top 10 destinations and season months",
        cardTitle: "Best time to cruise: seasonality across the top 10 cruise destinations",
        heading: "Best time to cruise: season months for the top 10 destinations",
        seoTitle: "Best Time to Cruise: Season Months for Top Destinations | CruiseStack Academy",
        seoDescription:
          "Learn the best months to cruise each top destination based on seasonality and demand.",
        description: "Understand the best time to visit each destination based on seasonality and demand.",
        duration: "3:47",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=hPQqVPBrdA0",
      },
      {
        slug: "top-10-destinations-departure-ports",
        title: "Top 10 destinations and most active departure ports",
        cardTitle: "Major cruise departure ports across the top 10 cruise destinations",
        heading: "Most active cruise departure ports for the top 10 destinations",
        seoTitle: "Most Active Cruise Departure Ports by Destination | CruiseStack Academy",
        seoDescription:
          "Find which departure ports are most active for each top cruise destination and how to search them in CruiseStack.",
        description:
          "Learn which departure ports are most active for each destination and how to find them in cruisestack.",
        duration: "3:06",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=ygfW6FDkvYw",
      },
      {
        slug: "top-10-destinations-cruise-lines",
        title: "Top 10 destinations and most active cruise lines",
        cardTitle: "Leading cruise lines operating across the top 10 cruise destinations",
        heading: "Most active cruise lines for the top 10 cruise destinations",
        seoTitle: "Most Active Cruise Lines by Destination: How to Compare | CruiseStack Academy",
        seoDescription:
          "See which cruise lines are most active in each top destination and how to compare your options.",
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
    cardTitle: "Learn about cruise room categories, decks & cabins",
    heading: "Cruise cabin types, room categories & decks: Module 2 of CruiseStack Academy",
    intro:
      "Cabin choice is where most cruise quotes get won or lost. This module explains room categories, what a guarantee cabin really is, how special packages work, how deck position changes the stay, and how to read cabin inventory.",
    seoTitle: "Cruise Cabin Types, Room Categories & Decks Explained | Module 2",
    seoDescription:
      "Understand cruise room categories, guarantee cabins, special packages, deck selection and cabin inventory so you can pick the right cabin for every client.",
    description:
      "Understand room categories, guarantee cabins, special packages, deck selection and cabin inventory.",
    icon: "bed",
    cover: shipBlue,
    // Playlist: https://www.youtube.com/playlist?list=PLEmv02F5Qthg
    chapters: [
      {
        slug: "choose-destinations-cruise-lines-ports",
        title: "How to choose cruise destinations, cruise lines & ports",
        description:
          "Use the cruisestack search filters to choose destinations, departure ports, cruise lines, sailing dates, duration and passengers.",
        duration: "3:11",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=0Dvf3Hy9dH8",
      },
      {
        slug: "choose-cabins-room-categories-decks",
        title: "How to choose cruise cabins, room categories & decks",
        description:
          "Understand interior, oceanview, balcony and suite cabins, read deck plans and match rooms to your customer's preferences and budget.",
        duration: "2:56",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=jBXWy4vt3i8",
      },
      {
        slug: "guarantee-cabins-confirmed-cabin-numbers",
        title: "How to find guarantee cabins & confirmed cabin numbers",
        description:
          "Learn the difference between guarantee cabins, where the cabin number is assigned later, and cabins with a confirmed number at booking.",
        duration: "3:41",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=WmLahRknPuU",
      },
    ],
  },
  {
    slug: "trip-summaries",
    number: 3,
    title: "Trip summaries",
    cardTitle: "What is a cruise trip summary and how to create one",
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
    cardTitle: "Learn about cruise pricing, taxation & payments",
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
    cardTitle: "Everything you need to know about cruise payment & cancellation terms",
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

export { youtubeId };

export function chapterThumbnail(m: AcademyModule, c: Chapter): StaticImageData | string {
  if (c.thumbnail) return c.thumbnail;
  return youtubeThumbnail(c.videoUrl) ?? m.cover;
}

export const chapterHref = (m: AcademyModule, c: Chapter) => `/academy/${m.slug}/${c.slug}`;
