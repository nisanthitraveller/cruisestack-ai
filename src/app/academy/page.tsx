import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "./academy.module.css";
import { academyModules, certificationHref, moduleHref } from "./data";
import { ArrowRight, ModuleIconSvg } from "./icons";
import PartnerCard from "./PartnerCard";
import StickyEnrol from "./StickyEnrol";
import coastlineImg from "../../assets/academy-coastline.png";
import certificateImg from "../../assets/academy-certificate.png";
import academyIllustration from "../../assets/academy-illustration.svg";
import academyLogo from "../../assets/cruise-academy.svg";
import aerticketLogo from "../../assets/aerticket.png";

export const metadata: Metadata = {
  title: "Cruise Selling Training for Travel Agents | cruisestack.ai Academy | Powered by AERTiCKET",
  description:
    "Step-by-step cruise training for travel agents: destinations, cabins, pricing, TCS & GST, and cancellation terms. Video tutorials inside cruisestack.ai.",
};

export default function AcademyPage() {
  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={styles.academyHero}>
        <Image src={coastlineImg} alt="" fill priority sizes="100vw" className={styles.academyHeroBg} />
        <div className={styles.academyHeroInner}>
          <div className={styles.academyHeroCopy}>
            <div className={styles.heroLogos}>
              <Image src={academyLogo} alt="cruisestack.ai Academy" priority className={styles.academyLogo} />
              <div className={styles.poweredBy}>
                <span>Powered by</span>
                <Image src={aerticketLogo} alt="AERTiCKET" />
              </div>
            </div>
            <h1>Cruise training for growing your cruise business</h1>
            <p>
              A practical, module-based training program for travel agents and agencies. Learn how to sell cruises with confidence, grow your bookings, and get certified.
            </p>
            <span className={styles.academyCertEyebrow}>Certification program</span>
            <h2>Cruise Travel Certification Level 1(CTEC 1)</h2>
            <div className={styles.academyHeroActions}>
              <Link href={certificationHref(academyModules[0])} className={styles.btnPrimary}>
                Enrol for certification
              </Link>
              <Link href="#modules" className={styles.academyHeroSecondary}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
                </svg>
                View program details
              </Link>
            </div>
          </div>
          <div className={styles.academyHeroCertificate}>
            <Image src={certificateImg} alt="Cruise Travel Certification Level 1(CTEC 1) sample certificate" priority sizes="(max-width: 780px) 92vw, 48vw" />
          </div>
        </div>
      </section>

      {/* ───── MODULES ───── */}
      <section id="modules" className={styles.section}>
        <div className={styles.container}>
          {/* Hidden for now
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Training modules</span>
            <h2>What you&apos;ll learn in the cruisestack.ai training modules</h2>
            <p>Choose a module below to watch step-by-step videos and learn how to use cruisestack.ai effectively.</p>
          </div>
          */}

          <div className={styles.split}>
            <div className={styles.illustration} aria-hidden="true">
              <Image src={academyIllustration} alt="" />
            </div>
            <ul className={styles.moduleList}>
              {academyModules.map((m) => (
                <li key={m.slug}>
                  <Link href={moduleHref(m)} className={styles.moduleCard}>
                    <span className={styles.moduleIcon}>
                      <ModuleIconSvg icon={m.icon} />
                    </span>
                    <div className={styles.moduleText}>
                      <span className={styles.moduleNumber}>Module {m.number}</span>
                      <h3>{m.cardTitle ?? m.title}</h3>
                      <span className={styles.moduleDesc}>{m.description}</span>
                    </div>
                    <span className={styles.roundArrow}>
                      <ArrowRight />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── PARTNER ───── */}
      <section className={styles.partner}>
        <div className={styles.container}>
          <PartnerCard />
        </div>
      </section>

      <StickyEnrol href={certificationHref(academyModules[0])} />
      <Footer />
    </div>
  );
}
