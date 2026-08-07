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
    // Test buy button: buy_btn_1TXFH0EmqvBXj5NHjnLGxB8B
    buyButtonId: "buy_btn_1Tc2w8EmqvBXj5NHLYhkv3Sd",
    stripePriceId: "price_1TXERSEmqvBXj5NHd0ImLbQk",
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
      "B2B integration": "yes",
      "User login integration": "yes",
      "Payment gateway integration": "yes",
      "Brand theme customisation": "yes",
      "API integration": "yes",
      "Sales support": "yes",
      "Marketing support": "yes",
      "Cruise line & GSA/PSA connects": "yes",
      "AI bot (on web and WhatsApp)": "yes",
      "AI chatbot": "yes",
      "AI voicebot": "yes",
      //"One-time integration: $1000": "Yes",
      //"Monthly fee: $499": "Yes",
      "400 trip summaries/month": "Yes",
      "20 bookings/month": "Yes",
      //"$0.04/API scan fees": "Yes",
    },
    pricingdetails: {
      "Monthly fee": "$499/month",
      "$5/booking": "$5/booking",
    }
  },

  { 
    recommended: "Recommended",
    name: "Professional",
    colorClass: "professional",
    // Test buy button: buy_btn_1TXFHhEmqvBXj5NHX68zHgJi
    buyButtonId: "buy_btn_1Tc2xMEmqvBXj5NHgUanmIGl",
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
      "API integration": "yes",
      "Sales support": "yes",
      "Marketing support": "yes",
      "Cruise line & GSA/PSA connects": "yes",
      "AI bot (on web and WhatsApp)": " Yes",
       "AI chatbot": "yes",
      "AI voicebot": "yes",
      //"One-time integration: $2000": "Yes",
     // "Monthly fee: $999": "Yes",
      
      "2000 trip summaries/month": "Yes",
       "100 bookings/month": "yes",
     // "$0.03/API scan fees": "Yes",
    },
     pricingdetails: {
     
      "Monthly fee": "$999/month",
     
      "$4/booking": "$4/booking",
    }
  },
  {
    name: "Enterprise",
    colorClass: "enterprise",
    // Test buy button: buy_btn_1TXFJjEmqvBXj5NHAMCe0CWw
    buyButtonId: "buy_btn_1Tc2z7EmqvBXj5NHUQVP4Rwx",
    stripePriceId: "price_1TXESAEmqvBXj5NHO4QDybcN",
    
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
      "API integration": "Yes",
      "Sales support": "Yes",
      "Marketing support": "Yes",
      "Cruise line & GSA/PSA connects": "Yes",
      "AI bot (on web and WhatsApp)": "Yes",
       "AI chatbot": "yes",
      "AI voicebot": "yes",
      // "One-time integration: $3000": "Yes",
      //"Monthly fee: $2199": "Yes",
     
      "5000 trip summaries/month": "Yes",
      "250 bookings/month": "Yes",
      //"$0.02/API scan fees": "Yes",
    },
     pricingdetails: {
      
      "Monthly fee": "$1999/month",
       "$3/booking": "$3/booking",
      
      
    }
  },
];

// Test publishable key: pk_test_xQRIZXb6NdxLp0H7njlt4fcb009VCIPwSf
const stripePublishableKey = "pk_live_51GJbyfEmqvBXj5NHMQL7JwIH8XpeW0PnZn4LvhWKI2ZntEo3gcsorswHdiwWTGcKB8dG8ICB8lCPirX2DEq1U5n400CCAPWkPb";

type AgentSummary = {
  companySlug?: string | null;
  name: string;
  email?: string | null;
};

const dashboardOrigin = "https://cruisestack.ai";

function agentDashboardHref(agent: AgentSummary) {
  if (!agent.companySlug) return "/dashboard";

  return `${dashboardOrigin}/agents/${encodeURIComponent(agent.companySlug)}/admin/dashboard`;
}

