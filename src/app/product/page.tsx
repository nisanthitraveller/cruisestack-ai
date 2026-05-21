import React from "react";
import styles from "./Product.module.css";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
}

interface CheckItem {
  text: string;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const IcoInventory = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="4" width="20" height="20" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
    <line x1="4" y1="10" x2="24" y2="10" stroke="#2563eb" strokeWidth="1.4"/>
    <line x1="10" y1="10" x2="10" y2="24" stroke="#2563eb" strokeWidth="1.4"/>
    <path d="M15 15 L18 18 M18 15 L21 18" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="7" cy="7" r="1.2" fill="#2563eb"/>
  </svg>
);

const IcoSearch = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="12" cy="12" r="7" stroke="#2563eb" strokeWidth="1.6"/>
    <line x1="17.5" y1="17.5" x2="23" y2="23" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="12" x2="15" y2="12" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="12" y1="9" x2="12" y2="15" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IcoQuotes = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="3" width="16" height="22" rx="2" stroke="#2563eb" strokeWidth="1.6"/>
    <line x1="7" y1="9" x2="17" y2="9" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="7" y1="13" x2="17" y2="13" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="7" y1="17" x2="13" y2="17" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M18 18 L24 18 M24 18 L22 16 M24 18 L22 20" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoPayments = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="3" y="7" width="22" height="15" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
    <line x1="3" y1="12" x2="25" y2="12" stroke="#2563eb" strokeWidth="1.8"/>
    <rect x="6" y="16" width="5" height="3" rx="1" fill="#2563eb" opacity="0.5"/>
    <rect x="13" y="16" width="3" height="3" rx="1" fill="#2563eb" opacity="0.3"/>
  </svg>
);

const IcoCustomers = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="9" r="4.5" stroke="#2563eb" strokeWidth="1.6"/>
    <path d="M5 24 Q7 18 14 18 Q21 18 23 24" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
    <circle cx="22" cy="9" r="3" stroke="#2563eb" strokeWidth="1.4"/>
    <path d="M25 20 Q26 17 22 17" stroke="#2563eb" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
  </svg>
);

const IcoAutomation = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="4" stroke="#2563eb" strokeWidth="1.6"/>
    <path d="M14 4 L14 7 M14 21 L14 24 M4 14 L7 14 M21 14 L24 14" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M7 7 L9.2 9.2 M18.8 18.8 L21 21 M7 21 L9.2 18.8 M18.8 9.2 L21 7" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IcoAnalytics = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polyline points="4,20 9,13 14,16 19,8 24,11" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="4" y1="23" x2="24" y2="23" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="19" cy="8" r="2" fill="#2563eb" opacity="0.4"/>
  </svg>
);

const IcoAPI = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="10" stroke="#2563eb" strokeWidth="1.6"/>
    <path d="M10 10 L7 14 L10 18" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 10 L21 14 L18 18" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="9" x2="12" y2="19" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IcoCruise = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M8 22 Q18 12 28 22" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M11 22 L11 17 L18 12 L25 17 L25 22" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
    <line x1="6" y1="24" x2="30" y2="24" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IcoPartners = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <circle cx="13" cy="14" r="5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6"/>
    <circle cx="24" cy="14" r="5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6"/>
    <path d="M5 28 Q8 22 13 22 Q18 22 21 25" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
    <path d="M24 22 Q29 22 31 28" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
  </svg>
);

const IcoBookings = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="8" y="8" width="20" height="22" rx="3" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6"/>
    <line x1="12" y1="16" x2="24" y2="16" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="12" y1="21" x2="24" y2="21" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="12" y1="26" x2="18" y2="26" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IcoUptime = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="12" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6"/>
    <path d="M12 18 L16 22 L24 14" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const features: Feature[] = [
  { icon: <IcoInventory />, title: "Live Inventory",        desc: "Real-time access to 32+ cruise lines with live availability and fares." },
  { icon: <IcoSearch />,    title: "Smart Search",          desc: "Advanced search and filters to find the perfect cruise for your customers." },
  { icon: <IcoQuotes />,    title: "Instant Quotes",        desc: "Create branded quotations in seconds and close deals faster." },
  { icon: <IcoPayments />,  title: "Bookings & Payments",   desc: "Seamless booking flow with multiple payment options and security." },
  { icon: <IcoCustomers />, title: "Customer Management",   desc: "Manage customers, preferences and history in one central place." },
  { icon: <IcoAutomation />,title: "Automation",            desc: "Automate workflows, alerts and follow-ups to save time." },
  { icon: <IcoAnalytics />, title: "Analytics & Reports",   desc: "Track performance, sales trends and business insights in real-time." },
  { icon: <IcoAPI />,       title: "API & Integrations",    desc: "Easy integrate with your website, CRM, and other tools." },
];

