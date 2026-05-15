"use client";

import Script from "next/script";

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
  },
];

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />

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
              />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}