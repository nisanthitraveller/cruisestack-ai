"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoMain from "../../assets/logo.png";
import styles from "./Header.module.css";

type AgentSummary = {
  email?: string | null;
  name: string;
};

export default function Header() {
  const [agent, setAgent] = useState<AgentSummary | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/product", label: "Product" },
    { href: "/solutions", label: "Solutions" },
    { href: "/resources", label: "Resources" },
    { href: "/company", label: "Company" },
  ];

  const isActive = (href: string) => pathname ? (pathname === href || pathname.startsWith(`${href}/`)) : false;
  const getLinkClass = (href: string) => (isActive(href) ? styles.active : "theme");

  useEffect(() => {
    let active = true;

    async function loadAgent() {
      try {
        const response = await fetch("/api/agent/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (!active) return;

        if (!response.ok) {
          setAgent(null);
          return;
        }

        const data = await response.json();
        setAgent(data.authenticated ? data.agent : null);
      } catch {
        if (active) setAgent(null);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    loadAgent();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoggingOut(true);

    await fetch("/api/agent/logout", {
      credentials: "include",
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>

        {/* Logo */}
        <Link href="/" className={styles.navLogo}>
          <Image src={logoMain} alt="cruisestack" width={190} height={25} />
        </Link>

        {/* Desktop nav links */}

        <ul className={styles.navLinks}>
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={getLinkClass(href)} style={{ color: isActive(href) ? "#006cea" : "#475569" }}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className={styles.navActions}>
          {checkingSession ? (
            <span className={styles.userName}>Checking session...</span>
          ) : agent ? (
            <>
              <span className={styles.userName}>{agent.name}</span>
              <form className={styles.logoutForm} onSubmit={handleLogout}>
                <button className={styles.btnGhost} disabled={loggingOut} type="submit">
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.btnGhost}>Login</Link>
              <Link href="/signup" className={styles.btnGhost}>Sign Up</Link>
              <Link href="/bookdemo" className={styles.btnPrimary}>Book a Demo</Link>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className={styles.mobileRight}>
          {agent ? (
            <span className={styles.mobileUserName}>{agent.name}</span>
          ) : (
            <Link href="/login" className={styles.mobileIconBtn} aria-label="Login">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M3 17 Q4.5 12 10 12 Q15.5 12 17 17" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              </svg>
            </Link>
          )}

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
          {navLinks.map(({ href, label }) => (
            <li key={href} className={isActive(href) ? styles.active : ""}>
              <Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
            </li>
          ))}
        </ul>
        <div className={styles.mobileMenuActions}>
          {checkingSession ? (
            <span className={styles.mobileMenuUser}>Checking session...</span>
          ) : agent ? (
            <>
              <span className={styles.mobileMenuUser}>{agent.name}</span>
              <form className={styles.mobileLogoutForm} onSubmit={handleLogout}>
                <button className={styles.mobileMenuGhost} disabled={loggingOut} type="submit">
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login"   className={styles.mobileMenuGhost} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/signup"  className={styles.mobileMenuGhost} onClick={() => setMenuOpen(false)}>Sign Up</Link>
              <Link href="/bookdemo" className={styles.mobileMenuPrimary} onClick={() => setMenuOpen(false)}>Book a Demo</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
