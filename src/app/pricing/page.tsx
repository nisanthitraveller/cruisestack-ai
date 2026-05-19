"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import '../style.css'; 
import logoMain from "../../assets/logo.png";
import logoft from "../../assets/logo-white.png";
import Image from 'next/image';
import Link from "next/link";

const plans = [
  {
    name: "Current agency commissions",
    colorClass: "lite",
    features: {
      "Iframe integration": "Yes",
      "Online cruise-direct payments": "No",
      "Cabin blocking": "No",
      "PDF quotations": "No",
      "Leads CRM dashboard": "No",
      "Ops support": "No",
      "Backend booking ops system": "No",
      "User login integration": "No",
      "Payment gateway integration": "No",
      "Brand theme customisation": "No",
      "API integration": "No",
      "Sales support": "No",
      "Marketing support": "No",
      "Cruise line & GSA/PSA connects": "No",
    }
  },
  {
    name: "Low",
    colorClass: "beginner",
    buyButtonId: "buy_btn_1TXFH0EmqvBXj5NHjnLGxB8B",
    stripePriceId: "price_1TXERSEmqvBXj5NHd0ImLbQk",
    features: {
      "Iframe integration": "Yes",
      "Online cruise-direct payments": "Yes",
      "Cabin blocking": "Yes",
      "PDF quotations": "Yes",
      "Leads CRM dashboard": "Yes",
      "Ops support": "Yes",
      "Backend booking ops system": "Yes",
      "User login integration": "No",
      "Payment gateway integration": "No",
      "Brand theme customisation": "No",
      "API integration": "No",
      "Sales support": "No",
      "Marketing support": "No",
      "Cruise line & GSA/PSA connects": "No",
    }
  },
  {
    name: "Medium",
    colorClass: "professional",
    buyButtonId: "buy_btn_1TXFHhEmqvBXj5NHX68zHgJi",
    stripePriceId: "price_1TXERoEmqvBXj5NHejeHS6Kk",
    features: {
      "Iframe integration": "Yes",
      "Online cruise-direct payments": "Yes",
      "Cabin blocking": "Yes",
      "PDF quotations": "Yes",
      "Leads CRM dashboard": "Yes",
      "Ops support": "Yes",
      "Backend booking ops system": "Yes",
      "User login integration": "Yes",
      "Payment gateway integration": "Yes",
      "Brand theme customisation": "Yes",
      "API integration": "No",
      "Sales support": "No",
      "Marketing support": "No",
      "Cruise line & GSA/PSA connects": "No",
    }
  },
  {
    name: "High",
    colorClass: "enterprise",
    buyButtonId: "buy_btn_1TXFJjEmqvBXj5NHAMCe0CWw",
    stripePriceId: "price_1TXESAEmqvBXj5NHO4QDybcN",
    features: {
      "Iframe integration": "Yes",
      "Online cruise-direct payments": "Yes",
      "Cabin blocking": "Yes",
      "PDF quotations": "Yes",
      "Leads CRM dashboard": "Yes",
      "Ops support": "Yes",
      "Backend booking ops system": "Yes",
      "User login integration": "Yes",
      "Payment gateway integration": "Yes",
      "Brand theme customisation": "Yes",
      "API integration": "Yes",
      "Sales support": "Yes",
      "Marketing support": "Yes",
      "Cruise line & GSA/PSA connects": "Yes",
    }
  },
];

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_xQRIZXb6NdxLp0H7njlt4fcb009VCIPwSf";

function PricingContent() {
  const searchParams = useSearchParams();
  const companySlug = searchParams?.get("company") || undefined;

  return (
     <main className="cruise-page-body">
      <nav>
        <div className='container-nav'>
          <Link href="/" className="nav-logo">
              <Image src={logoMain} alt="CruiseEngine" width={190}/>
          </Link>
          <ul className="nav-links">
            <li><a href="#">Product</a></li>
            <li><a href="#">Solutions </a></li>
            <li><a href="#">Resources </a></li>
            <li><a href="#">Company </a></li>
          </ul>
          
          <div className="nav-actions">
            <Link href="/login" className="btn-ghost">Login</Link>
            <Link href="/signup" className="btn-ghost">Sign Up</Link>
            <Link href="/bookdemo" className="btn-primary">Book a Demo</Link>
          </div>
        </div>
      </nav>

      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />

      <div className="pricing-page">
        <section className="pricing-hero">
          <p className="eyebrow">Pricing & Plans</p>
          <h1>Simple, Transparent & Scalable Tiers</h1>
          <p>Choose the feature landscape that matches your business scale.</p>
        </section>

        <section className="pricing-grid structural-four-columns">
          {plans.map((plan) => (
            <article className="pricing-card" key={plan.name} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
              <div>
                <div className={`pricing-card-header ${plan.colorClass}`} style={{ padding: '1rem', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem' }}>
                  {plan.name}
                </div>

                {/* Features List */}
                <div className="features-list" style={{ margin: '2rem 0' }}>
                  {Object.entries(plan.features).map(([feature, available]) => (
                    <div 
                      key={feature} 
                      className={`feature-item ${available === "No" ? "disabled" : ""}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', opacity: available === "No" ? 0.35 : 1 }}
                    >
                      <span className="feature-status" style={{ fontWeight: 'bold', color: available === "Yes" ? "#22c55e" : "#ef4444" }}>
                        {available === "Yes" ? "✓" : "✕"}
                      </span>
                      <span className="feature-name" style={{ fontSize: '0.9rem', textDecoration: available === "No" ? "line-through" : "none" }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', padding:'8px' }}>
                {plan.buyButtonId ? (
                  <div className="stripe-button-wrapper">
                    <stripe-buy-button
                      buy-button-id={plan.buyButtonId}
                      publishable-key={stripePublishableKey}
                      client-reference-id={companySlug}
                    />
                  </div>
                ) : (
                  <Link
                    href={`/signup?plan=${plan.name.toLowerCase()}${companySlug ? `&company=${companySlug}` : ''}`}
                    className="btn-primary"
                    style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.75rem 0', textDecoration: 'none' }}
                  >
                    Start Trial
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>

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
