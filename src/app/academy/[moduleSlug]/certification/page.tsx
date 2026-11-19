import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer/footer";
import Header from "@/components/Header/header";
import styles from "../../academy.module.css";
import { academyModules, getModule } from "../../data";
import EnrolForm from "./EnrolForm";
import CertificateArt from "./CertificateArt";

type Props = { params: Promise<{ moduleSlug: string }> };

export function generateStaticParams() {
  return academyModules.map((m) => ({ moduleSlug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getModule((await params).moduleSlug);
  if (!found) return {};
  return {
    title: "CruiseCred - Cruise Travel Specialist Certification | cruisestack.ai Academy",
    description:
      "A professional credential in cruise selling. Watch the five free cruisestack.ai Academy modules, take the assessment and earn a certificate with your score.",
    robots: { index: false }, // a registration form, not a page to rank
  };
}

const audience = [
  { who: "Travel agents", why: "Selling cruise, or adding it to what you already sell." },
  { who: "Cruise specialists", why: "Agents who focus specifically on cruise sales." },
  { who: "Agency owners and managers", why: "Certifying your team against one standard." },
  { who: "Tour operators", why: "Bringing cruise into an existing portfolio." },
  { who: "GSAs & PSAs", why: "Representing cruise lines and suppliers in your market." },
  { who: "OTA and online travel teams", why: "Where accurate cruise information shapes what customers see." },
];

const gains = [
  { title: "A certificate with your score", body: "A result, not attendance - which is what makes it worth showing." },
  { title: "Something for your CV", body: "A named certification you can list on LinkedIn with your score." },
  { title: "Sell with confidence", body: "Recommend destinations, cabins and pricing without second-guessing." },
  { title: "Answers ready in live calls", body: "Destinations, cabins, pricing and cancellation terms, without looking them up." },
  { title: "Recommend, not just quote", body: "Put up options and explain the difference between them." },
];

const steps = [
  { title: "Watch the five modules", body: "In order or jump to what you need. Free." },
  { title: "Enrol and pay $99", body: "Register your details and pay the certification fee." },
  { title: "Take the online assessment", body: "Questions drawn from all five modules." },
  { title: "Live video assessment", body: "A one-to-one video call to test your knowledge in conversation." },
  { title: "Get certified", body: "Your certificate is issued with your score." },
];

const included = [
  "Access to the certification exam covering all five modules",
  "A structured evaluation of your cruise selling knowledge",
  "Your cruisestack.ai Academy certificate on successful completion",
  "Your score recorded on the certificate itself",
  "A credential you can list on your CV and LinkedIn profile",
];

// TODO (content): two answers below are placeholders from the design and need real details.
const faqs = [
  {
    q: "Do I need prior cruise experience to take this?",
    a: "No. The modules start from the fundamentals, so it works whether you have been selling cruise for years or are adding it to what you already sell.",
  },
  {
    q: "Do I have to pay to watch the course?",
    a: "No. All five modules of cruisestack.ai Academy are free to watch. The $99 is the certification fee — it covers the assessment, the evaluation of your answers and the certificate.",
  },
  {
    q: "What does the assessment cover?",
    a: "The material across all five modules: destinations, ports and cruise lines; room categories, decks and cabins; trip summaries; pricing, taxation and payments; and payment and cancellation terms.",
  },
  {
    q: "How long is the exam and how many questions are there?",
    a: "[The assessment is X questions and takes about X minutes to complete.]",
  },
  {
    q: "What happens if I do not pass?",
    a: "[Set out your retake policy here — whether a re-sit is included in the $99, how long you wait, and whether a further fee applies.]",
  },
  {
    q: "What does the certificate show?",
    a: "Your name, the CruiseCred Cruise Travel Specialist Certification, and the score you achieved — issued by cruisestack.ai Academy. The score is printed on the certificate itself, so it records a result rather than attendance.",
  },
  {
    q: "Can I add this to my CV and LinkedIn profile?",
    a: "Yes. It is a named certification from cruisestack.ai Academy, delivered in partnership with AERTiCKET, and you can list it together with the score you achieved.",
  },
  {
    q: "Is this an industry licence or accreditation?",
    a: "No, and it does not claim to be. cruisestack.ai Academy is delivered in partnership with AERTiCKET, a global travel technology company. The certification evidences your knowledge of the course material; it is not a government or trade-body licence.",
  },
  {
    q: "Do I have to watch every module before the exam?",
    a: "The assessment draws on all five modules, so working through each one is how you prepare for it. You can watch them in order or jump to the ones you need.",
  },
];

const Tick = () => (
  <svg className={styles.cpTick} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default async function CertificationEnrolPage({ params }: Props) {
  const found = getModule((await params).moduleSlug);
  if (!found) notFound();
  const m = found.module;

  return (
    <div className={styles.page}>
      <Header />

      {/* ───── HERO ───── */}
      <section className={styles.cpHero}>
        <div className={`${styles.container} ${styles.cpHeroGrid}`}>
          <div>
            <span className={styles.cpEyebrow}>cruisestack.ai Academy · Certification</span>
            <h1>CruiseCred - Cruise Travel Specialist Certification</h1>
            <p className={styles.cpLead}>A professional credential in cruise selling</p>
            <ul className={styles.cpChecks}>
              <li><Tick /><span><strong>The course is free.</strong> All five modules, before and after you enrol.</span></li>
              <li><Tick /><span><strong>Built for real selling.</strong> Destinations, cabins, pricing and terms you use with clients.</span></li>
              <li><Tick /><span><strong>Proof, not attendance.</strong> Your score is printed on it.</span></li>
            </ul>
            <a href="#enrol" className={`${styles.btnPrimary} ${styles.cpHeroBtn}`}>
              Get certified <Arrow />
            </a>
          </div>
          <CertificateArt />
        </div>
      </section>

      {/* ───── WHO IT'S FOR ───── */}
      <section className={`${styles.cpSection} ${styles.cpTint}`}>
        <div className={styles.container}>
          <h2 className={styles.cpTitle}>Who it&apos;s for</h2>
          <p className={styles.cpSub}>Stand out to clients and employers with a credential that shows what you actually know.</p>
          <ul className={styles.cpList}>
            {audience.map((a) => (
              <li key={a.who}><Tick /><span><strong>{a.who}</strong> - {a.why}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── WHAT THE EXAM COVERS ───── */}
      <section className={styles.cpSection}>
        <div className={styles.container}>
          <h2 className={styles.cpTitle}>What the exam covers</h2>
          <ol className={`${styles.cpList} ${styles.cpModules}`}>
            {academyModules.map((mod) => (
              <li key={mod.slug}><span className={styles.cpNum}>{mod.number}</span><span>{mod.title}</span></li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── WHAT YOU WALK AWAY WITH ───── */}
      <section className={`${styles.cpSection} ${styles.cpDark}`}>
        <div className={styles.container}>
          <h2 className={styles.cpTitle}>What you walk away with</h2>
          <ul className={styles.cpList}>
            {gains.map((g) => (
              <li key={g.title}><Tick /><span><strong>{g.title}</strong> — {g.body}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className={styles.cpSection}>
        <div className={styles.container}>
          <h2 className={styles.cpTitle}>How it works</h2>
          <ol className={styles.cpSteps}>
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className={styles.cpStepNum}>{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── PRICE + REGISTRATION ───── */}
      <section id="enrol" className={`${styles.cpSection} ${styles.cpTint} ${styles.cpPriceSection}`}>
        <div className={styles.container}>
          <h2 className={`${styles.cpTitle} ${styles.cpCenter}`}>What the $99 covers</h2>
          <div className={styles.cpPriceCard}>
            <div className={styles.cpPriceHead}>
              <div className={styles.cpPrice}><span>$</span>99</div>
              <p>One-time fee · Cruise Travel Specialist Certification, all five modules</p>
            </div>
            <div className={styles.cpIncluded}>
              <ul>
                {included.map((item) => (
                  <li key={item}><Tick /><span>{item}</span></li>
                ))}
              </ul>
              <p className={styles.cpNote}>All five modules stay free to watch.</p>
            </div>
            <div className={styles.cpFormWrap}>
              <EnrolForm moduleSlug={m.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className={styles.cpSection}>
        <div className={`${styles.container} ${styles.cpNarrow}`}>
          <h2 className={styles.cpTitle}>Before you enrol</h2>
          <div className={styles.cpFaq}>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className={styles.cpCta}>
        <div className={styles.container}>
          <h2>Take your cruise selling career to the next level</h2>
          <p>Takes a few minutes to enrol. The certificate is yours once you pass.</p>
          <a href="#enrol" className={styles.cpCtaBtn}>
            Get certified <Arrow />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
