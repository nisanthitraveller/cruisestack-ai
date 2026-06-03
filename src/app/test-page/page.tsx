import Script from "next/script";
import "../style.css";

export default function TestPage() {
  return (
    <main className="test-page">
      <Script
        async
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />

      <section className="test-page-panel">
        <p className="test-page-kicker">Cruisestack test page</p>
        <h1>Stripe $1 button test</h1>
        <p>
          Use this page for payment-button checks and other future experiments.
        </p>

        <div className="test-page-button-slot">
          <stripe-buy-button
            buy-button-id="buy_btn_1Te6QOEmqvBXj5NHQ6BVpdva"
            publishable-key="pk_live_51GJbyfEmqvBXj5NHMQL7JwIH8XpeW0PnZn4LvhWKI2ZntEo3gcsorswHdiwWTGcKB8dG8ICB8lCPirX2DEq1U5n400CCAPWkPb"
          ></stripe-buy-button>
        </div>
      </section>
    </main>
  );
}
