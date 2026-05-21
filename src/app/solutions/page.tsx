import React from "react";
import Link from "next/link";
import styles from "./Solutions.module.css";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Solution {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface WhyItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const solutions: Solution[] = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="12" cy="10" r="4" stroke="#2563eb" strokeWidth="1.6"/>
        <circle cx="22" cy="10" r="4" stroke="#2563eb" strokeWidth="1.6"/>
        <path d="M4 26 Q6 20 12 20 Q17 20 19 23" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M22 20 Q28 20 28 26" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    title: "Travel Agencies",
    desc: "Streamline cruise bookings and manage your clients efficiently with real-time inventory, quotes and automated workflows.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="16" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
        <line x1="16" y1="22" x2="16" y2="27" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="10" y1="27" x2="22" y2="27" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M9 14 L13 18 L23 10" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Online Travel Agencies",
    desc: "Scale your platform with real-time inventory and seamless integrations that enhance user experience and drive more bookings.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="11" y="4" width="10" height="14" rx="2" stroke="#2563eb" strokeWidth="1.6"/>
        <path d="M7 18 L7 28 L25 28 L25 18" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="18" x2="16" y2="28" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Tour Operators",
    desc: "Create custom packages and manage group bookings with ease, all in one powerful platform.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="14" height="20" rx="2" stroke="#2563eb" strokeWidth="1.6"/>
        <line x1="7" y1="11" x2="15" y2="11" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="7" y1="15" x2="15" y2="15" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="7" y1="19" x2="12" y2="19" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M20 14 L28 14 M28 14 L25 11 M28 14 L25 17" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Enterprise Solutions",
    desc: "Power your enterprise operations with advanced tools, role-based access, automation and dedicated support.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 8 L26 8 L22 18 L10 18 Z" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
        <circle cx="12" cy="23" r="2" stroke="#2563eb" strokeWidth="1.6"/>
        <circle cx="21" cy="23" r="2" stroke="#2563eb" strokeWidth="1.6"/>
        <path d="M6 8 L4 4" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M16 8 L16 18" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "API Solutions",
    desc: "Integrate our robust API to access live inventory, pricing, and booking capabilities directly into your systems.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4 C8 4 4 9 4 14 C4 18 6.5 21.5 10 23 L10 28 L14 25 C14.6 25.1 15.3 25.2 16 25.2 C24 25.2 28 20 28 14 C28 9 24 4 16 4Z" stroke="#2563eb" strokeWidth="1.6" fill="none"/>
        <circle cx="11" cy="14" r="1.5" fill="#2563eb"/>
        <circle cx="16" cy="14" r="1.5" fill="#2563eb"/>
        <circle cx="21" cy="14" r="1.5" fill="#2563eb"/>
      </svg>
    ),
    title: "WhatsApp Automation",
    desc: "Engage your customers on WhatsApp with automated responses, instant quotes and secure booking flows.",
  },
];

const whyItems: WhyItem[] = [
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="11" stroke="#2563eb" strokeWidth="1.6"/>
        <path d="M15 9 L15 15 L19 18" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Real-time Access",
    desc: "Live inventory & pricing from 32+ global cruise lines.",
  },
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 3 L25 7 L25 15 Q25 22 15 27 Q5 22 5 15 L5 7 Z" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
        <path d="M10 15 L13 18 L20 12" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Reliable & Secure",
    desc: "Secure bookings, payments and data protection.",
  },
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="10" stroke="#2563eb" strokeWidth="1.6"/>
        <path d="M15 9 L15 15" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="15" cy="18" r="1.2" fill="#2563eb"/>
        <path d="M11 7 Q15 4 19 7" stroke="#2563eb" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M8 10 Q5 14 6 18" stroke="#2563eb" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M22 10 Q25 14 24 18" stroke="#2563eb" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    title: "End-to-End Automation",
    desc: "Automate workflows and save time across operations.",
  },
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <polyline points="4,22 10,14 16,17 22,8 26,12" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="4" y1="26" x2="26" y2="26" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Scalable Platform",
    desc: "Built to grow with your business, wherever you are.",
  },
  {
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M10 8 Q10 4 15 4 Q20 4 20 8 Q20 12 15 14 Q10 12 10 8Z" stroke="#2563eb" strokeWidth="1.6" fill="none"/>
        <path d="M6 26 Q7 20 15 20 Q23 20 24 26" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <line x1="22" y1="14" x2="26" y2="14" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="22" y1="17" x2="26" y2="17" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Expert Support",
    desc: "Dedicated support from cruise experts.",
  },
];

const testimonials: Testimonial[] = [
  {
    quote: "CruiseStack has transformed the way we manage cruise bookings. The real-time inventory and instant quotes have significantly boosted our sales.",
    name: "Sarah Johnson",
    role: "Head of Operations, TravelCo",
    rating: 5,
  },
  {
    quote: "The automation and seamless integrations have saved us countless hours. Our customers love the fast and reliable booking experience.",
    name: "Michael Chen",
    role: "CEO, Oceanic Travels",
    rating: 5,
  },
  {
    quote: "From group bookings to custom packages, CruiseStack gives us everything we need to run our tour operations smoothly.",
    name: "Priya Mehta",
    role: "Tour Director, WorldCruises",
    rating: 5,
  },
];

const avatarColors = ["#c7d8f5", "#d1e7dd", "#fde8cc"];

