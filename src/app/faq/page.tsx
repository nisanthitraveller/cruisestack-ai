"use client";

import React, { useMemo, useRef, useState } from "react";
import styles from "./faq.module.css";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import heroImg from "../../assets/faq-hero.png";
import ctaImg from "../../assets/faq-cta.png";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QA {
  q: string;
  a: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: QA[];
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const icon = {
  general: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 15c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  platform: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5 4 8v8l8 4.5L20 16V8L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  api: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 15 5.5 11.5a3.5 3.5 0 0 1 5-5L14 10M15 9l3.5 3.5a3.5 3.5 0 0 1-5 5L10 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  bookings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  support: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

// ─── Data ────────────────────────────────────────────────────────────────────

const categories: Category[] = [
  {
    id: "general",
    label: "General",
    icon: icon.general,
    items: [
      {
        q: "How can travel agencies automate lead follow-up?",
        a: "Most travel agencies lose bookings not because of bad service, but because of slow follow-up. When a lead comes in via WhatsApp, website, or a call, every hour of delay drops conversion odds. Travel agency automation tools like CruiseStack use AI to instantly respond to new enquiries, qualify the lead based on budget and travel dates, and trigger follow-up sequences automatically so no lead sits untouched. This is especially useful for solo agents or small teams who can't monitor every channel 24/7.",
      },
      {
        q: "What is the best CRM for travel and cruise agents?",
        a: "A good travel CRM needs to do more than store contacts - it should capture leads from multiple channels (WhatsApp, website, calls), auto-qualify them, and push follow-ups without manual work. Generic CRMs like Zoho or HubSpot aren't built for cruise-specific workflows (cabin categories, sailing dates, multi-line comparisons). Purpose-built platforms like CruiseStack combine CRM + booking engine + AI qualification in one system, made specifically for cruise agents.",
      },
      {
        q: "Can AI handle customer enquiries for a travel agency?",
        a: "Yes. AI chatbots and voice bots can handle the first layer of customer conversations - answering FAQs, capturing traveler details, checking budget and dates, and even suggesting cruise options before handing qualified leads to a human agent. This doesn't replace agents; it removes the repetitive first-response work so agents spend time only on serious, ready-to-book leads.",
      },
      {
        q: "What is an AI voice bot and how does it help travel agents?",
        a: "An AI voice bot answers and makes calls automatically — picking up enquiry calls, asking qualifying questions, and logging details into a dashboard, even outside business hours. For travel agents juggling multiple leads daily, this means no missed calls and no lost bookings due to unanswered phones, especially during peak season.",
      },
      {
        q: "Can AI generate cruise quotes and itineraries automatically?",
        a: "Yes — instead of manually checking cabin availability and pricing across cruise lines, AI-powered tools can pull live pricing and generate a shareable quote or itinerary in minutes. This is one of the biggest time-drains for cruise agents that automation directly solves.",
      },
      {
        q: "What is CruiseStack and who is it for?",
        a: "CruiseStack is an AI-powered platform built specifically for cruise travel agents and agencies. It combines a live online booking engine covering 2500+ sailings across major cruise lines with an AI-driven lead dashboard — automating enquiry capture, qualification, quoting, and follow-up. It's built for independent agents and agencies who want to stop losing bookings to slow manual processes.",
      },
      {
        q: "Does CruiseStack work with all major cruise lines?",
        a: "Yes. CruiseStack's booking engine covers 2500+ sailings across all major cruise lines with live pricing and cabin category availability, so agents don't need to check multiple cruise line portals separately.",
      },
      {
        q: "How is CruiseStack different from a generic travel CRM?",
        a: "Generic CRMs are built for general sales pipelines, not cruise-specific workflows like sailing dates, cabin categories, and multi-line price comparison. CruiseStack is purpose-built around this, combining booking data with AI lead handling in one workflow, instead of forcing agents to stitch together separate CRM and booking tools.",
      },
    ],
  },
  {
    id: "about",
    label: "About CruiseStack",
    icon: icon.info,
    items: [
      {
        q: "What is CruiseStack?",
        a: "CruiseStack is an AI-powered cruise booking and management platform built specifically for travel agents and agencies. It combines live cruise inventory, booking, quotes, lead management, AI automation, payments, and back-office operations in one platform.",
      },
      {
        q: "Who is CruiseStack built for?",
        a: "CruiseStack is built for independent travel agents, cruise specialists, and travel agencies selling cruises through B2C or B2B channels.",
      },
      {
        q: "How does CruiseStack help travel agencies sell more cruises?",
        a: "CruiseStack brings cruise search, comparison, quoting, booking, lead management, and AI-powered follow-up into one system. This helps agencies respond faster, reduce manual work, and manage more enquiries without adding unnecessary operational complexity.",
      },
      {
        q: "How is CruiseStack different from a generic travel CRM?",
        a: "Generic CRMs are built around general sales pipelines. CruiseStack is built specifically around cruise workflows such as sailing dates, cabin categories, live pricing, cruise comparisons, quotes, bookings, and cabin blocking — while also providing CRM and AI capabilities.",
      },
    ],
  },
  {
    id: "search",
    label: "Cruise Search, Booking & Quotes",
    icon: icon.bookings,
    items: [
      {
        q: "How many cruise lines and sailings are available on CruiseStack?",
        a: "CruiseStack's booking engine provides access to 36+ cruise lines and 2,600+ sailings, giving agents a wide range of cruise options from one platform.",
      },
      {
        q: "Does CruiseStack show live cruise pricing and cabin availability?",
        a: "Yes. Agents can search live cruise inventory and view current pricing and cabin category availability without having to check multiple cruise line portals separately.",
      },
      {
        q: "Can I compare cruise lines, itineraries and cabins?",
        a: "Yes. Agents can compare cruise lines, sailing dates, itineraries, cabin categories, and pricing in one place, making it easier to find the right option for each customer.",
      },
      {
        q: "Can I book cruises directly through CruiseStack?",
        a: "Yes. Agents can search, quote, and book cruises directly through the platform.",
      },
      {
        q: "Can CruiseStack generate cruise quotes and itineraries automatically?",
        a: "Yes. CruiseStack can use live cruise information to help agents create quotes and itineraries without manually compiling information from multiple cruise line systems.",
      },
      {
        q: "Can I create and share PDF cruise quotations?",
        a: "Yes. Agents can create professional cruise quotations that can be shared directly with customers.",
      },
      {
        q: "Can I block a cabin or lock the price for my customer?",
        a: "Yes. CruiseStack supports cabin blocking and price-lock functionality, allowing agents to secure an option while customers make their final decision.",
      },
    ],
  },
  {
    id: "crm",
    label: "CRM, Leads & AI Automation",
    icon: icon.platform,
    items: [
      {
        q: "How can travel agencies automate lead follow-up?",
        a: "CruiseStack can automatically respond to new enquiries, qualify leads, and trigger follow-up sequences. This helps agencies respond quickly and ensures potential customers don't get forgotten when agents are busy.",
      },
      {
        q: "Can AI handle customer enquiries for a travel agency?",
        a: "Yes. CruiseStack's AI can handle the first layer of customer conversations, answer common questions, collect travel preferences, qualify enquiries, and pass qualified leads to a human agent.",
      },
      {
        q: "What is an AI voice bot and how does it help travel agents?",
        a: "An AI voice bot can answer and make calls automatically, ask qualifying questions, capture customer requirements, and log the information for agents. This helps agencies handle enquiries even when their team is unavailable.",
      },
      {
        q: "Can CruiseStack's AI work on WhatsApp and my website?",
        a: "Yes. CruiseStack's AI can be deployed across customer-facing channels such as your website and WhatsApp, allowing customers to get responses without waiting for an agent.",
      },
      {
        q: "Does AI replace travel agents?",
        a: "No. CruiseStack is designed to support agents, not replace them. AI handles repetitive tasks such as initial enquiries, qualification, and follow-up so agents can focus on customers who are ready to book.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments, B2B, B2C & Integrations",
    icon: icon.api,
    items: [
      {
        q: "Can customers make payments online?",
        a: "Yes. CruiseStack supports online-direct payments, making it easier for customers to complete their bookings digitally.",
      },
      {
        q: "Can CruiseStack be integrated with my existing website?",
        a: "Yes. CruiseStack can be integrated with an existing agency website through options such as iframe and API integration, depending on the agency's requirements.",
      },
      {
        q: "Can I customize CruiseStack for my travel agency?",
        a: "Yes. Agencies can customize elements such as branding and the customer-facing booking experience. Additional integrations and requirements can be discussed based on the agency's needs.",
      },
    ],
  },
  {
    id: "support",
    label: "Getting Started & Support",
    icon: icon.support,
    items: [
      {
        q: "Do I need technical knowledge to use CruiseStack?",
        a: "No. CruiseStack is designed for travel agents and agencies and does not require advanced technical knowledge for everyday use. The team can also assist with setup, integrations, and onboarding.",
      },
      {
        q: "Can independent travel agents use CruiseStack?",
        a: "Yes. CruiseStack can be used by independent agents as well as larger travel agencies, with capabilities designed to support different sales and operational requirements.",
      },
      {
        q: "Do you provide training and support?",
        a: "Yes. CruiseStack provides onboarding and support to help agencies get started with the platform and use its booking, CRM, AI, and operational features effectively.",
      },
      {
        q: "How much does CruiseStack cost?",
        a: "CruiseStack offers packages based on an agency's requirements, including the features, integrations, and scale of the business. Contact the CruiseStack team for pricing and a demo.",
      },
      {
        q: "How do I get started with CruiseStack?",
        a: "You can start by booking a demo with the CruiseStack team. The team can understand your agency's workflow, show you the relevant features, and recommend the right setup.",
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

// Popular topic shortcuts shown in the hero.
const popularTopics: { label: string; categoryId: string }[] = [
  { label: "Booking & Quotes", categoryId: "search" },
  { label: "AI Automation", categoryId: "crm" },
  { label: "Cruise lines", categoryId: "search" },
  { label: "Payments", categoryId: "payments" },
  { label: "Getting Started", categoryId: "support" },
];

const FAQ = () => {
  const [activeId, setActiveId] = useState<string>(categories[0].id);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const faqRef = useRef<HTMLElement>(null);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active.items;
    return active.items.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [active, query]);

  const heroStyle = {
    backgroundImage: `url(${heroImg.src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as React.CSSProperties;

  const ctaStyle = {
    backgroundImage: `linear-gradient(90deg, #eef4fd 0%, rgba(238,244,253,0.85) 40%, rgba(238,244,253,0.35) 70%, rgba(238,244,253,0.15) 100%), url(${ctaImg.src})`,
  } as React.CSSProperties;

  const selectCategory = (id: string) => {
    setActiveId(id);
    setOpenIndex(0);
  };

  const goToTopic = (categoryId: string) => {
    selectCategory(categoryId);
    faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.container}>
      <Header />

      {/* ───── HERO / BANNER ───── */}
      <section className={styles.hero} style={heroStyle}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>FAQ</span>
            <h1>Frequently asked questions</h1>
            <p>
              Get answers to common questions about cruisestack, our platform,
              features, pricing and more.
            </p>

            <div className={styles.searchBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#64748b" strokeWidth="2" />
                <path d="m20 20-3.5-3.5" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.popular}>
              <span className={styles.popularLabel}>Popular topics:</span>
              {popularTopics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  className={styles.popularPill}
                  onClick={() => goToTopic(topic.categoryId)}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── FAQ CONTENT ───── */}
      <section className={styles.faqSection} ref={faqRef}>
        <div className={styles.faqInner}>
          {/* Left: navigation */}
          <aside className={styles.sidebar}>
            <nav className={styles.nav}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.navItem} ${
                    cat.id === activeId ? styles.navItemActive : ""
                  }`}
                  onClick={() => selectCategory(cat.id)}
                >
                  <span className={styles.navIcon}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </nav>

            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 5h16v11H8l-4 4V5Z"
                    stroke="#2563eb"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className={styles.helpTitle}>Can&apos;t find what you&apos;re looking for?</h3>
              <p className={styles.helpDesc}>Our team is here to help.</p>
              <Link href="/contact" className={styles.helpLink}>
                Contact Support →
              </Link>
            </div>
          </aside>

          {/* Right: questions */}
          <div className={styles.content}>
            <h2 className={styles.contentTitle}>{active.label}</h2>

            <div className={styles.accordion}>
              {visibleItems.map((item, i) => {
                const open = openIndex === i;
                return (
                  <div
                    key={item.q}
                    className={`${styles.accItem} ${open ? styles.accItemOpen : ""}`}
                  >
                    <button
                      type="button"
                      className={styles.accTrigger}
                      aria-expanded={open}
                      onClick={() => setOpenIndex(open ? null : i)}
                    >
                      <span>{item.q}</span>
                      <svg
                        className={styles.accChevron}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="m6 9 6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {open && <p className={styles.accBody}>{item.a}</p>}
                  </div>
                );
              })}
              {visibleItems.length === 0 && (
                <p className={styles.noResults}>
                  No questions match &ldquo;{query}&rdquo; in {active.label}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className={styles.ctaSection} style={ctaStyle}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaLeft}>
            <span className={styles.ctaEyebrow}>Still have questions?</span>
            <h2 className={styles.ctaTitle}>Our experts are ready to help.</h2>
            <p className={styles.ctaDesc}>
              Get a personalised walkthrough and see how cruisestack can power
              your cruise business.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/book-a-demo" className={styles.ctaBtn}>
                Book a Demo →
              </Link>
              <Link href="/contact" className={styles.ctaLink}>
                Contact Us
              </Link>
            </div>
          </div>

          <ul className={styles.ctaFeatures}>
            <li className={styles.ctaFeature}>
              <span className={styles.ctaFeatureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16h16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M6 16V9l6-4 6 4v7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <circle cx="12" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              Expert Guidance
            </li>
            <li className={styles.ctaFeature}>
              <span className={styles.ctaFeatureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              Tailored to Your Business
            </li>
            <li className={styles.ctaFeature}>
              <span className={styles.ctaFeatureIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="m9 11.5 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              No Obligation
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
