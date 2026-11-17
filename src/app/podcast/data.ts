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
    slug: "30-years-in-the-cruise-industry-nishit-saxena",
    title: "30 years in the cruise industry: lessons, experiences & building Cruise Professional",
    description:
      "Nishit Saxena, founder of Cruise Professional, on three decades in the cruise industry: how it has changed, building Cruise Professional and what lies ahead.",
    about:
      "What does three decades in the cruise industry teach you? We sit down with Nishit Saxena, founder of Cruise Professional, to talk about his 30-year journey: how the industry has evolved, building Cruise Professional and navigating the changing cruise landscape, and the people, challenges and opportunities that have shaped the business.",
    videoUrl: "https://www.youtube.com/watch?v=9P1wI9KufAg",
    date: "2026-11-11",
    duration: "29:55",
    topics: ["Industry Insights", "Agent Stories"],
    destinations: [],
    language: "English",
  },
  {
    slug: "psa-business-is-changing-vasundhara-gupta",
    title: "PSA business is changing: margins, challenges & the future of cruising in India",
    description:
      "Vasundhara Gupta, Director at ClickMyCruise, on shrinking PSA margins, how PSAs are adapting and what needs to change for cruising to grow in India.",
    about:
      "How has the cruise business changed, and what does it take to survive as margins get tighter? Vasundhara Gupta, Director at ClickMyCruise, talks about the changing dynamics of the cruise industry and the challenges facing PSAs: margins shrinking to as low as 1-2%, how businesses are adapting and competing, and what needs to change for cruising to grow in India.",
    videoUrl: "https://www.youtube.com/watch?v=OhnwvIvOKzY",
    date: "2026-11-02",
    duration: "29:39",
    topics: ["Industry Insights", "Business Growth"],
    destinations: [],
    language: "English",
  },
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

// ─── Short clips ────────────────────────────────────────────────────────────
// The "Short clips" carousel on the Podcast page, in this order (newest first).
// Add a Short with its YouTube link and its title as on YouTube (hashtags left out). `thumbnail` is the cover image YouTube shows for it
// on the channel's Shorts tab (the file name varies: oar1/oar2/oar3/sardefault), so it
// matches YouTube exactly.
// All Shorts: https://www.youtube.com/@cruiseroundtable/shorts

export const SHORTS_CHANNEL_URL = "https://www.youtube.com/@cruiseroundtable/shorts";

export interface PodcastShort {
  title: string;
  videoUrl: string; // YouTube Shorts link
  duration: string; // "0:58"
  thumbnail: string; // https://i.ytimg.com/vi/<id>/<file>.jpg
}

export const podcastShorts: PodcastShort[] = [
  { title: "Expedition Cruises: The ₹10 Lakh+ Cruise Segment | Isha Goyal", videoUrl: "https://www.youtube.com/shorts/kKe7psajABs", duration: "1:00", thumbnail: "https://i.ytimg.com/vi/kKe7psajABs/oar2.jpg" },
  { title: "Eastern India Could Be India's Next Big Cruise Market?", videoUrl: "https://www.youtube.com/shorts/kzuw70hdeRU", duration: "0:30", thumbnail: "https://i.ytimg.com/vi/kzuw70hdeRU/oar2.jpg" },
  { title: "What is the percentage margin a GSA PSA can expect?", videoUrl: "https://www.youtube.com/shorts/vzySqFnz7V0", duration: "0:43", thumbnail: "https://i.ytimg.com/vi/vzySqFnz7V0/oar3.jpg" },
  { title: "What has changed in the way people look at cruises?", videoUrl: "https://www.youtube.com/shorts/oSPS-5lGcSQ", duration: "0:56", thumbnail: "https://i.ytimg.com/vi/oSPS-5lGcSQ/oar3.jpg" },
  { title: "How to Become a PSA & Earn from Cruise Sales? 🚢 | cruisestack.ai", videoUrl: "https://www.youtube.com/shorts/P019sSKVo0I", duration: "1:32", thumbnail: "https://i.ytimg.com/vi/P019sSKVo0I/sardefault.jpg" },
  { title: "Why Aren’t More Indians Going on Cruises? | Harmandeep Singh Anand", videoUrl: "https://www.youtube.com/shorts/z6B0IKqjpyg", duration: "0:45", thumbnail: "https://i.ytimg.com/vi/z6B0IKqjpyg/sardefault.jpg" },
  { title: "From $0 to $6 million per month in two years. 🚀", videoUrl: "https://www.youtube.com/shorts/LGiRaSLrMqU", duration: "0:45", thumbnail: "https://i.ytimg.com/vi/LGiRaSLrMqU/oar1.jpg" },
  { title: "Revenue vs Profit: Why Scale Comes First in Business", videoUrl: "https://www.youtube.com/shorts/nosH9opxe40", duration: "0:58", thumbnail: "https://i.ytimg.com/vi/nosH9opxe40/sardefault.jpg" },
];