type CompanySubscriptionStatus = {
  billingCycle?: string | null;
  companyFound: boolean;
  companyName?: string | null;
  currentPeriodEnd?: string | null;
  currentPeriodStart?: string | null;
  dashboardUrl?: string | null;
  hasSubscription?: boolean;
  isActive: boolean;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  planName?: string | null;
  stripeStatus?: string | null;
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
        setAgent(
          data.authenticated
            ? {
                ...data.agent,
                companySlug: data.company?.slug || null,
              }
            : null,
        );
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

    localStorage.removeItem("jwtToken");
    localStorage.removeItem("iframe_token");
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("iframe_token");
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
      <Link href={agentDashboardHref(agent)} className="nav-user-name">
        {agent.name}
      </Link>
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
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<CompanySubscriptionStatus | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(Boolean(companySlug));
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");
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
  const paymentsHidden = Boolean(subscriptionStatus?.isActive);
  const boldFeatures = new Set([
    "B2B integration",
    "User login integration",
    "Payment gateway integration",
    "Brand theme customisation",
    "API integration",
    "Sales support",
    "Marketing support",
    "Cruise line & GSA/PSA connects",
    "AI bot (on web and WhatsApp)",
  ]);

  useEffect(() => {
    let active = true;

    async function loadSubscriptionStatus() {
      if (!companySlug) {
        setCheckingSubscription(false);
        setSubscriptionStatus(null);
        return;
      }

      setCheckingSubscription(true);

      try {
        const response = await fetch(
          `/api/company-subscription-status?company=${encodeURIComponent(companySlug)}`,
          { cache: "no-store" },
        );

        if (!active) return;

        if (!response.ok) {
          setSubscriptionStatus(null);
          return;
        }

        setSubscriptionStatus(await response.json());
      } catch {
        if (active) setSubscriptionStatus(null);
      } finally {
        if (active) setCheckingSubscription(false);
      }
    }

    loadSubscriptionStatus();

    return () => {
      active = false;
    };
  }, [companySlug]);

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

        {companySlug && checkingSubscription ? (
          <section className="pricing-subscription-card">
            <span>Checking subscription</span>
            <strong>Please wait...</strong>
          </section>
        ) : null}

        {companySlug && subscriptionStatus?.companyFound === false ? (
          <section className="pricing-subscription-card warning">
            <span>Company not found</span>
            <strong>{companySlug}</strong>
            <p>Please create the company account before choosing a plan.</p>
            <Link href="/signup" className="pricing-dashboard-button">
              Create company
            </Link>
          </section>
        ) : null}

        {subscriptionStatus?.isActive ? (
          <section className="pricing-subscription-card active">
            <span>Subscription active</span>
            <strong>
              {subscriptionStatus.companyName || companySlug} -{" "}
              {subscriptionStatus.planName || "Active plan"}
            </strong>
            <p>
              Payment: {subscriptionStatus.paymentMethod || "stripe"} /{" "}
              {subscriptionStatus.paymentStatus || subscriptionStatus.stripeStatus || "active"}
            </p>
            <Link
              href={subscriptionStatus.dashboardUrl || `/api/company-dashboard?company=${companySlug}`}
              className="pricing-dashboard-button"
            >
              Continue to dashboard
            </Link>
          </section>
        ) : null}
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
                        {available === "Yes" ? "" : ""}
                      </span>
                      <span className="feature-name" style={{ fontSize: '1rem', display: available === "No" ? "none" : "block" }}>
                        {boldFeatures.has(feature) ? <span>{feature}</span> : feature}
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

                {paymentsHidden ? (
                  <div className="pricing-plan-active-note">
                    Current subscription is active
                  </div>
                ) : (
                  <> <div className="stripe-button-wrapper">
                        <stripe-buy-button
                          buy-button-id={plan.buyButtonId}
                          publishable-key={stripePublishableKey}
                          client-reference-id={companySlug}
                        ></stripe-buy-button>
                      </div>
                    {/*{plan.buyButtonId && plan.name !== "Enterprise" ? (
                      ) : null}

                      // ) : plan.name !== "Enterprise" ? (
                    //   <Link
                    //     href={`/signup?plan=${plan.name.toLowerCase()}${companySlug ? `&company=${companySlug}` : ''}`}
                    //     className="btn-primary"
                    //     style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.75rem 0', textDecoration: 'none' }}
                    //   >
                    //     Start 14 days trial
                    //   </Link>
                    // ) : null}
                    
                    {plan.name === "Enterprise" && (
                      <button
                        type="button"
                        onClick={() => setContactModalOpen(true)}
                        className="btn-primary"
                        style={{ width: '87%',textAlign: 'center',justifyContent: 'center',fontWeight:'400', minHeight:'44px',marginBottom:'25px' }}
                      >
                        Get in touch with us
                      </button>
                    )} */}
                  </>
                )}
              </div>
            </article>
          ))}
        </section>

        {!paymentsHidden ? (
        <section className="manual-payment-section">
          <div className="manual-payment-box">
            <div className="manual-payment-divider">
              <span>OR</span>
            </div>
            <p>Need a longer 21-day free trial?</p>

            {companySlug ? (
              <div className="manual-payment-actions" style={{display:'flex',justifyContent:'center'}}>
                 <Link href={manualPaymentUrl("monthly")} className="manual-payment-button">
                   Start trial
                </Link>
               {/* <Link href={manualPaymentUrl("yearly")} className="manual-payment-button">
                  Yearly
                </Link> */}
               
              </div>
            ) : (
              <Link href="/signup?plan=professional" className="manual-payment-button manual-payment-wide">
              Start trial
              </Link>
            )}
          </div>
        </section>
        ) : null}

        {contactModalOpen ? (
          <div
            className="contact-modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: '1rem',
            }}
          >
            <div
              className="contact-modal"
              style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                padding: '1.5rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Get in touch</h2>
                  <p style={{ margin: '0.5rem 0 0', color: '#555' }}>
                    Share your details and we will contact you soon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#333',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                  aria-label="Close contact form"
                >
                  ×
                </button>
              </div>

              <form style={{ marginTop: '1.25rem', display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '12px', color: '#333' }}>
                  Name
                  <input
                    type="text"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder="Your name"
                    style={{ padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%',fontSize:'15px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '12px', color: '#333' }}>
                  Email
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder="you@example.com"
                    style={{ padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%',fontSize:'15px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '12px', color: '#333' }}>
                  Mobile
                  <input
                    type="tel"
                    value={contactMobile}
                    onChange={(event) => setContactMobile(event.target.value)}
                    placeholder="+1 123 456 7890"
                    style={{ padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%',fontSize:'15px' }}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                 
                  <button
                     className="btn-primary"
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
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
