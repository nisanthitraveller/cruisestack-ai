import React from "react";
import Image from "next/image";
import Link from "next/link";
import logoft from "../../assets/cs-logo-reverse.svg";
import styles from "./Footer.module.css";

// Menu items without a page yet are commented out; uncomment and set the href when the page exists.
const footerMenus = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/product" },
      // { label: "Integrations", href: "/integrations" },
      // { label: "API", href: "/api-docs" },
      // { label: "Security", href: "/security" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Travel Agencies", href: "/solutions" },
      // { label: "OTAs", href: "/solutions" },
      // { label: "Tour Operators", href: "/solutions" },
      // { label: "Enterprise", href: "/solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/resources" },
      // { label: "Case Studies", href: "/case-studies" },
      { label: "Help Center", href: "/faq" },
      // { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      // { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact-us" },
    ],
  },
];

const CONTACT_EMAIL = "hello@getmycruise.com";
const CONTACT_PHONE = "+91 96337 98887";
const CONTACT_HOURS = "Mon – Fri, 9:00 AM – 6:00 PM (IST)";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <svg className={styles.wave} viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 120C240 60 420 70 640 120s420 90 800 10V260H0Z" fill="#1d4ea8" fillOpacity=".10" />
        <path d="M0 190c260-70 520-80 780-30s460 50 660-40V260H0Z" fill="#2f6bd6" fillOpacity=".08" />
      </svg>

      <div className={styles.inner}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image src={logoft} alt="cruisestack" width={250} height={33} />
            </Link>
            <p>
              The complete cruise commerce platform for travel businesses. Real inventory. Real opportunities. A more connected cruise future.
            </p>
            <div className={styles.social}>
              <a href="https://www.linkedin.com/company/get-my-cruise/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z" /></svg>
              </a>
              {/* No YouTube channel yet
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.7 4.7 12 4.7 12 4.7s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.8ZM9.8 15.1V8.9l5.6 3.1-5.6 3.1Z" /></svg>
              </a>
              */}
              <a href="https://twitter.com/getmycruise" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.84-6.32L5.46 21H2.38l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" /></svg>
              </a>
            </div>
          </div>

          {/* Menus */}
          <nav className={styles.menus} aria-label="Footer">
            {footerMenus.map((menu) => (
              <div key={menu.title} className={styles.menu}>
                <h4>{menu.title}</h4>
                <ul>
                  {menu.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Contact */}
          <div className={styles.contact}>
            <h4>Get in Touch</h4>
            <ul>
              <li>
                <span className={styles.contactIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2.2V7l8 5 8-5v.2l-8 5.3-8-5.3Z" /></svg>
                </span>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactMain}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                <span className={styles.contactIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1l-2.2 2.2Z" /></svg>
                </span>
                <div>
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className={styles.contactMain}>{CONTACT_PHONE}</a>
                  <span className={styles.contactSub}>{CONTACT_HOURS}</span>
                </div>
              </li>
              <li>
                <span className={styles.contactIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" /></svg>
                </span>
                <address className={styles.contactMain}>
                  Ground Floor, 2gethr@ HSR,
                  <br />
                  Sector 1, Bangalore.
                  <span className={styles.contactSub}>India 560102</span>
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; {new Date().getFullYear()} CruiseStack. All rights reserved.</span>
          {/* No legal pages yet
          <div className={styles.legal}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
}
