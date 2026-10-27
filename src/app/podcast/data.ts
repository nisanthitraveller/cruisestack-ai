// ─── Podcast episodes ───────────────────────────────────────────────────────
// Everything on the Podcast pages comes from this list. Add an episode with its
// YouTube link; the thumbnail is taken from YouTube automatically. The Topic,
// Destination and Language filters are built from the values used here, so a
// new tag appears in the filters as soon as an episode uses it.
// Channel: https://www.youtube.com/@cruiseroundtable

export interface PodcastEpisode {
  slug: string;
  title: string;
  description: string; // short, for the episode cards
  about?: string; // longer, for the episode page; falls back to `description`
  videoUrl: string; // YouTube link
  date: string; // publish date, "2026-10-21"
  duration?: string; // "32:15"
  topics: string[]; // e.g. "Industry Insights", "Agent Stories", "Sales & Marketing"
  destinations: string[]; // e.g. "Alaska", "Mediterranean"; empty if not destination-specific
  language: string; // e.g. "English"
}

export const podcastEpisodes: PodcastEpisode[] = [
  {
    slug: "how-to-make-money-as-a-psa-jagsons",
    title: "How to make money as a PSA? Harmandeep Singh Anand of Jagsons",
    description:
      "Harmandeep Singh Anand of Jagsons on starting out as a Passenger Sales Agent, how the PSA model works and how agents can grow in cruise.",
    about:
      "What does it take to build a successful Passenger Sales Agent (PSA) business in the travel industry? We sit down with Harmandeep Singh Anand from Jagsons to discuss his journey, what a PSA does, how PSAs connect travel agents with cruise lines and cruise inventory, and the opportunities and challenges of running a PSA business.",
    videoUrl: "https://www.youtube.com/watch?v=1ReKGiF-4cQ",
    date: "2026-10-26",
    duration: "26:45",
    topics: ["Agent Stories", "Industry Insights"],
    destinations: [],
    language: "English",
  },
  {
    slug: "how-aerticket-built-its-business-in-india",
    title: "How AERTiCKET built its business in India: growth, scale & profitability",
    description:
      "Vijay Kesavan on AERTiCKET's journey in India: entering a new market, scaling a B2B travel business and balancing growth with profitability.",
    about:
      "Vijay Kesavan joins us to talk about AERTiCKET's journey in India, the realities of growing a travel business and the decisions that shape long-term success: entering a new market, building and scaling a B2B travel business, revenue and gross margins, and why scale can take priority in the early years.",
    videoUrl: "https://www.youtube.com/watch?v=GE9Lh3n5-fc",
    date: "2026-10-19",
    duration: "29:58",
    topics: ["Industry Insights", "Business Growth"],
    destinations: [],
    language: "English",
  },
];

// Newest first
export const sortedEpisodes = [...podcastEpisodes].sort((a, b) => b.date.localeCompare(a.date));

export const episodeHref = (e: PodcastEpisode) => `/podcast/${e.slug}`;

export const getEpisode = (slug: string) => podcastEpisodes.find((e) => e.slug === slug) ?? null;

export const formatEpisodeDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