const stats: StatItem[] = [
  { icon: <IcoCruise />,   value: "32+",   label: "Global Cruise Lines" },
  { icon: <IcoPartners />, value: "10K+",  label: "Travel Partners" },
  { icon: <IcoBookings />, value: "1M+",   label: "Bookings Processed" },
  { icon: <IcoUptime />,   value: "99.9%", label: "Platform Uptime" },
];

const checks: CheckItem[] = [
  { text: "All-in-one cruise commerce platform" },
  { text: "Scalable for agencies, OTAs and enterprises" },
  { text: "Secure, reliable and always up-to-date" },
  { text: "Dedicated support and onboarding" },
];

// Mock cruise results for the UI preview
const cruiseResults = [
  { nights: 7, name: "7 Nights Eastern Caribbean", ship: "MSC Seascape", route: "Miami, FL → Ocean Cay → Nassau → Puerto Plata → Miami, FL", ports: 2, price: "$899" },
  { nights: 7, name: "7 Nights Western Caribbean", ship: "Royal Caribbean – Harmony of the Seas", route: "Galveston, TX → Cozumel → Roatan → Costa Maya → Galveston, TX", ports: 3, price: "$1,049" },
  { nights: 7, name: "7 Nights Mediterranean", ship: "Costa Smeralda", route: "Barcelona, Spain → Marseille → Genoa → Civitavecchia → Barcelona", ports: 4, price: "$1,199" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Product(): JSX.Element {
  return (
    <div className={styles.page}>
        <Header />
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>PRODUCT</span>
            <h1 className={styles.heroTitle}>Everything you need to sell, manage, and scale cruise bookings</h1>
            <p className={styles.heroDesc}>
              CruiseStack brings together inventory, pricing, booking, payments, and
              operations in one unified platform built for modern travel businesses.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary}>Book a Demo</button>
              <button className={styles.btnGhost}>Explore Features →</button>
            </div>
          </div>

          {/* ── Dashboard Preview ── */}
          <div className={styles.dashboardWrap}>
            <div className={styles.dashboard}>
              {/* Sidebar */}
              <div className={styles.dbSidebar}>
                <div className={styles.dbSidebarHeader}>
                  <div className={styles.dbSidebarDot} />
                  <span>Overview</span>
                </div>
                {["Search","Bookings","Customers","Inventory","Finance","Reports","Settings","Integrations"].map((item) => (
                  <div key={item} className={styles.dbSidebarItem}>{item}</div>
                ))}
              </div>
              {/* Main */}
              <div className={styles.dbMain}>
                <div className={styles.dbTopBar}>
                  <span className={styles.dbPageTitle}>Dashboard</span>
                  <div className={styles.dbCustomizeBtn}>✦ Customize</div>
                </div>
                {/* Stat cards */}
                <div className={styles.dbStatRow}>
                  {[
                    { label: "Revenue", sub: "Fixed Month", val: "$8,645,290", badge: "+4.7%" },
                    { label: "Bookings", sub: "Fixed Month", val: "2,340", badge: "+2.1%" },
                    { label: "Guests In", sub: "", val: "1,680", badge: "+6.7%" },
                    { label: "Active Bookings", sub: "", val: "320", badge: "-2.7%" },
                  ].map((s) => (
                    <div key={s.label} className={styles.dbStatCard}>
                      <div className={styles.dbStatLabel}>{s.label}</div>
                      <div className={styles.dbStatVal}>{s.val}</div>
                      <div className={`${styles.dbStatBadge} ${s.badge.startsWith("-") ? styles.dbStatBadgeNeg : ""}`}>{s.badge}</div>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className={styles.dbChart}>
                  <svg width="100%" height="70" viewBox="0 0 300 70" preserveAspectRatio="none">
                    <path d="M0 55 Q40 40 70 45 Q110 50 140 30 Q180 10 220 25 Q260 38 300 20" stroke="#2563eb" strokeWidth="2" fill="none"/>
                    <path d="M0 55 Q40 40 70 45 Q110 50 140 30 Q180 10 220 25 Q260 38 300 20 L300 70 L0 70Z" fill="rgba(37,99,235,0.08)"/>
                  </svg>
                </div>
                {/* Recent bookings */}
                <div className={styles.dbRecentLabel}>Recent Bookings</div>
                {["ICS-7831","ICS-7830"].map((id) => (
                  <div key={id} className={styles.dbBookingRow}>
                    <div className={styles.dbBookingId}>{id}</div>
                    <div className={styles.dbBookingDate}>May 19, 2024</div>
                  </div>
                ))}
                {/* Report tabs */}
                <div className={styles.dbReportTabs}>
                  {["Bookings","Revenue","Guests","Conversion Rate","This Month"].map((t) => (
                    <span key={t} className={styles.dbReportTab}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.centeredTitle}>Powerful features for every part<br className={styles.titleBr} /> of your business</h2>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Growth Section ── */}
      <section className={styles.growthSection}>
        <div className={styles.container}>
          <div className={styles.growthGrid}>

            {/* Left content */}
            <div className={styles.growthContent}>
              <span className={styles.eyebrowGreen}>BUILT FOR GROWTH</span>
              <h2 className={styles.growthTitle}>One platform.<br />Endless possibilities.</h2>
              <p className={styles.growthDesc}>
                From search to settlement, CruiseStack streamlines your entire cruise
                commerce workflow so you can focus on growth.
              </p>
              <ul className={styles.checkList}>
                {checks.map((c) => (
                  <li key={c.text} className={styles.checkItem}>
                    <span className={styles.checkIcon}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#2563eb" strokeWidth="1.4"/>
                        <path d="M5 8 L7 10 L11 6" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {c.text}
                  </li>
                ))}
              </ul>
              <button className={styles.btnPrimary} style={{ marginTop: "8px" }}>Book a Demo</button>
            </div>

            {/* Right — search results UI mock */}
            <div className={styles.searchMockWrap}>
              <div className={styles.searchMock}>
                {/* Top bar */}
                <div className={styles.smTopBar}>
                  <span className={styles.smTitle}>Search Cruises</span>
                  <div className={styles.smRefreshIcon}>↻</div>
                </div>
                {/* Search bar */}
                <div className={styles.smSearchRow}>
                  <div className={styles.smChip}>⇄ Round Trip</div>
                  <div className={styles.smChip}>👤 2 Guests, 1 Room</div>
                  <div className={styles.smChip}>📅 May 20 – May 27, 2024</div>
                  <div className={styles.smSearchBtn}>🔍 Search</div>
                  <div className={styles.smAdvanced}>Advanced Search ▾</div>
                </div>
                {/* Results */}
                <div className={styles.smResults}>
                  {cruiseResults.map((r, i) => (
                    <div key={i} className={styles.smResultCard}>
                      <div className={styles.smResultImg}>
                        <svg width="100%" height="100%" viewBox="0 0 90 64" fill="none">
                          <rect width="90" height="64" fill={i === 0 ? "#c7d8f5" : i === 1 ? "#d1e7dd" : "#dbeafe"}/>
                          <path d="M10 44 Q30 20 45 26 Q60 32 80 18" stroke="rgba(26,58,107,0.3)" strokeWidth="2" fill="none"/>
                          <ellipse cx="45" cy="52" rx="30" ry="5" fill="rgba(26,58,107,0.12)"/>
                        </svg>
                      </div>
                      <div className={styles.smResultBody}>
                        <div className={styles.smResultName}>{r.name}</div>
                        <div className={styles.smResultShip}>{r.ship}</div>
                        <div className={styles.smResultRoute}>{r.route}</div>
                        <div className={styles.smResultMeta}>
                          <span>⏱ {r.nights} Nights</span>
                          <span>⚓ {r.ports} Ports</span>
                        </div>
                      </div>
                      <div className={styles.smResultPrice}>
                        <div className={styles.smResultFrom}>From</div>
                        <div className={styles.smResultAmt}>{r.price}</div>
                        <div className={styles.smResultPer}>Per Person</div>
                        <button className={styles.smViewBtn}>View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.smFooter}>
                  Showing 1 to 10 of 245 results
                  <div className={styles.smPager}>
                    <span>‹</span><span className={styles.smPagerActive}>1</span><span>2</span><span>3</span><span>...</span><span>25</span><span>›</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
            <Footer/>
    </div>
  );
}