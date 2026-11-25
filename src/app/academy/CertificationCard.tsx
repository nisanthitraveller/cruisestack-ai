"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import styles from "./academy.module.css";
import { ArrowRight } from "./icons";
import certificateImg from "../../assets/certificate.svg";

// Enrolment confirmation on module pages. Hidden on normal visits: it only shows after
// enrolling, when the enrolment page (or the confirmation email) sends the visitor to
// `/academy/<module>?certification=success#certification`, with a button to the exam's
// Google Form.

type Props = {
  moduleTitle: string;
  examUrl: string;
};

export default function CertificationCard({ moduleTitle, examUrl }: Props) {
  const success = useSearchParams()?.get("certification") === "success";
  if (!success) return null;

  return (
    <section id="certification" className={styles.cert} aria-live="polite">
      <div className={styles.certArt} aria-hidden="true">
        <Image src={certificateImg} alt="" />
      </div>
      <div className={styles.certBody}>
        <span className={styles.certEyebrow}>Certification program</span>
        <h2 className={styles.certTitle}>
          <span className={styles.certTick} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Your payment was successful!
        </h2>
        <p>
          Your enrolment for the certification program is confirmed. You can now take the certification exam for the {moduleTitle} module.
        </p>
        <a href={examUrl || "#"} target="_blank" rel="noreferrer" className={styles.btnPrimary}>
          Enrol now <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
