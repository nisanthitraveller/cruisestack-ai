"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./academy.module.css";

// "Get started with cruisestack Academy" pop-up. Clicking a chapter video link marked
// with `data-watch-gate` opens this form first; submitting it continues to the video.
// Static for now: the form doesn't save anything yet.
export default function WatchGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [href, setHref] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  // Catch clicks on any gated link inside, and open the pop-up instead of navigating
  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-watch-gate]");
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setHref(link.getAttribute("href"));
  };

  useEffect(() => {
    if (!href) return;
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setHref(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [href]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO (dev): save the viewer's name, email and mobile number here, and skip the
    // pop-up for viewers who have already filled it in.
    if (href) router.push(href);
  };

  return (
    <div onClickCapture={onClickCapture}>
      {children}

      {href && (
        <div className={styles.gateOverlay} onClick={() => setHref(null)}>
          <div className={styles.gateModal} role="dialog" aria-modal="true" aria-labelledby="gate-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.gateClose} onClick={() => setHref(null)} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            <h2 id="gate-title">Get started with cruisestack Academy</h2>
            <p className={styles.gateSub}>Enter your details to access the training videos.</p>

            <form className={styles.gateForm} onSubmit={onSubmit}>
              <div className={styles.enrolField}>
                <label htmlFor="gate-name">Name</label>
                <input ref={firstField} id="gate-name" name="name" type="text" placeholder="Your name" autoComplete="name" required />
              </div>
              <div className={styles.enrolField}>
                <label htmlFor="gate-email">Email address</label>
                <input id="gate-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              </div>
              <div className={styles.enrolField}>
                <label htmlFor="gate-mobile">Mobile number</label>
                <input id="gate-mobile" name="mobile" type="tel" placeholder="+91 98765 43210" autoComplete="tel" required />
              </div>
              <button type="submit" className={`${styles.btnPrimary} ${styles.gateSubmit}`}>
                Start learning
              </button>
            </form>

            <p className={styles.gateNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Your details will only be used to provide access to Academy training.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
