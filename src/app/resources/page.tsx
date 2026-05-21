import React from "react";
import styles from "./Resources.module.css";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import heroImg from '../../assets/hero.png'
import Link from "next/link";
// ─── Types ───────────────────────────────────────────────────────────────────

interface FeaturedCard {
  tag: string;
  title: string;
  desc: string;
}

interface TopicItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface PopularItem {
  tag: string;
  title: string;
  date: string;
  readTime: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const tabs: string[] = ["All", "Blog", "Guides", "Webinars", "Case Studies", "Product Updates", "Press & News"];

const featured: FeaturedCard[] = [
  { tag: "BLOG",  title: "How to Increase Cruise Bookings in 2024",       desc: "Proven strategies to attract more customers and boost conversions." },
  { tag: "GUIDE", title: "The Ultimate Guide to Cruise Inventory",         desc: "Everything you need to know about managing inventory efficiently." },
  { tag: "GUIDE", title: "Automate and Grow Your Travel Business",         desc: "How automation can save time, reduce errors and increase sales." },
  { tag: "BLOG",  title: "Top Trends in Cruise Travel Industry",           desc: "Key trends shaping the future of the cruise travel industry." },
];

const featuredBg: string[] = [
  "linear-gradient(160deg,#c9dff7 0%,#a8c8ef 100%)",
  "linear-gradient(160deg,#d0e8f5 0%,#b0d4ec 100%)",
  "linear-gradient(160deg,#1a3a6b 0%,#2563eb 100%)",
  "linear-gradient(160deg,#cfe4f8 0%,#9dc5ee 100%)",
];

const topics: TopicItem[] = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="11" r="6" stroke="#2563eb" strokeWidth="1.6"/>
        <line x1="13" y1="5" x2="13" y2="3" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="17.2" y1="6.8" x2="18.6" y2="5.4" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="10" y1="18" x2="10" y2="22" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="16" y1="18" x2="16" y2="22" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Industry Insights",
    desc: "Latest trends, analysis and market insights to stay ahead.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="4" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
        <line x1="8" y1="10" x2="18" y2="10" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="8" y1="14" x2="18" y2="14" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="8" y1="18" x2="14" y2="18" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "How-to Guides",
    desc: "Step-by-step guides to help you make the most of CruiseStack.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="3" y="5" width="20" height="16" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
        <polygon points="10,9 10,17 18,13" fill="#2563eb"/>
      </svg>
    ),
    title: "Webinars",
    desc: "Watch expert sessions on topics that matter to your business.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="4" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
        <path d="M8 14 L11 17 L18 10" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Case Studies",
    desc: "Real success stories from travel businesses worldwide.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 3 Q20 3 20 11 L13 22 L6 11 Q6 3 13 3Z" stroke="#2563eb" strokeWidth="1.6" fill="none"/>
        <circle cx="13" cy="10" r="2.5" stroke="#2563eb" strokeWidth="1.6"/>
      </svg>
    ),
    title: "Product Updates",
    desc: "New features and improvements to help you do more.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 4 Q18 4 18 9 L13 9 L8 9 Q8 4 13 4Z" stroke="#2563eb" strokeWidth="1.6" fill="none"/>
        <path d="M8 9 L5 20 L13 17 L21 20 L18 9" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Press & News",
    desc: "Company announcements, press releases and media coverage.",
  },
];

const popular: PopularItem[] = [
  { tag: "BLOG",           title: "Real-time Inventory: The Key to More Bookings",              date: "May 10, 2024", readTime: "5 min read" },
  { tag: "CASE STUDY",     title: "How TravelCo Increased Bookings by 40% with CruiseStack",    date: "Apr 28, 2024", readTime: "7 min read" },
  { tag: "WEBINAR",        title: "Maximizing Revenue with Dynamic Pricing Strategies",          date: "Apr 15, 2024", readTime: "45 min watch" },
  { tag: "GUIDE",          title: "API Integrations: Connect and Scale Seamlessly",             date: "Apr 05, 2024", readTime: "6 min read" },
  { tag: "PRODUCT UPDATE", title: "What's New: Latest Features and Enhancements",              date: "Mar 22, 2024", readTime: "3 min read" },
  { tag: "BLOG",           title: "The Future of Cruise Commerce: What to Expect",              date: "Mar 10, 2024", readTime: "4 min read" },
];

const popularBg: string[] = [
  "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)",
  "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
  "linear-gradient(135deg,#e0effe 0%,#93c5fd 100%)",
  "linear-gradient(135deg,#1a3a6b 0%,#1e40af 100%)",
  "linear-gradient(135deg,#c7d8f5 0%,#93c5fd 100%)",
  "linear-gradient(135deg,#bfdbfe 0%,#60a5fa 100%)",
];

const partners: string[] = ["Aerticket", "GetMyCruise", "seascanner", "CRUISE", "Travel Legends", "TripFactory"];

const tagColorMap: Record<string, string> = {
  "BLOG": "#2563eb",
  "GUIDE": "#0891b2",
  "WEBINAR": "#7c3aed",
  "CASE STUDY": "#059669",
  "PRODUCT UPDATE": "#d97706",
  "PRESS & NEWS": "#dc2626",
};

