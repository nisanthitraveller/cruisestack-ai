import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "../../academy.module.css";
import { academyModules, getModule } from "../../data";
import EnrolForm from "./EnrolForm";
import academyLogo from "../../../../assets/cruise-academy.svg";
import shipImg from "../../../../assets/hero-r.png";

type Props = { params: Promise<{ moduleSlug: string }> };

export function generateStaticParams() {
  return academyModules.map((m) => ({ moduleSlug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getModule((await params).moduleSlug);
  if (!found) return {};
  return {
    title: `Enrol for certification: ${found.module.title} - cruisestack Academy`,
    description: `Register to take the certification exam for the ${found.module.title} module and earn a cruisestack Academy certificate.`,
    robots: { index: false }, // a registration form, not a page to rank
  };
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default async function CertificationEnrolPage({ params }: Props) {
  const found = getModule((await params).moduleSlug);
  if (!found) notFound();
  const m = found.module;
  const count = m.chapters.length;

  const facts = [
    {
      label: count ? `${count} ${count === 1 ? "chapter" : "chapters"}` : "Chapters coming soon",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="m12 4 10 5-10 5L2 9z" /><path d="M6 11v5c3 2.5 9 2.5 12 0v-5" /></svg>,
    },
    { label: "Video lessons", icon: <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5.5 3.5-5.5 3.5z" /></svg> },
    { label: "Certification exam", icon: <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 13l2 2 4-4" /></svg> },
    {
      label: "Earn a certificate with your score",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="9" r="6" /><path d="m12 6 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5L11 8zM8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5" /></svg>,
    },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.enrol}>
        <div className={styles.container}>
          <div className={styles.enrolHead}>
            <Image src={academyLogo} alt="cruisestack.ai Academy" className={styles.enrolLogo} priority />
            <span className={styles.eyebrow}>Certification program</span>
            <h1>Enrol for module certification</h1>
            <p>Register to take the certification exam for this module and earn a cruisestack Academy certificate.</p>
          </div>

          <div className={styles.enrolCard}>
            <aside className={styles.enrolModule}>
              <div className={styles.enrolModuleText}>
                <span className={styles.eyebrow}>Enrolment for</span>
                <h2>{m.title}</h2>
                <ul>
                  {facts.map((f) => (
                    <li key={f.label}>
                      <span className={styles.enrolFactIcon}>{f.icon}</span>
                      {f.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.enrolModuleImg} aria-hidden="true">
                <Image src={shipImg} alt="" fill sizes="(max-width: 900px) 100vw, 600px" />
              </div>
            </aside>

            <EnrolForm moduleSlug={m.slug} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
