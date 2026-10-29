import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "./academy.module.css";
import { academyModules, moduleHref } from "./data";
import { ArrowRight, ModuleIconSvg } from "./icons";
import heroImg from "../../assets/academy-banner.webp";
import academyIllustration from "../../assets/academy-illustration.svg";
import academyLogo from "../../assets/cruise-academy.svg";
import aerticketLogo from "../../assets/aerticket.png";
import partnerBg from "../../assets/card-bg.png";

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const partnerHighlights = [
  {
    label: ["Industry", "expert insights"],
    icon: <svg width="22" height="22" viewBox="0 0 24 24" {...iconStroke}><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></svg>,
  },
  {
    label: ["Practical", "training content"],
    icon: <svg width="22" height="22" viewBox="0 0 24 24" {...iconStroke}><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Zm0 0v13" /></svg>,
  },
  {
    label: ["Global travel", "expertise"],
    icon: <svg width="22" height="22" viewBox="0 0 24 24" {...iconStroke}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></svg>,
  },
];

export const metadata: Metadata = {
  title: "Academy - cruisestack",
  description:
    "Step-by-step training, practical guides and video tutorials to help you get the most out of cruisestack.",
};

export default function AcademyPage() {
  const firstModule = academyModules[0];

  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={`${styles.hero} ${styles.heroLanding}`}>
        <Image src={heroImg} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroInner}>
          <div className={styles.poweredBy}>
            <span>Powered by</span>
            <Image src={aerticketLogo} alt="AERTiCKET" />
          </div>
          <Image src={academyLogo} alt="cruisestack.ai Academy" priority className={styles.academyLogo} />
          <h1>
            Learn, master & grow<br />
your cruise business
            
           
          </h1>
          <p>
           Step-by-step training, practical guides and video tutorials to help you get the most out of cruisestack.
          </p>
          <Link href={moduleHref(firstModule)} className={styles.btnPrimary}>
            Start learning <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ───── PARTNER ───── */}
      <section className={styles.partner}>
        <div className={styles.container}>
          <div className={styles.partnerCard}>
            <div className={styles.partnerMedia} aria-hidden="true">
              <Image src={partnerBg} alt="" fill sizes="(max-width: 1100px) 100vw, 640px" className={styles.partnerBg} />
            </div>
            <div className={styles.partnerBrand}>
              <span className={styles.partnerEyebrow}>In partnership with</span>
              <Image src={aerticketLogo} alt="AERTiCKET" className={styles.partnerLogo} />
            </div>
            <div className={styles.partnerBody}>
              <h2>Bringing global travel expertise to cruisestack Academy</h2>
              <p>
                In partnership with AERTiCKET, a leading global travel technology company, we bring industry expertise, real-world insights and best practices to help you grow your cruise business.
              </p>
              <ul className={styles.partnerHighlights}>
                {partnerHighlights.map((h) => (
                  <li key={h.label.join(" ")}>
                    <span className={styles.partnerIcon}>{h.icon}</span>
                    <span>
                      {h.label[0]}
                      <br />
                      {h.label[1]}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="https://www.aerticket.in" target="_blank" rel="noreferrer" className={styles.partnerLink}>
                About our partner <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───── MODULES ───── */}
      <section id="modules" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Training modules</span>
            <h2>Explore our training modules</h2>
            <p>Choose a module below to watch step-by-step videos and learn how to use cruisestack effectively.</p>
          </div>

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
                    <span className={styles.moduleText}>
                      <span className={styles.moduleNumber}>Module {m.number}</span>
                      <strong>{m.title}</strong>
                      <span className={styles.moduleDesc}>{m.description}</span>
                    </span>
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

      <Footer />
    </div>
  );
}
