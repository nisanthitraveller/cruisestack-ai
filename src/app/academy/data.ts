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
  examFormUrl?: string; // Google Form for this module's certification exam; falls back to CERTIFICATION_EXAM_FORM_URL
}

// ─── Certification program ──────────────────────────────────────────────────
// Google Form opened after a successful enrolment (the "Enrol now" button).
// Set it here for every module, or per module with `examFormUrl`.
export const CERTIFICATION_EXAM_FORM_URL = "";

export const academyModules: AcademyModule[] = [
  {
    slug: "destinations-ports-cruise-lines",
    number: 1,
    title: "Destinations, ports & cruise lines",
    cardTitle: "Cruise destinations, ports & cruise lines",
    heading: "Learn about cruise destinations, ports & cruise lines",
    intro: "Learn how to match a client to the right cruise destination, port and cruise line. You'll see which destinations get the most search and booking traffic, when each is best to sail, where ships depart from, and which lines are most active there.",
    seoTitle: "Cruise Destinations, Ports & Cruise Lines Guide for Agents",
    seoDescription:
      "Learn the top cruise destinations, key cities, best season months, departure ports and most active cruise lines, with video chapters inside cruisestack.ai.",
    description:
      "Learn about popular destinations, key cities, best season months, active departure ports and top cruise lines.",
    icon: "pin",
    cover: coverShip,
    chapters: [
      {
        slug: "top-10-destinations-percentage-of-traffic",
        title: "Top 10 destinations, percentage of traffic",
        cardTitle: "Understanding the top 10 cruise destinations by traffic",
        heading: "Top 10 cruise destinations by share of traffic",
        seoTitle: "Top 10 Cruise Destinations by Search & Booking Traffic",
        seoDescription:
          "See the top 10 cruise destinations ranked by share of search and booking traffic in cruisestack.ai. 3:40 video tutorial.",
        description:
          "Learn about the top 10 cruise destinations based on search and booking traffic in cruisestack.ai.",
        duration: "3:40",
        updated: "Sep 2026",
        videoUrl: "https://www.youtube.com/watch?v=vsrzSXGnmS4",
      },
      {
        slug: "top-10-destinations-key-cities",
        title: "Top 10 destinations and key cities covered",
        cardTitle: "Learn the key cities covered by the top 10 cruise destinations",
        heading: "Top 10 cruise destinations and the key cities covered",
        seoTitle: "Top Cruise Destinations and Key Cities & Ports Covered | cruisestack.ai Academy",
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
        cardTitle: "Best time to cruise to the top 10 cruise destinations",
        heading: "Best time to cruise: season months for the top 10 destinations",
        seoTitle: "Best Time to Cruise: Season Months for Top Destinations | cruisestack.ai Academy",
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
        seoTitle: "Most Active Cruise Departure Ports by Destination | cruisestack.ai Academy",
        seoDescription:
          "Find which departure ports are most active for each top cruise destination and how to search them in cruisestack.ai.",
        description:
          "Learn which departure ports are most active for each destination and how to find them in cruisestack.ai.",
        duration: "3:06",
        updated: "Oct 2026",
        videoUrl: "https://www.youtube.com/watch?v=ygfW6FDkvYw",
      },
      {
        slug: "top-10-destinations-cruise-lines",
        title: "Top 10 destinations and most active cruise lines",
        cardTitle: "Leading cruise lines operating across the top 10 cruise destinations",
        heading: "Most active cruise lines for the top 10 cruise destinations",
        seoTitle: "Most Active Cruise Lines by Destination: How to Compare | cruisestack.ai Academy",
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
    heading: "Cruise cabin types, room categories & decks explained",
    intro: "Learn about room categories, what a guarantee cabin really is, how special packages work, how deck position changes the stay, and how to read cabin inventory.",
    seoTitle: "Cruise Cabin Types, Room Categories & Decks Explained",
    seoDescription: "Understand cruise room categories, guarantee cabins, special packages, deck selection and cabin inventory.",
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
          "Use the cruisestack.ai search filters to choose destinations, departure ports, cruise lines, sailing dates, duration and passengers.",
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
    heading: "Understanding cruise trip summaries",
    intro: "A trip summary gives clients a clear picture of their cruise before they make a booking decision. In this module, learn how to read, understand, and share trip summaries effectively so clients have the information they need, questions are reduced, and bookings move towards confirmation.",
    seoTitle: "Cruise Trip Summary: How to Read, Share & Use It | Module 3",
    seoDescription: "Learn to read and share cruise trip summaries with clients: sailing times, shore excursions, inclusions and exclusions, all in cruisestack.ai.",
    description:
      "Learn how to read, share and use trip summaries, including sailing times, shore excursions and inclusions/exclusions.",
    icon: "document",
    cover: seaDeck,
    // Playlist: https://www.youtube.com/playlist?list=PLPkepYH5DNwU
    chapters: [
      {
        slug: "read-cruise-trip-summary",
        title: "How to read a cruise trip summary: key details every travel agent should check",
        description:
          "Learn how to read a cruise trip summary and the key details every travel agent should check before sharing it.",
        duration: "4:51",
        updated: "Nov 2026",
        videoUrl: "https://www.youtube.com/watch?v=QTpCTPO6roo",
      },
      {
        slug: "share-trip-summary-with-customer",
        title: "How to share a trip summary with the customer",
        description: "Learn how to share a trip summary with your customer from cruisestack.ai.",
        duration: "2:41",
        updated: "Nov 2026",
        videoUrl: "https://www.youtube.com/watch?v=R2ANNAEcesk",
      },
    ],
  },
  {
    slug: "pricing-taxation-payments",
    number: 4,
    title: "Pricing, taxation & payments",
    cardTitle: "Learn about cruise pricing, taxation & payments",
    heading: "Cruise pricing, TCS & GST, and payments in INR & USD",
    intro: "Tax and currency are where cruise quotes get confusing. This module breaks down the price, and covers payment options and paperwork.",
    seoTitle: "Pricing, taxation & payments",
    seoDescription: "Understand cruise price breakdowns, and the documents you need.",
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
    cardTitle: "Cruise payment & cancellation terms",
    heading: "Cruise payment terms, cancellation policy & group discounts",
    seoTitle: "Cruise Payment Schedule, Cancellation Policy & Group Discounts | Module 5",
    seoDescription: "Learn cruise deposits, payment deadlines, cancellation terms, currency conversion, bank charges and group discounts, so clients know the rules before they book.",
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
export const certificationHref = (m: AcademyModule) => `/academy/${m.slug}/certification`;
export const examFormUrl = (m: AcademyModule) => m.examFormUrl || CERTIFICATION_EXAM_FORM_URL;

export { youtubeId };

export function chapterThumbnail(m: AcademyModule, c: Chapter): StaticImageData | string {
  if (c.thumbnail) return c.thumbnail;
  return youtubeThumbnail(c.videoUrl) ?? m.cover;
}

export const chapterHref = (m: AcademyModule, c: Chapter) => `/academy/${m.slug}/${c.slug}`;
