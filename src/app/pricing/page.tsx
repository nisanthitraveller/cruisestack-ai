"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import '../style.css'; 
import logoMain from "../../assets/logo.png";
import logoft from "../../assets/logo-white.png";
import Image from 'next/image';
import Link from "next/link";
import Footer from "@/components/Footer/footer";

const plans = [
 
  {
    name: "Beginner",
    colorClass: "beginner",
    buyButtonId: "buy_btn_1TXFH0EmqvBXj5NHjnLGxB8B",
    stripePriceId: "price_1TXERSEmqvBXj5NHd0ImLbQk",
    features: {
      "Standard agency commissions": "Yes",
      "Online-direct payments": "Yes",
      "Cabin blocking": "Yes",
      "PDF quotations": "Yes",
      "Leads CRM dashboard": "Yes",
      "Ops support": "Yes",
      "Backend ops system": "Yes",
      "Iframe integration": "Yes",
      "B2C integration": "Yes",
      "B2B integration": "No",
      "User login integration": "No",
      "Payment gateway integration": "No",
      "Brand theme customisation": "No",
      "API integration": "No",
      "Sales support": "No",
      "Marketing support": "No",
      "Cruise line & GSA/PSA connects": "No",
      //"One-time integration: $1000": "Yes",
      //"Monthly fee: $499": "Yes",
      "$5/booking": "Yes",
      "Upto 1000 trip summaries": "Yes",
      //"$0.04/API scan fees": "Yes",
    },
    pricingdetails: {
      
      "Monthly fee": "$499/month",
      "Upto bookings": "up to 50 bookings",
    }
  },

  { 
    recommended: "Recommended",
    name: "Professional",
    colorClass: "professional",
    buyButtonId: "buy_btn_1TXFHhEmqvBXj5NHX68zHgJi",
    stripePriceId: "price_1TXERoEmqvBXj5NHejeHS6Kk",

    features: {
      "Best agency commissions": "Yes",
      "Online-direct payments": "Yes",
      "Cabin blocking": "Yes",
      "PDF quotations": "Yes",
      "Leads CRM dashboard": "Yes",
      "Ops support": "Yes",
      "Backend ops system": "Yes",
      "Iframe integration": "Yes",
      "B2C integration": "Yes",
      "B2B integration": "Yes",
      "User login integration": "Yes",
      "Payment gateway integration": "Yes",
      "Brand theme customisation": "Yes",
      "API integration": "No",
      "Sales support": "No",
      "Marketing support": "No",
      "Cruise line & GSA/PSA connects": "No",
      //"One-time integration: $2000": "Yes",
     // "Monthly fee: $999": "Yes",
      "$4/booking": "Yes",
      "Upto 2000 trip summaries": "Yes",
     // "$0.03/API scan fees": "Yes",
    },
     pricingdetails: {
     
      "Monthly fee": "$999/month",
      "Upto bookings": "up to 200 bookings",
    }
  },
  {
    name: "Enterprise",
    colorClass: "enterprise",
    buyButtonId: "buy_btn_1TXFJjEmqvBXj5NHAMCe0CWw",
    stripePriceId: "price_1TXESAEmqvBXj5NHO4QDybcN",
    
    features: {
      "Confidential agency commissions": "Yes",
      "Online-direct payments": "Yes",
      "Cabin blocking": "Yes",
      "PDF quotations": "Yes",
      "Leads CRM dashboard": "Yes",
      "Ops support": "Yes",
      "Backend ops system": "Yes",
      "Iframe integration": "Yes",
      "B2C integration": "Yes",
      "B2B integration": "Yes",
      "User login integration": "Yes",
      "Payment gateway integration": "Yes",
      "Brand theme customisation": "Yes",
      "API integration": "Yes",
      "Sales support": "Yes",
      "Marketing support": "Yes",
      "Cruise line & GSA/PSA connects": "Yes",
      // "One-time integration: $3000": "Yes",
      //"Monthly fee: $2199": "Yes",
      "$3/booking": "Yes",
      "Upto 5000 trip summaries": "Yes",
      //"$0.02/API scan fees": "Yes",
    },
     pricingdetails: {
      
      "Monthly fee": "$2199/month",
      "Upto bookings": "up to 300 bookings",
    }
  },
];

const stripePublishableKey = "pk_test_xQRIZXb6NdxLp0H7njlt4fcb009VCIPwSf";

type AgentSummary = {
  name: string;
  email?: string | null;
};

