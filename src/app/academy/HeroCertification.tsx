import Link from "next/link";
import styles from "./academy.module.css";

// Certification title and buttons shown under the hero subtitle on the Academy
// landing page ("View program") and on every module page ("View chapters").
type Props = {
  href: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export default function HeroCertification({ href, secondaryHref, secondaryLabel }: Props) {
  return (
    <>
      <span className={styles.academyCertEyebrow}>Certification program</span>
      <h2 className={styles.academyCertTitle}>Certified Cruise Expert Level 1 (CCE 1)</h2>
      <div className={styles.academyHeroActions}>
        <Link href={href} className={styles.btnPrimary}>
          Get certified
        </Link>
        <Link href={secondaryHref} className={styles.academyHeroSecondary}>
          {secondaryLabel}
        </Link>
      </div>
    </>
  );
}
