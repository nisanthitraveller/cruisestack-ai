import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./ContactUs.module.css";
import ContactForm from "./ContactForm";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import heroImg from "../../assets/hero-r.png";
import ctaImg from "../../assets/faq-cta.png";
import worldDots from "../../assets/world-dots.svg";

export const metadata: Metadata = {
  title: "Contact Us - cruisestack",
  description:
    "Have questions about CruiseStack, need a demo, or want to discuss how we can help your business? Get in touch with our team.",
};

// Contact details shown on the page. Confirm before publishing.
const CONTACT_EMAIL = "hello@cruisestack.ai";
const SALES_PHONE = "+91 6235 123 456";
const SALES_HOURS = "Mon – Fri, 9:30 AM – 6:30 PM (IST)";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Bangalore%2C+Karnataka%2C+India";

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

export default function ContactUsPage() {
  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={styles.hero}>
        <Image src={heroImg} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Contact Us</span>
          <h1>We&apos;re Here to Help</h1>
          <p>
            Have questions about CruiseStack, need a demo, or want to discuss how we can help your business? Our team is ready to connect.
          </p>
        </div>
      </section>

      {/* ───── FORM + DETAILS ───── */}
      <div className={`${styles.container} ${styles.contactGrid}`}>
        <section className={`${styles.card} ${styles.formCard}`}>
          <h2>Send Us a Message</h2>
          <p className={styles.cardIntro}>Fill out the form and our team will get back to you shortly.</p>
          <ContactForm />
        </section>

        <aside className={`${styles.card} ${styles.touchCard}`}>
          <h2>Get in Touch</h2>
          <p className={styles.cardIntro}>Prefer to reach out directly? Here are other ways to connect with us.</p>

          <ul className={styles.channels}>
            <li>
              <span className={styles.channelIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
              </span>
              <div>
                <h3>Email</h3>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.channelLink}>{CONTACT_EMAIL}</a>
                <p>We typically respond within 1 business day.</p>
              </div>
            </li>
            <li>
              <span className={styles.channelIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" {...stroke}><path d="M5 4h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" /></svg>
              </span>
              <div>
                <h3>Sales Inquiries</h3>
                <a href={`tel:${SALES_PHONE.replace(/\s/g, "")}`} className={styles.channelPhone}>{SALES_PHONE}</a>
                <p>{SALES_HOURS}</p>
              </div>
            </li>
            <li className={styles.channelDemo}>
              <span className={styles.channelIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" {...stroke}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" /></svg>
              </span>
              <div>
                <h3>Book a Personalized Demo</h3>
                <p>See how CruiseStack can work for your business with a personalized demo from our team.</p>
                <Link href="/bookdemo" className={styles.btnOutline}>
                  Book a Demo <Arrow />
                </Link>
              </div>
            </li>
          </ul>
        </aside>
      </div>

      {/* ───── OFFICE ───── */}
      <div className={styles.container}>
        <section className={`${styles.card} ${styles.office}`}>
          <div className={styles.officeCopy}>
            <span className={styles.eyebrow}>Our Office</span>
            <h2>
              Based in Bangalore,
              <br />
              Connecting Worldwide
            </h2>
            <p>We&apos;re a global team with roots in Bangalore, India, working with travel businesses around the world.</p>
          </div>
          <div className={styles.location}>
            <span className={styles.pin}>
              <svg width="26" height="26" viewBox="0 0 24 24" {...stroke}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>
            </span>
            <div>
              <h3>Our Location</h3>
              <p>Bangalore, Karnataka<br />India</p>
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className={styles.textLink}>
                View on Maps <Arrow />
              </a>
            </div>
          </div>
          <div className={styles.mapWrap} aria-hidden="true">
            <Image src={worldDots} alt="" className={styles.mapImg} />
            <span className={styles.mapDot} />
          </div>
        </section>
      </div>

      {/* ───── CTA ───── */}
      <section className={styles.cta}>
        <Image src={ctaImg} alt="" fill sizes="100vw" className={styles.ctaImg} />
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <span className={styles.eyebrow}>Let&apos;s Talk</span>
          <h2>
            Ready to Grow Your
            <br />
            Cruise Business?
          </h2>
          <p>
            Get in touch with our team to learn how CruiseStack can help you sell more cruises, work smarter and deliver better experiences.
          </p>
          <Link href="/bookdemo" className={styles.btnPrimary}>
            Book a Demo <Arrow />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
