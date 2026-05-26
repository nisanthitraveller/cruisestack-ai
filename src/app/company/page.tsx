import styles from "../company/Company.module.css";
import logoMain from "../../assets/logo.png";
import logoft from "../../assets/logo-white.png";
import loginImg from "../../assets/pana.svg";
import Image from 'next/image';
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import heroImg from '../../assets/Company.webp'
import mission from '../../assets/mission.png'
import logoone from "../../assets/aerticket.png";
import logtwo from "../../assets/Satguru.png";
import logthree from "../../assets/toptraveltrip.png";
import logofour from "../../assets/travelwings.png";
import logofive from "../../assets/travtips.png";
// ─── Icon Components ────────────────────────────────────────────────────────

const IconCruiseLines = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" stroke="#4A90E2" strokeWidth="1.5" />
    <path d="M10 22 Q20 14 30 22" stroke="#4A90E2" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M13 22 L13 18 L20 14 L27 18 L27 22" stroke="#4A90E2" strokeWidth="1.5" fill="none" />
    <line x1="8" y1="24" x2="32" y2="24" stroke="#4A90E2" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconPartners = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" stroke="#4A90E2" strokeWidth="1.5" />
    <circle cx="15" cy="17" r="4" stroke="#4A90E2" strokeWidth="1.5" />
    <circle cx="25" cy="17" r="4" stroke="#4A90E2" strokeWidth="1.5" />
    <path d="M8 28 Q11 22 15 22 Q20 22 25 22 Q29 22 32 28" stroke="#4A90E2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const IconBookings = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" stroke="#4A90E2" strokeWidth="1.5" />
    <rect x="12" y="12" width="16" height="18" rx="2" stroke="#4A90E2" strokeWidth="1.5" />
    <line x1="15" y1="18" x2="25" y2="18" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="15" y1="22" x2="25" y2="22" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="15" y1="26" x2="21" y2="26" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconUptime = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" stroke="#4A90E2" strokeWidth="1.5" />
    <path d="M14 20 L18 24 L26 16" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="20" r="8" stroke="#4A90E2" strokeWidth="1.5" />
  </svg>
);

const IconCustomerFirst = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="12" r="5" stroke="#1a3a6b" strokeWidth="1.5" />
    <path d="M6 26 Q8 20 16 20 Q24 20 26 26" stroke="#1a3a6b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const IconInnovation = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="13" r="6" stroke="#1a3a6b" strokeWidth="1.5" />
    <path d="M13 19 L13 24 L19 24 L19 19" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="7" x2="16" y2="5" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="21" y1="9" x2="22.5" y2="7.5" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="9" x2="9.5" y2="7.5" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconIntegrity = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M16 4 L26 8 L26 16 Q26 22 16 28 Q6 22 6 16 L6 8 Z" stroke="#1a3a6b" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M11 16 L14 19 L21 13" stroke="#1a3a6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconExcellence = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <polygon points="16,4 19,12 28,12 21,18 24,26 16,21 8,26 11,18 4,12 13,12" stroke="#1a3a6b" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect width="16" height="16" rx="3" fill="#0A66C2" />
    <path d="M4 6.5 L4 12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="4" cy="4.5" r="1" fill="white" />
    <path d="M7.5 6.5 L7.5 12 M7.5 9 Q7.5 6.5 10 6.5 Q12 6.5 12 9 L12 12" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFlag = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <line x1="7" y1="4" x2="7" y2="24" stroke="#1a3a6b" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 5 L20 8 L7 11 Z" fill="#1a3a6b" />
  </svg>
);

const IconRocket = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 6 Q20 6 20 14 L14 22 L8 14 Q8 6 14 6 Z" stroke="#1a3a6b" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="13" r="2.5" stroke="#1a3a6b" strokeWidth="1.5" />
    <path d="M10 18 L7 22" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 18 L21 22" stroke="#1a3a6b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconGlobe = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="9" stroke="#1a3a6b" strokeWidth="1.5" />
    <ellipse cx="14" cy="14" rx="4.5" ry="9" stroke="#1a3a6b" strokeWidth="1.5" />
    <line x1="5" y1="14" x2="23" y2="14" stroke="#1a3a6b" strokeWidth="1.5" />
    <line x1="7" y1="9" x2="21" y2="9" stroke="#1a3a6b" strokeWidth="1" />
    <line x1="7" y1="19" x2="21" y2="19" stroke="#1a3a6b" strokeWidth="1" />
  </svg>
);

