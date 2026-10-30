import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "./academy.module.css";
import { academyModules, moduleHref } from "./data";
import { ArrowRight, ModuleIconSvg } from "./icons";
import PartnerCard from "./PartnerCard";
import heroImg from "../../assets/academy-banner.webp";
import academyIllustration from "../../assets/academy-illustration.svg";
import academyLogo from "../../assets/cruise-academy.svg";
import aerticketLogo from "../../assets/aerticket.png";

export const metadata: Metadata = {
  title: "Cruise Selling Training for Travel Agents | cruisestack.ai Academy | Powered by AERTiCKET",
  description:
    "Step-by-step cruise training for travel agents: destinations, cabins, pricing, TCS & GST, and cancellation terms. Video tutorials inside CruiseStack.",
};

export default function AcademyPage() {
  const firstModule = academyModules[0];

  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={styles.hero}>
        <Image src={heroImg} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroInner}>
          <div className={styles.heroLogos}>
            <Image src={academyLogo} alt="cruisestack.ai Academy" priority className={styles.academyLogo} />
            <div className={styles.poweredBy}>
              <span>Powered by</span>
              <Image src={aerticketLogo} alt="AERTiCKET" />
            </div>
          </div>
          <h1>Cruise training for growing your cruise business</h1>
          <p>
            cruisestack Academy is a module-based cruise training program for travel agents and agencies. Each module teaches one part of selling a cruise: where people sail, which cabin to pick, how pricing and tax work, and what happens when a booking is cancelled. Watch in order or jump to the one you need.
          </p>
          <Link href={moduleHref(firstModule)} className={styles.btnPrimary}>
            Start learning <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ───── MODULES ───── */}
      <section id="modules" className={styles.section}>
        <div className={styles.container}>
          {/* Hidden for now
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Training modules</span>
            <h2>What you&apos;ll learn in the CruiseStack training modules</h2>
            <p>Choose a module below to watch step-by-step videos and learn how to use cruisestack effectively.</p>
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

      <Footer />
    </div>
  );
}
