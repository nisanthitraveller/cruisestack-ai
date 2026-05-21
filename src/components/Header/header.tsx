"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logoMain from "../../assets/logo.png";
import styles from "./Header.module.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>

        {/* Logo */}
        <Link href="/" className={styles.navLogo}>
          <Image src={logoMain} alt="CruiseStack" width={190} height={25} />
        </Link>

        {/* Desktop nav links */}
        <ul className={styles.navLinks}>
          <li><Link href="/product">Product</Link></li>
          <li><Link href="/solutions">Solutions</Link></li>
          <li><Link href="/resources">Resources</Link></li>
          <li><Link href="/company">Company</Link></li>
        </ul>

        {/* Desktop actions */}
        <div className={styles.navActions}>
          <Link href="/login" className={styles.btnGhost}>Login</Link>
          <Link href="/signup" className={styles.btnGhost}>Sign Up</Link>
          <Link href="/bookdemo" className={styles.btnPrimary}>Book a Demo</Link>
        </div>

        {/* Mobile right side */}
        <div className={styles.mobileRight}>
          {/* Login icon */}
          <Link href="/login" className={styles.mobileIconBtn} aria-label="Login">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M3 17 Q4.5 12 10 12 Q15.5 12 17 17" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </svg>
          </Link>

          {/* Book a Demo — compact */}
          <Link href="/bookdemo" className={styles.mobileDemoBtn}>
            Book a Demo
          </Link>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineTopOpen : ""}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineMidOpen : ""}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineBotOpen : ""}`} />
          </button>
        </div>

      </div>

      {/* Mobile dropdown menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
        <ul className={styles.mobileNavLinks}>
          <li><Link href="/product"   onClick={() => setMenuOpen(false)}>Product</Link></li>
          <li><Link href="/solutions" onClick={() => setMenuOpen(false)}>Solutions</Link></li>
          <li><Link href="/resources" onClick={() => setMenuOpen(false)}>Resources</Link></li>
          <li><Link href="/company"   onClick={() => setMenuOpen(false)}>Company</Link></li>
        </ul>
        <div className={styles.mobileMenuActions}>
          <Link href="/login"   className={styles.mobileMenuGhost} onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/signup"  className={styles.mobileMenuGhost} onClick={() => setMenuOpen(false)}>Sign Up</Link>
          <Link href="/bookdemo" className={styles.mobileMenuPrimary} onClick={() => setMenuOpen(false)}>Book a Demo</Link>
        </div>
      </div>
    </nav>
  );
}