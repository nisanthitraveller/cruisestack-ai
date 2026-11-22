"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./academy.module.css";
import { ArrowRight } from "./icons";
import certificateImg from "../../assets/certificate.svg";

// Certification card on module pages. After enrolling, the enrolment page sends the
// visitor back to `/academy/<module>?certification=success#certification`, which shows
// the success state with a button to the exam's Google Form.

type Props = {
  moduleTitle: string;
  enrolHref: string;
  examUrl: string;
};

export function CertificationCardView({ moduleTitle, enrolHref, examUrl, success }: Props & { success: boolean }) {
  return (
    <section id="certification" className={styles.cert} aria-live="polite">
      <div className={styles.certArt} aria-hidden="true">
        <Image src={certificateImg} alt="" />
      </div>
      <div className={styles.certBody}>
        <span className={styles.certEyebrow}>Certification program</span>
        {success ? (
          <>
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
          </>
        ) : (
          <>
            <h2 className={styles.certTitle}>Cruise travel expert certification level 1</h2>
            <p>Watch all chapter videos, take a short exam and earn a cruisestack.ai Academy certificate with your score.</p>
            <Link href={enrolHref} className={styles.btnPrimary}>
              Enrol for certification <ArrowRight size={18} />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function CertificationCard(props: Props) {
  const success = useSearchParams()?.get("certification") === "success";
  return <CertificationCardView {...props} success={success} />;
}
