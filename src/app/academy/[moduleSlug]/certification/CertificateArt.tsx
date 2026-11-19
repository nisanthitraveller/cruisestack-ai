import styles from "../../academy.module.css";

// Sample CruiseCred certificate shown in the certification page hero (decorative).
export default function CertificateArt() {
  return (
    <div className={styles.certArtRoot} aria-hidden="true">
      <div className={styles.certPaper}>
        <div className={styles.certRuleOuter} />
        <div className={styles.certRuleInner} />

        <div className={styles.certContent}>
          <div className={styles.certIssuer}>
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M3 22 Q16 28 29 22" stroke="#0F5FD9" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M16 7 L29 12.5 L16 18 L3 12.5 Z" fill="#0A2240" />
            </svg>
            <span>
              cruise<span className={styles.certBlue}>stack</span>.ai <span className={styles.certLight}>Academy</span>
            </span>
          </div>
          <div className={styles.certPowered}>Powered by AERTiCKET</div>
          <div className={styles.certGoldBar} />
          <div className={styles.certKicker}>Certificate of Completion</div>
          <div className={styles.certSmall}>This certifies that</div>
          <div className={styles.certName}>[Recipient name]</div>
          <div className={styles.certNameLine} />
          <div className={styles.certSmall}>has successfully completed the certification assessment for the</div>
          <div className={styles.certBrand}>CruiseCred</div>
          <div className={styles.certProgram}>Cruise Travel Specialist Certification</div>
          <div className={styles.certCovers}>covering all five modules of the cruisestack.ai Academy programme</div>
          <div className={styles.certScore}>
            <span>Score achieved</span>
            <strong>92%</strong>
          </div>

          <div className={styles.certSpacer} />

          <div className={styles.certFoot}>
            <div>
              <div className={styles.certSign} />
              <div className={styles.certFootTitle}>cruisestack.ai Academy</div>
              <div className={styles.certFootSub}>In partnership with AERTiCKET</div>
            </div>
            <div className={styles.certFootRight}>
              <div className={styles.certSign} />
              <div className={styles.certFootTitle}>Issued [Month Year]</div>
              <div className={styles.certFootSub}>Credential ID [CS-000000]</div>
            </div>
          </div>
        </div>

        <div className={styles.certSeal}>
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFFDF6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span>CERTIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
