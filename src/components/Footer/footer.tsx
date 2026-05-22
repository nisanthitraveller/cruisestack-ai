import React from "react";
import Image from "next/image";
import Link from "next/link";
import logoft from "../../assets/logo-white.png";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>

        {/* Brand */}
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.footerLogo}>
            <Image src={logoft} alt="cruisestack" width={190} height={25} />
          </Link>
          <p>The most complete cruise booking engine for travel companies worldwide.</p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink}>in</a>
            <a href="#" className={styles.socialLink}>f</a>
            <a href="#" className={styles.socialLink}>▶</a>
          </div>
        </div>

        {/* Product */}
        <div className={styles.footerCol}>
          <h4>Product</h4>
          <ul>
            <li><Link href="#">Features</Link></li>
            <li><Link href="#">Integrations</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="#">API</Link></li>
          </ul>
        </div>

        {/* Solutions */}
        <div className={styles.footerCol}>
          <h4>Solutions</h4>
          <ul>
            <li><Link href="#">Travel Agencies</Link></li>
            <li><Link href="#">OTAs</Link></li>
            <li><Link href="#">Enterprises</Link></li>
            <li><Link href="#">Host Agencies</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className={styles.footerCol}>
          <h4>Resources</h4>
          <ul>
            <li><Link href="#">Documentation</Link></li>
            <li><Link href="#">Help Center</Link></li>
            <li><Link href="#">Blog</Link></li>
            <li><Link href="#">Case Studies</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={`${styles.footerCol} ${styles.footerContact}`}>
          <h4>Have Questions? Let&apos;s Talk.</h4>
          <p>Our experts are ready to help you choose the right plan and grow your cruise business.</p>
          <div className={styles.footerContactBtns}>
            <button className={styles.btnPrimary}>Book a Demo</button>
            <button className={styles.btnOutlineWhite}>Contact Sales</button>
          </div>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <span>© 2026 cruisestack. All rights reserved.</span>
        <div className={styles.footerBottomLinks}>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}