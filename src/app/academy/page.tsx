import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "./academy.module.css";
import { academyModules, moduleHref } from "./data";
import { ArrowRight, ModuleIconSvg } from "./icons";
import heroImg from "../../assets/hero-r.png";
import academyIllustration from "../../assets/academy-illustration.svg";

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
      <section className={styles.hero}>
        <Image src={heroImg} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>cruisestack Academy</span>
          <h1>
            Learn. Master. Grow
            <br />
            your cruise business.
          </h1>
          <p>
            Step-by-step training, practical guides and video tutorials to help you get the most out of cruisestack. Whether you&apos;re new to the platform or looking to explore advanced features, our academy has everything you need.
          </p>
          <Link href={moduleHref(firstModule)} className={styles.btnPrimary}>
            Start learning <ArrowRight size={18} />
          </Link>
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
