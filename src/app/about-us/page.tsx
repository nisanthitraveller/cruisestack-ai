import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./About.module.css";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import heroImg from "../../assets/hero-r.png";
import ctaImg from "../../assets/faq-cta.png";
import binseImg from "../../assets/team/binse.png";
import jobinImg from "../../assets/team/jobin.png";
import nisanthImg from "../../assets/team/nisanth.jpeg";
import sanuImg from "../../assets/team/sanu.png";
import shijuImg from "../../assets/team/shiju.png";
import sonalImg from "../../assets/team/sonal.png";
import thahirImg from "../../assets/team/thahir.png";
import tanishaImg from "../../assets/team/tanisha.png";
import vipinImg from "../../assets/team/vipin.png";
import linkedinIcon from "../../assets/linkedin-square-icon.svg";

export const metadata: Metadata = {
  title: "About Us - cruisestack",
  description:
    "CruiseStack is a technology company on a mission to make cruise commerce simpler, smarter and more accessible for travel businesses around the world.",
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} strokeWidth={2.2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Waves = () => (
  <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
    <path d="M1 6c3-4 6-4 8 0s5 4 8 0 6-4 8 0M1 12c3-4 6-4 8 0s5 4 8 0 6-4 8 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// ─── Content ─────────────────────────────────────────────────────────────────

const stats = [
  { num: "30+", label: "Cruise Lines" },
  { num: "500+", label: "Travel Partners" },
  { num: "1K+", label: "Bookings Processed" },
  { num: "99.9%", label: "Platform Uptime" },
];

const timeline = [
  {
    marker: "2012",
    title: "The beginning",
    desc: "Our journey in travel and technology began, with a focus on creating better ways to experience cruises.",
  },
  {
    title: "GetMyCruise",
    desc: "We launched GetMyCruise, a consumer platform to inspire travelers and make cruise holidays accessible to everyone.",
  },
  {
    title: "CruiseStack",
    desc: "We created CruiseStack to empower travel businesses with a complete cruise commerce solution.",
  },
];

const values = [
  {
    title: "Customer First",
    desc: "We succeed when our customers succeed.",
    icon: <svg width="34" height="34" viewBox="0 0 24 24" {...stroke}><path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.5-7.5 10-7.5 10Z" /></svg>,
  },
  {
    title: "Innovation",
    desc: "We build for a better, smarter tomorrow.",
    icon: <svg width="34" height="34" viewBox="0 0 24 24" {...stroke}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></svg>,
  },
  {
    title: "Integrity",
    desc: "We do what’s right, always.",
    icon: <svg width="34" height="34" viewBox="0 0 24 24" {...stroke}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /></svg>,
  },
  {
    title: "Excellence",
    desc: "We strive for the highest standards in everything we do.",
    icon: <svg width="34" height="34" viewBox="0 0 24 24" {...stroke}><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8z" /></svg>,
  },
];

// Same team and order as getmycruise.com.
const team = [
  { name: "Binse Abraham", role: "Head of UX", photo: binseImg, linkedin: "https://www.linkedin.com/in/binse" },
  { name: "Jobin Jose V", role: "Frontend Developer", photo: jobinImg, linkedin: "https://www.linkedin.com/in/jobinvani/" },
  { name: "Nisanth Kumar", role: "CTO", photo: nisanthImg, linkedin: "https://www.linkedin.com/in/nisanthkumar" },
  { name: "Sanu Tomy", role: "Sales and Operations", photo: sanuImg, linkedin: "https://www.linkedin.com/in/sanu-tomy-638284159/" },
  { name: "Shiju Radhakrishnan", role: "CEO", photo: shijuImg, linkedin: "https://www.linkedin.com/in/sijuradhakrishnan/" },
  { name: "Sonal Pasi", role: "Marketing Manager", photo: sonalImg, linkedin: "https://www.linkedin.com/in/sonal-pasi-02a837254/" },
  { name: "Thahir Backer", role: "Finance & Admin", photo: thahirImg, linkedin: null },
  { name: "Tanisha Bajaj", role: "Product Manager", photo: tanishaImg, linkedin: "https://www.linkedin.com/in/tanisha-bajaj-574482243/" },
  { name: "Vipin Nair E", role: "Head of Growth & Operations", photo: vipinImg, linkedin: "https://www.linkedin.com/in/vipin-nair-/" },
];

const customers = [
  {
    title: "Travel Agencies",
    desc: "Streamline your cruise sales and customer management.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" {...stroke}><path d="M4 9.5V20h16V9.5M3 5h18l-1 4.5a2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0L3 5ZM9.5 20v-5h5v5" /></svg>,
  },
  {
    title: "OTAs",
    desc: "Power your customer-facing booking experience with our technology.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" {...stroke}><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>,
  },
  {
    title: "Tour Operators",
    desc: "Manage packages, groups and cruise inventory effortlessly.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8" r="3" /><path d="M6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M5.5 11.5a2.2 2.2 0 1 1 0-4.4M3 17c0-2 1-3.3 2.5-3.8M18.5 11.5a2.2 2.2 0 1 0 0-4.4M21 17c0-2-1-3.3-2.5-3.8" /></svg>,
  },
  {
    title: "Enterprise",
    desc: "Scalable technology for large organizations and travel networks.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" {...stroke}><path d="M4 21V5.5L12 3v18M12 8h8v13M2.5 21h19M7 8v.01M7 11.5v.01M7 15v.01M15.5 12v.01M15.5 15.5v.01" /></svg>,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={styles.hero}>
        <Image
          src={heroImg}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImg}
        />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>About CruiseStack</span>
          <h1>
            A Better Way
            <br />
            to Sell Cruises
          </h1>
          <p>
            CruiseStack is a technology company on a mission to make cruise commerce simpler, smarter and more accessible for travel businesses around the world.
          </p>
          <div className={styles.actions}>
            <Link href="/bookdemo" className={styles.btnPrimary}>
              Book a Demo <Arrow />
            </Link>
            <a href="#our-story" className={styles.btnOutline}>
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <div className={styles.container}>
        <ul className={styles.stats}>
          {stats.map((s) => (
            <li key={s.label}>
              <strong>{s.num}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ───── OUR STORY ───── */}
      <section id="our-story" className={`${styles.section} ${styles.story}`}>
        <div className={`${styles.container} ${styles.storyGrid}`}>
          <div className={styles.storyCopy}>
            <span className={styles.eyebrow}>Our Story</span>
            <h2>From a passion for travel to a global cruise technology platform</h2>
            <p>
              Our journey began with GetMyCruise, a consumer-facing platform created to make it easier for travelers to explore and book amazing cruise holidays. Through this experience, we gained deep industry knowledge, built strong relationships with cruise lines and understood the real challenges of cruise selling.
            </p>
            <p>
              We saw an opportunity to do more — to empower travel agencies, OTAs, tour operators and enterprise businesses with the right technology to sell cruises more efficiently and profitably. That&apos;s how CruiseStack was born.
            </p>
            <p>
              Today, we&apos;re proud to be a trusted technology partner for hundreds of travel businesses worldwide, helping them grow with confidence in the exciting world of cruise travel.
            </p>
          </div>

          <ol className={styles.timeline}>
            {timeline.map((t) => (
              <li key={t.title}>
                <span className={t.marker ? styles.yearMarker : styles.iconMarker}>
                  {t.marker ?? <Waves />}
                </span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── MISSION ───── */}
      <section className={styles.mission}>
        <div className={`${styles.container} ${styles.missionGrid}`}>
          <div>
            <span className={styles.eyebrow}>Our Mission</span>
            <h2>
              Make cruise commerce
              <br />
              easier for every business.
            </h2>
          </div>
          <p>
            We connect live inventory, real-time pricing, booking, payments, operations and integrations in one platform — so travel businesses can focus on what they do best: creating unforgettable cruise experiences for their customers.
          </p>
        </div>
      </section>

      {/* ───── VALUES ───── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>Our Values</span>
          <h2 className={styles.title}>What Drives Us</h2>
          <ul className={styles.values}>
            {values.map((v) => (
              <li key={v.title}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── TEAM ───── */}
      <section className={`${styles.section} ${styles.sectionTight}`}>
        <div className={styles.container}>
          <div className={styles.teamHead}>
            <div>
              <span className={styles.eyebrow}>Meet Our Team</span>
              <h2 className={styles.title}>The People Behind CruiseStack</h2>
              <p className={styles.intro}>
                A passionate team of travel, technology and cruise industry experts, working together to build the future of cruise commerce.
              </p>
            </div>
            <Link href="/contact-us" className={styles.textLink}>
              Join Our Team <Arrow />
            </Link>
          </div>
          <ul className={styles.team}>
            {team.map((m) => (
              <li key={m.name}>
                <div className={styles.photo}>
                  <Image src={m.photo} alt={m.name} fill sizes="(max-width: 780px) 45vw, 230px" className={styles.photoImg} />
                </div>
                <div className={styles.member}>
                  <div>
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                  </div>
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noreferrer" className={styles.linkedin} aria-label={`${m.name} on LinkedIn`}>
                      <Image src={linkedinIcon} alt="" width={20} height={20} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── CUSTOMERS ───── */}
      <section className={`${styles.section} ${styles.sectionTight}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>Our Customers</span>
          <h2 className={styles.title}>Built for the Businesses Behind Every Journey</h2>
          <p className={styles.intro}>
            Whether you&apos;re a travel agency, OTA, tour operator or enterprise, CruiseStack gives you the tools to sell cruises more efficiently and profitably.
          </p>
          <ul className={styles.customers}>
            {customers.map((c) => (
              <li key={c.title}>
                <span className={styles.customerIcon}>{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className={styles.cta}>
        <Image src={ctaImg} alt="" fill sizes="100vw" className={styles.ctaImg} />
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <span className={styles.eyebrow}>Let&apos;s Build Together</span>
          <h2>
            Ready to grow your
            <br />
            cruise business?
          </h2>
          <p>
            Join hundreds of travel businesses already using CruiseStack to sell more cruises, work smarter and deliver better experiences.
          </p>
          <div className={styles.actions}>
            <Link href="/bookdemo" className={styles.btnPrimary}>
              Book a Demo <Arrow />
            </Link>
            <Link href="/bookdemo" className={styles.btnOutline}>
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
