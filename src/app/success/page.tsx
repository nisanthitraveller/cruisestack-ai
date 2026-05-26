"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../style.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id") || "";
  const isManualPayment = searchParams?.get("manual") === "1";
  const companySlug = searchParams?.get("company") || "";
  const billingCycle = searchParams?.get("billing_cycle") === "yearly" ? "yearly" : "monthly";
  const [secondsLeft, setSecondsLeft] = useState(5);

  const checkoutUrl = useMemo(() => {
    if (isManualPayment) {
      if (!companySlug) return "/login?manual=missing-company";

      const params = new URLSearchParams({
        company: companySlug,
        billing_cycle: billingCycle,
      });

      return `/api/manual-payment-success?${params.toString()}`;
    }

    if (!sessionId) return "/login?checkout=missing-session";

    return `/api/stripe/checkout-success?session_id=${encodeURIComponent(sessionId)}`;
  }, [billingCycle, companySlug, isManualPayment, sessionId]);

  const canRedirect = isManualPayment ? Boolean(companySlug) : Boolean(sessionId);

  useEffect(() => {
    if (!canRedirect) return;

    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    const redirect = window.setTimeout(() => {
      window.location.replace(checkoutUrl);
    }, 5000);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(redirect);
    };
  }, [canRedirect, checkoutUrl]);

  return (
    <main className="cruise-page-body success-page">
      <section className="success-card">
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>

        <p className="eyebrow">
          {isManualPayment ? "Manual payment received" : "Subscription confirmed"}
        </p>
        <h1>
          {isManualPayment ? "Manual payment request received" : "Thanks for subscribing"}
        </h1>
        <p>
          {isManualPayment
            ? "Your Professional plan access is being enabled. We are signing you in and loading your CruiseStack dashboard."
            : "Your cruisestack AI workspace is being prepared. We are signing you in and loading your subscription, billing, and commission dashboard."}
        </p>

        <div className="success-countdown" aria-live="polite">
          <strong>{canRedirect ? secondsLeft : "-"}</strong>
          <span>Redirecting to dashboard</span>
        </div>

        <div className="success-details">
          <div>
            <span>Payment</span>
            <strong>{isManualPayment ? "Manual" : "Completed"}</strong>
          </div>
          <div>
            <span>Dashboard</span>
            <strong>{canRedirect ? `Opening in ${secondsLeft}s` : "Session missing"}</strong>
          </div>
        </div>

        <a className="success-button" href={checkoutUrl}>
          Continue to dashboard
        </a>
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
