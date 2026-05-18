"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import '../style.css'; 
import logoMain from "../../assets/logo.svg";
import logoft from "../../assets/logo-white.png";
import Image from 'next/image';
import Link from "next/link";

const plans = [
  {
    name: "Beginner",
    colorClass: "beginner",
    deposit: "$1000",
    monthly: "$1000",
    bookingFee: "$4 / booking",
    tripSummary: "$1 / trip summary",
    apiFee: "$0.04 / scan",
    estimated: "~$1300",
    bookings: "up to 50 bookings",
    buyButtonId: "buy_btn_1TXFH0EmqvBXj5NHjnLGxB8B",
    stripePriceId: "price_1TXERSEmqvBXj5NHd0ImLbQk",
  },
  {
    name: "Professional",
    colorClass: "professional",
    deposit: "$2000",
    monthly: "$1400",
    bookingFee: "$3 / booking",
    tripSummary: "$0.4 / trip summary",
    apiFee: "$0.03 / scan",
    estimated: "~$1800",
    bookings: "up to 100 bookings",
    buyButtonId: "buy_btn_1TXFHhEmqvBXj5NHX68zHgJi",
    stripePriceId: "price_1TXERoEmqvBXj5NHejeHS6Kk",
  },
  {
    name: "Enterprise",
    colorClass: "enterprise",
    deposit: "$3000",
    monthly: "$2200",
    bookingFee: "$2 / booking",
    tripSummary: "$0.1 / trip summary",
    apiFee: "$0.02 / scan",
    estimated: "~$2700",
    bookings: "up to 200 bookings",
    buyButtonId: "buy_btn_1TXFJjEmqvBXj5NHAMCe0CWw",
    stripePriceId: "price_1TXESAEmqvBXj5NHO4QDybcN",
  },
];

function PricingContent() {
  const searchParams = useSearchParams();
  const companySlug = searchParams?.get("company") || undefined;

  return (
     <main className="cruise-page-body">
       {/* ───── NAV ───── */}
      <nav>
        <div className='container-nav'>
          <a href="#" className="nav-logo">
            
              <Image src={logoMain} alt="CruiseEngine" width={190}/>
           
           
        </a>
        <ul className="nav-links">
          <li><a href="#">Product</a></li>
          <li><a href="#">Solutions </a></li>
          <li><a href="#">Resources </a></li>
          <li><a href="#">Company </a></li>
        </ul>
        
        <div className="nav-actions">
        <Link href="/login" className="btn-ghost">
         Login
        </Link>

        <Link href="/signup" className="btn-ghost">
         Sign Up
        </Link>

        <Link href="/bookdemo" className="btn-primary">
         Book a Demo
        </Link>
        </div>
        </div>
      </nav>
      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />
      <div className="pricing-page">
      <section className="pricing-hero">
        <p className="eyebrow">Pricing</p>
        <h1>Simple, Transparent & Scalable Pricing</h1>
        <p>Choose the plan that fits your business.</p>
      </section>

      <section className="pricing-grid">
        {plans.map((plan) => (
          <article className="pricing-card" key={plan.name}>
            <div className={`pricing-card-header ${plan.colorClass}`}>
              {plan.name}
            </div>

            <div className="pricing-row">
              <span>One-time Deposit</span>
              <strong>{plan.deposit}</strong>
            </div>

            <div className="pricing-row">
              <span>Monthly Fee</span>
              <strong>{plan.monthly}</strong>
            </div>

            <div className="pricing-row">
              <span>Variable Fee / Booking</span>
              <strong>{plan.bookingFee}</strong>
            </div>

            <div className="pricing-row">
              <span>Variable Fee / Trip Summary</span>
              <strong>{plan.tripSummary}</strong>
            </div>

            <div className="pricing-row">
              <span>Variable Fee / APIs Scan Fees</span>
              <strong>{plan.apiFee}</strong>
            </div>

            <div className="pricing-total">
              <span>Estimated Monthly Billing</span>
              <h2>{plan.estimated}</h2>
              <p>{plan.bookings}</p>
            </div>

            <div className="stripe-button-wrapper">
              <stripe-buy-button
                buy-button-id={plan.buyButtonId}
                publishable-key="pk_test_xQRIZXb6NdxLp0H7njlt4fcb009VCIPwSf"
                client-reference-id={companySlug}
              />
            </div>
          </article>
        ))}
      </section>
      </div>
       {/* ───── FOOTER ───── */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo" style={{ textDecoration: 'none' }}>
             <Image src={logoft} alt="CruiseEngine" width={190}/>
            </a>
            <p>The most complete cruise booking engine for travel companies worldwide.</p>
            <div className="social-links">
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">▶</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Integrations</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><a href="#">Travel Agencies</a></li>
              <li><a href="#">OTAs</a></li>
              <li><a href="#">Enterprises</a></li>
              <li><a href="#">Host Agencies</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Case Studies</a></li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>Have Questions? Let&apos;s Talk.</h4>
            <p>Our experts are ready to help you choose the right plan and grow your cruise business.</p>
            <div className="footer-contact-btns">
              <button className="btn-primary">Book a Demo</button>
              <button className="btn-outline-white">Contact Sales</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CruiseEngine. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}
