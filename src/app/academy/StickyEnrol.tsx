import Link from "next/link";
import styles from "./academy.module.css";
import { ArrowRight } from "./icons";

// Full-width bar pinned to the bottom of the screen with the "Get certified"
// button. It's sticky (not fixed) and sits just above the footer, so when the footer
// comes into view the bar scrolls up with the page instead of covering it.
export default function StickyEnrol({ href }: { href: string }) {
  return (
    <div className={styles.stickyEnrol}>
      <div className={`${styles.container} ${styles.stickyEnrolInner}`}>
        <Link href={href} className={styles.btnPrimary}>
          Get certified <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
