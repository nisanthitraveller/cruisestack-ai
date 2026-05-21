"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../style.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id") || "";
  const [secondsLeft, setSecondsLeft] = useState(5);

  const checkoutUrl = useMemo(() => {
    if (!sessionId) return "/login?checkout=missing-session";

    return `/api/stripe/checkout-success?session_id=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

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
  }, [checkoutUrl, sessionId]);

  return (
    <main className="cruise-page-body success-page">
      <section className="success-card">
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>

        <p className="eyebrow">Subscription confirmed</p>
        <h1>Thanks for subscribing</h1>
        <p>
          Your CruiseStack AI workspace is being prepared. We are signing you in
          and loading your subscription, billing, and commission dashboard.
        </p>

        <div className="success-countdown" aria-live="polite">
          <strong>{sessionId ? secondsLeft : "-"}</strong>
          <span>Redirecting in seconds</span>
        </div>

        <div className="success-details">
          <div>
            <span>Payment</span>
            <strong>Completed</strong>
          </div>
          <div>
            <span>Dashboard</span>
            <strong>{sessionId ? `Opening in ${secondsLeft}s` : "Session missing"}</strong>
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