function PricingNavActions() {
  const [agent, setAgent] = useState<AgentSummary | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAgent() {
      try {
        const response = await fetch("/api/agent/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!active) return;

        if (!response.ok) {
          setAgent(null);
          return;
        }

        const data = await response.json();
        setAgent(data.authenticated ? data.agent : null);
      } catch {
        if (active) setAgent(null);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    loadAgent();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoggingOut(true);

    await fetch("/api/agent/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  if (checkingSession) {
    return (
      <div className="nav-actions">
        <span className="nav-user-skeleton">Checking session...</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="nav-actions">
        <Link href="/login" className="btn-ghost">Login</Link>
        <Link href="/signup" className="btn-ghost">Sign Up</Link>
        <Link href="/bookdemo" className="btn-primary">Book a Demo</Link>
      </div>
    );
  }

  return (
    <div className="nav-actions">
      <span className="nav-user-name">{agent.name}</span>
      <form className="nav-logout-form" onSubmit={handleLogout}>
        <button className="btn-ghost" type="submit" disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </form>
    </div>
  );
}

function PricingContent() {
  const searchParams = useSearchParams();
  const companySlug = searchParams?.get("company") || undefined;
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const manualPaymentUrl = (cycle: "monthly" | "yearly") => {
    const params = new URLSearchParams({
      manual: "1",
      billing_cycle: cycle,
    });

    if (companySlug) {
      params.set("company", companySlug);
    }

    return `/success?${params.toString()}`;
  };
  const boldFeatures = new Set([
    "B2B integration",
    "User login integration",
    "Payment gateway integration",
    "Brand theme customisation",
    "API integration",
    "Sales support",
    "Marketing support",
    "Cruise line & GSA/PSA connects",
  ]);

  return (
     <main className="cruise-page-body">
      <nav>
        <div className='container-nav'>
          <Link href="/" className="nav-logo">
              <Image src={logoMain} alt="cruisestack" width={190}/>
          </Link>
          <ul className="nav-links">
            <li><a href="/product">Product</a></li>
            <li><a href="/solutions">Solutions </a></li>
            <li><a href="/resources">Resources </a></li>
            <li><a href="/company">Company </a></li>
          </ul>
          
          <PricingNavActions />
        </div>
      </nav>

      <Script
        async
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />

      <div className="pricing-page">
        <section className="pricing-hero" style={{marginBottom:'85px'}}>
         
          <h1>Simple, transparent & scalable tiers</h1>
          <p>Choose the feature landscape that matches your business scale.</p>

        </section>
  {/* <div 
  className="billing-toggle" 
  style={{ 
    width: '100%', 
    marginBottom: '3.5rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '.6rem',
    fontFamily: 'sans-serif'
    
  }}
>
 
  <span 
    onClick={() => setBillingCycle("monthly")}
    style={{ 
      fontSize: '1rem',
      fontWeight: '500',
      color: '#000000',
      cursor: 'pointer',
      userSelect: 'none'
    }}
  >
    Monthly
  </span>

 
  <div 
    onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
    style={{
      width: '40px',
      height: '22px',
      backgroundColor: '#4d82f3', 
      borderRadius: '20px',
      position: 'relative',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      transition: 'background-color 0.2s ease'
    }}
  >
   
    <div 
      style={{
        width: '18px',
        height: '18px',
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: billingCycle === "monthly" ? '2px' : '20px',
        transition: 'left 0.2s ease-in-out',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}
    />
  </div>

  
  <span 
    onClick={() => setBillingCycle("annual")}
    style={{ 
      fontSize: '1rem',
      fontWeight: '500',
      color: '#000000',
      cursor: 'pointer',
      userSelect: 'none'
    }}
  >
    Annual
  </span>
  <span className="save_badge">Save 20%</span>
</div> */}

        <section className="pricing-grid structural-four-columns">
        

          {plans.map((plan) => (
            <article className="pricing-card" key={plan.name} style={{position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
             {plan.recommended && <div className="recommended-badge">{plan.recommended}</div>}
              <div className="pricing-card-header-wrapper">
                  
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
                      <span className="feature-status" style={{ fontWeight: 'bold', color: available === "Yes" ? "#22c55e" : "#000" }}>
                        {available === "Yes" ? "" : "-"}
                      </span>
                      <span className="feature-name" style={{ fontSize: '1rem', display: available === "No" ? "none" : "block" }}>
                        {boldFeatures.has(feature) ? <strong>{feature}</strong> : feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pricing_details">
                {Object.entries(plan.pricingdetails).map(([detail, value]) => (
                  <div key={detail} className="pricing-detail-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   
                   
                    <span className="pricing-detail-value" style={{ fontSize: '0.85rem', color: '#555' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', padding:'8px' }}>
                {plan.buyButtonId ? (
                  <div className="stripe-button-wrapper">
                    <stripe-buy-button
                      buy-button-id={plan.buyButtonId}
                      publishable-key={stripePublishableKey}
                      client-reference-id={companySlug}
                    ></stripe-buy-button>
                  </div>
                ) : (
                  <Link
                    href={`/signup?plan=${plan.name.toLowerCase()}${companySlug ? `&company=${companySlug}` : ''}`}
                    className="btn-primary"
                    style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.75rem 0', textDecoration: 'none' }}
                  >
                   Start 14 days trial
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="manual-payment-section">
          <div className="manual-payment-box">
            <div className="manual-payment-divider">
              <span>OR</span>
            </div>
            <p>Manual Payment</p>

            {companySlug ? (
              <div className="manual-payment-actions">
                <Link href={manualPaymentUrl("monthly")} className="manual-payment-button">
                  Monthly
                </Link>
                <Link href={manualPaymentUrl("yearly")} className="manual-payment-button">
                  Yearly
                </Link>
              </div>
            ) : (
              <Link href="/signup?plan=professional" className="manual-payment-button manual-payment-wide">
                Create company first
              </Link>
            )}
          </div>
        </section>
      </div>

     <Footer/>
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