function tagColor(tag: string): string {
  return tagColorMap[tag.toUpperCase()] ?? "#2563eb";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResourcesPage(): JSX.Element {


  const sectionStyle = {
    backgroundImage: `url(${heroImg.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
  };

  return (
    <div className={styles.page}>
        {/* ───── HERO ───── */}
    
        <Header/>
        <section className={styles.hero} style={sectionStyle}>
      <div className={styles.container}>
 
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>All-in-one Cruise Booking Engine</span>
          <h1>Built for the next generation of cruise travel businesses</h1>
          <p>
            Run your cruise business smarter with live inventory, instant pricing,
            secure booking workflows, and complete operational control across 32+
            international cruise brands.
          </p>
          <div className={styles.heroBtns}>
            <Link href="/bookdemo" className={styles.btnPrimary}>Book a Demo</Link>
            <Link href="/pricing" className={styles.btnOutline}>View Pricing</Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.num}>32+</span>
              <span className={styles.label}>Cruise Lines</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.num}>500+</span>
              <span className={styles.label}>Travel Partners</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.num}>99.9%</span>
              <span className={styles.label}>Uptime</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.num}>4.9/5</span>
              <span className={styles.label}>Customer Rating</span>
            </div>
          </div>
        </div>
 
        <div className={styles.heroRight}>
          {/* Uncomment and use search card / deal card here when ready */}
        </div>
 
      </div>
    </section>
      {/* ── Filter Tabs ── */}
      <section className={styles.tabsSection}>
        <div className={styles.container}>
          <nav className={styles.tabs}>
            {tabs.map((tab, i) => (
              <button key={tab} className={i === 0 ? `${styles.tab} ${styles.tabActive}` : styles.tab}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* ── Featured Resources ── */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured resources</h2>
            <a href="#" className={styles.viewAll}>View all →</a>
          </div>
          <div className={styles.featuredGrid}>
            {featured.map((item, i) => (
              <article key={item.title} className={styles.featuredCard}>
                <div className={styles.featuredImage} style={{ background: featuredBg[i] }}>
                  <svg width="60" height="44" viewBox="0 0 60 44" fill="none" opacity="0.25">
                    <path d="M6 32 Q20 12 30 16 Q40 20 54 10" stroke="white" strokeWidth="2" fill="none"/>
                    <ellipse cx="30" cy="36" rx="22" ry="4" fill="white"/>
                    <path d="M14 28 Q25 16 36 20 Q46 24 52 18" stroke="white" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <div className={styles.featuredBody}>
                  <span className={styles.tag} style={{ color: tagColor(item.tag) }}>{item.tag}</span>
                  <h3 className={styles.featuredTitle}>{item.title}</h3>
                  <p className={styles.featuredDesc}>{item.desc}</p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore by Topic ── */}
      <section className={styles.topicsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Explore by topic</h2>
          <div className={styles.topicsGrid}>
            {topics.map((t) => (
              <div key={t.title} className={styles.topicCard}>
                <div className={styles.topicIcon}>{t.icon}</div>
                <h3 className={styles.topicTitle}>{t.title}</h3>
                <p className={styles.topicDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className={styles.newsletterSection}>
        <div className={styles.container}>
          <div className={styles.newsletterCard}>
            <div className={styles.newsletterIllo}>
              <svg width="110" height="90" viewBox="0 0 110 90" fill="none">
                <rect x="10" y="30" width="70" height="50" rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5"/>
                <path d="M10 36 L45 58 L80 36" stroke="#93c5fd" strokeWidth="1.5" fill="none"/>
                <circle cx="82" cy="22" r="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"/>
                <path d="M76 22 L80 26 L88 18" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="82" cy="10" r="3" fill="#2563eb" opacity="0.6"/>
                <line x1="82" y1="7" x2="82" y2="4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M60 18 Q65 10 72 14" stroke="#93c5fd" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.newsletterContent}>
              <h2 className={styles.newsletterTitle}>Stay updated with the latest resources</h2>
              <p className={styles.newsletterDesc}>Subscribe to our newsletter and never miss insights that can help your business grow.</p>
            </div>
            <div className={styles.newsletterForm}>
              <div className={styles.inputRow}>
                <input type="email" placeholder="Enter your email address" className={styles.emailInput} />
                <button className={styles.subscribeBtn}>Subscribe</button>
              </div>
              <p className={styles.noSpam}>✓ No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Resources ── */}
      <section className={styles.popularSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular resources</h2>
            <a href="#" className={styles.viewAll}>View all →</a>
          </div>
          <div className={styles.popularGrid}>
            {popular.map((item, i) => (
              <article key={item.title} className={styles.popularCard}>
                <div className={styles.popularImage} style={{ background: popularBg[i] }}>
                  <svg width="44" height="32" viewBox="0 0 44 32" fill="none" opacity="0.2">
                    <path d="M4 24 Q14 8 22 12 Q30 16 40 6" stroke="white" strokeWidth="1.8" fill="none"/>
                    <ellipse cx="22" cy="28" rx="16" ry="3" fill="white"/>
                  </svg>
                </div>
                <div className={styles.popularBody}>
                  <span className={styles.tag} style={{ color: tagColor(item.tag) }}>{item.tag}</span>
                  <h3 className={styles.popularTitle}>{item.title}</h3>
                  <p className={styles.popularMeta}>{item.date} &nbsp;•&nbsp; {item.readTime}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className={styles.partnersSection}>
        <div className={styles.container}>
          <p className={styles.partnersLabel}>TRUSTED BY LEADING TRAVEL BRANDS WORLDWIDE</p>
          <div className={styles.partnersGrid}>
            {partners.map((p) => (
              <div key={p} className={styles.partnerLogo}>{p}</div>
            ))}
          </div>
        </div>
      </section>
<Footer />
    </div>
  );
}