const IconPeople = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="10" cy="10" r="3.5" stroke="#1a3a6b" strokeWidth="1.5" />
    <circle cx="18" cy="10" r="3.5" stroke="#1a3a6b" strokeWidth="1.5" />
    <path d="M3 22 Q5 17 10 17 Q14 17 16 20" stroke="#1a3a6b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M18 17 Q23 17 25 22" stroke="#1a3a6b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polygon points="14,4 16.5,11 24,11 18,16 20.5,23 14,19 7.5,23 10,16 4,11 11.5,11" stroke="#1a3a6b" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { icon: <IconCruiseLines />, value: "30+", label: "Global Cruise Lines" },
  { icon: <IconPartners />, value: "10K+", label: "Travel Partners" },
  { icon: <IconBookings />, value: "1M+", label: "Bookings Processed" },
  { icon: <IconUptime />, value: "99.9%", label: "Platform Uptime" },
];

const values = [
  { icon: <IconCustomerFirst />, title: "Customer First", desc: "We build everything with our customers in mind." },
  { icon: <IconInnovation />, title: "Innovation", desc: "We innovate to simplify complex travel operations." },
  { icon: <IconIntegrity />, title: "Integrity", desc: "We believe in transparency, trust and reliability." },
  { icon: <IconExcellence />, title: "Excellence", desc: "We strive for excellence in everything we do." },
];

const team = [
  { name: "Samir H.", role: "Chief Executive Officer" },
  { name: "Jessica L.", role: "Chief Operating Officer" },
  { name: "Michael T.", role: "Chief Technology Officer" },
  { name: "Amanda P.", role: "Head of Product" },
  { name: "David K.", role: "Head of Partnerships" },
];

const teamColors = ["#c7d8f5", "#d6e8f0", "#d1e7dd", "#fde8cc", "#e8d5f5"];

const journey = [
  { icon: <IconFlag />, year: "2024 Feb", title: "Founded", desc: "cruisestack was founded with a vision to modernize cruise distribution." },
  { icon: <IconRocket />, year: "2024 Oct", title: "First Platform Launch", desc: "Launched our first platform with real-time inventory and booking capabilities." },
  { icon: <IconGlobe />, year: "2025 Jun", title: "Global Expansion", desc: "Expanded globally and integrated with major cruise lines." },
  { icon: <IconPeople />, year: "2026 Jan", title: "1K+ Bookings", desc: "Reached 1 million+ bookings processed on our platform." },
  { icon: <IconStar />, year: "2026 Apr", title: "Future Forward", desc: "Continuing to innovate and deliver more value to our partners." },
];