const partners: string[] = ["Aerticket", "GetMyCruise", "seascanner", "CRUISE", "Travel Legends", "TripFactory"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SolutionsPage() {
  return (
    <div className={styles.page}>
        <Header/>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>SOLUTIONS</span>
            <h1 className={styles.heroTitle}>Built for every type of cruise business</h1>
            <p className={styles.heroDesc}>
              Whether you are a travel agency, OTA, tour operator or enterprise,
              CruiseStack provides the tools you need to grow and operate efficiently.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary}>Book a Demo</button>
              <button className={styles.btnGhost}>Talk to an Expert →</button>
            </div>
          </div>
          <div className={styles.heroImageWrap}>
            <div className={styles.heroImagePlaceholder}>
              <svg width="80" height="60" viewBox="0 0 80 60" fill="none" opacity="0.25">
                <rect x="5" y="8" width="70" height="44" rx="4" stroke="#1a3a6b" strokeWidth="2"/>
                <circle cx="28" cy="28" r="9" stroke="#1a3a6b" strokeWidth="2"/>
                <circle cx="54" cy="28" r="9" stroke="#1a3a6b" strokeWidth="2"/>
                <path d="M10 52 Q28 40 40 44 Q54 48 70 40" stroke="#1a3a6b" strokeWidth="1.5" fill="none"/>
              </svg>
              <p style={{ color: "#1a3a6b", opacity: 0.35, fontSize: "12px", marginTop: "8px" }}>Team photo</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solutions Grid ── */}
      <section className={styles.solutionsSection}>
        <div className={styles.container}>
          <h2 className={styles.centeredTitle}>Solutions designed for your business needs</h2>
          <div className={styles.solutionsGrid}>
            {solutions.map((s) => (
              <div key={s.title} className={styles.solutionCard}>
                <div className={styles.solutionIcon}>{s.icon}</div>
                <h3 className={styles.solutionTitle}>{s.title}</h3>
                <p className={styles.solutionDesc}>{s.desc}</p>
                <a href="#" className={styles.learnMore}>Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why CruiseStack ── */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.centeredTitle}>Why businesses choose CruiseStack</h2>
          <div className={styles.whyGrid}>
            {whyItems.map((w) => (
              <div key={w.title} className={styles.whyItem}>
                <div className={styles.whyIcon}>{w.icon}</div>
                <h3 className={styles.whyTitle}>{w.title}</h3>
                <p className={styles.whyDesc}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBannerSection}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div className={styles.ctaBannerLeft}>
              <div className={styles.ctaIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2 C6 2 2 6 2 10 C2 14 4.5 17 8 18.5 L8 22 L11 20 C11.3 20.05 11.65 20.1 12 20.1 C18 20.1 22 16 22 10 C22 6 18 2 12 2Z" stroke="white" strokeWidth="1.6" fill="none"/>
                  <circle cx="8" cy="10" r="1.2" fill="white"/>
                  <circle cx="12" cy="10" r="1.2" fill="white"/>
                  <circle cx="16" cy="10" r="1.2" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.ctaBannerTitle}>Not sure which solution fits you?</h3>
                <p className={styles.ctaBannerDesc}>Our experts can help you find the right fit for your business.</p>
              </div>
            </div>
            <button className={styles.btnPrimaryWhite}>Talk to an Expert</button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.centeredTitle}>Loved by cruise businesses worldwide</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.quoteIcon}>
                  <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                    <path d="M2 12 Q2 2 10 2 L10 8 Q6 8 6 12 L6 18 L2 18 Z" fill="#dbeafe"/>
                    <path d="M16 12 Q16 2 24 2 L24 8 Q20 8 20 12 L20 18 L16 18 Z" fill="#dbeafe"/>
                  </svg>
                </div>
                <p className={styles.testimonialQuote}>{t.quote}</p>
                <div className={styles.testimonialAuthor}>
                  <div
                    className={styles.testimonialAvatar}
                    style={{ backgroundColor: avatarColors[i] }}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle cx="14" cy="10" r="5" fill="rgba(26,58,107,0.25)"/>
                      <ellipse cx="14" cy="22" rx="8" ry="5" fill="rgba(26,58,107,0.18)"/>
                    </svg>
                  </div>
                  <div>
                    <p className={styles.testimonialName}>{t.name}</p>
                    <p className={styles.testimonialRole}>{t.role}</p>
                  </div>
                  <div className={styles.stars}>
                    {"★".repeat(t.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.testimonialDots}>
            <span className={`${styles.dot} ${styles.dotActive}`} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.bottomCtaSection}>
        <div className={styles.container}>
          <div className={styles.bottomCtaCard}>
            <div className={styles.bottomCtaImage}>
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" opacity="0.3">
                <ellipse cx="60" cy="68" rx="50" ry="8" fill="#93c5fd"/>
                <path d="M18 52 Q40 20 60 26 Q80 32 102 18" stroke="#93c5fd" strokeWidth="2.5" fill="none"/>
                <path d="M28 48 Q48 24 66 30 Q84 36 98 24" stroke="#bfdbfe" strokeWidth="1.8" fill="none"/>
              </svg>
            </div>
            <div className={styles.bottomCtaContent}>
              <h2 className={styles.bottomCtaTitle}>Ready to grow your cruise business?</h2>
              <p className={styles.bottomCtaDesc}>
                Join thousands of travel businesses already using CruiseStack to sell more,
                work less, and deliver better experiences.
              </p>
            </div>
            <div className={styles.bottomCtaActions}>
              <button className={styles.btnPrimary}>Book a Demo</button>
              <a href="#" className={styles.exploreLink}>Explore Features →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className={styles.partnersSection}>
        <div className={styles.container}>
          <p className={styles.partnersLabel}>Trusted by leading travel brands worldwide</p>
          <div className={styles.partnersGrid}>
            {partners.map((p) => (
              <div key={p} className={styles.partnerLogo}>{p}</div>
            ))}
          </div>
        </div>
      </section>
            <Footer/>
    </div>
  );
}