const partners = ["Aerticket", "GetMyCruise", "seascanner", "CRUISE", "Travel Legends", "TripFactory"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Company() {

 const heroImagePlaceholder = {
    backgroundImage: `url(${heroImg.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
  };
const missionImagePlaceholder = {
    backgroundImage: `url(${mission.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
  };


  return (
    <div className={styles.page}>

      <Header /> {/* Assuming you have a Header component to include here */}

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>COMPANY</span>
              <h1 className={styles.heroTitle}>Building the future of cruise commerce</h1>
              <p className={styles.heroDesc}>
                cruisestack is on a mission to empower travel businesses with technology,
                innovation and unmatched inventory access.
              </p>
              <div className={styles.heroActions}>
                <Link href="/bookdemo" className={styles.btnPrimary}>Book a Demo</Link>
                
              </div>
            </div>
            <div className={styles.heroImageWrap}>
              <div className={styles.heroImagePlaceholder} style={heroImagePlaceholder}>
                <div className={styles.heroImageInner}>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    

      {/* ── Values ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.valuesLayout}>
            <div className={styles.valuesSidebar}>
              <h2 className={styles.sectionTitle}>Our values</h2>
              <p className={styles.sectionDesc}>
                Everything we do is guided by our core values and commitment to our customers.
              </p>
            </div>
            <div className={styles.valuesGrid}>
              {values.map((v) => (
                <div key={v.title} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{v.icon}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className={styles.teamSection} style={{display:'none'}}>
        <div className={styles.container}>
          <div className={styles.teamLayout}>
            <div className={styles.teamSidebar}>
              <h2 className={styles.teamTitle}>Meet the team</h2>
              <p className={styles.teamDesc}>
                A passionate group of travel and technology experts committed to transforming cruise commerce.
              </p>
              <a href="#" className={styles.teamLink}>View all careers →</a>
            </div>
            <div className={styles.teamGrid}>
              {team.map((member, i) => (
                <div key={member.name} className={styles.teamCard}>
                  <div
                    className={styles.teamAvatar}
                    style={{ backgroundColor: teamColors[i] }}
                  >
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <circle cx="26" cy="20" r="10" fill="rgba(26,58,107,0.25)" />
                      <ellipse cx="26" cy="40" rx="14" ry="9" fill="rgba(26,58,107,0.18)" />
                    </svg>
                  </div>
                  <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{member.name}</span>
                    <a href="#" className={styles.teamLinkedIn}><IconLinkedIn /></a>
                  </div>
                  <p className={styles.teamRole}>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Journey ── */}
      <section className={styles.journeySection}>
        <div className={styles.container}>
          <div className={styles.journeyLayout}>
            <div className={styles.journeySidebar}>
              <h2 className={styles.sectionTitle}>Our journey</h2>
              <p className={styles.sectionDesc}>
                From our founding to becoming a global leader in cruise commerce technology,
                we continue to grow and innovate.
              </p>
            </div>
            <div className={styles.journeyTimeline}>
              {journey.map((item, i) => (
                <div key={item.year} className={styles.journeyItem}>
                  <div className={styles.journeyIconWrap}>{item.icon}</div>
                  {i < journey.length - 1 && <div className={styles.journeyConnector} />}
                  <div className={styles.journeyYear}>{item.year}</div>
                  <h3 className={styles.journeyTitle}>{item.title}</h3>
                  <p className={styles.journeyDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionCard}>
            <div className={styles.missionImageWrap}>
              <div className={styles.missionImagePlaceholder} style={missionImagePlaceholder}>
               
              </div>
            </div>
            <div className={styles.missionContent}>
              <span className={styles.missionEyebrow}>OUR MISSION</span>
              <h2 className={styles.missionTitle}>
                Empowering travel businesses to deliver unforgettable cruise experiences
              </h2>
              <p className={styles.missionDesc}>
                Our mission is to simplify cruise commerce and empower our partners with the
                tools, data and support they need to grow.
              </p>
              <div className={styles.missionActions}>
                <Link href="/bookdemo" className={styles.btnPrimary}>Book a Demo</Link>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className={styles.partnersSection}>
        <div className={styles.container}>
          <p className={styles.partnersLabel}>Trusted by leading travel brands worldwide</p>
          <div className={styles.partnersGrid}>
                    <div className="trust-logos" style={{display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center', alignItems:'center'}}  >
          <span className="trust-logo script">
            <Image src={logoone} alt="Aerticket" width={180} />
          </span>
          <span className="trust-logo blue">
             <Image src={logtwo} alt="Satguru" width={180} />
          </span>
          <span className="trust-logo">
            <Image src={logthree} alt="Top Travel Trip" width={180} />
          </span>
          <span className="trust-logo green">
            <Image src={logofour} alt="Travelwings" width={180} />
          </span>
          <span className="trust-logo">
            <Image src={logofive} alt="Travtips" width={180} />
          </span>
         
        </div>
          </div>
        </div>
      </section>

      <Footer/>

    </div>
  );
}