"use client";

import { useState } from "react";

type Integration = { id: number; label: string };
type TestType = "authentication" | "wallet" | "availability" | "pricing";

type PriceDetail = {
  type?: string;
  fare?: number;
};

type PricingRoom = {
  price_details?: PriceDetail[];
};

type PricingResponse = {
  available?: boolean;
  base_price?: number;
  port_charges?: number;
  gratuity?: number;
  fuel_surcharge?: number;
  gross_tax?: number;
  gross_price?: number;
  rooms?: PricingRoom[];
};

const reschedulingPolicy = [
  "More than 61 days: INR 5,000 per stateroom plus any fare difference.",
  "46 to 60 days: INR 10,000 per stateroom plus any fare difference.",
  "31 to 45 days: INR 15,000 per stateroom plus any fare difference.",
  "0 to 30 days: Rescheduling is not permitted and will be treated as a cancellation.",
  "Alternative applicable schedule — 46 days or more: INR 5,000 per stateroom plus any fare difference.",
  "Alternative applicable schedule — 31 to 45 days: INR 7,000 per stateroom plus any fare difference.",
  "Alternative applicable schedule — 16 to 30 days: INR 10,000 per stateroom plus any fare difference.",
  "Alternative applicable schedule — 0 to 15 days: Rescheduling is not permitted and will be treated as a cancellation.",
  "The policy applies to rescheduling the complete booking. Partial-booking rescheduling is not permitted.",
  "Any fare difference, including cabin fares, service charges, levies, taxes and fuel surcharge, is payable by the customer.",
  "No refund is provided when changing from a higher-priced cabin or sailing to a lower-priced option.",
  "For a documented medical emergency, rescheduling fees may be waived; fare differences remain applicable.",
  "Government taxes remain applicable.",
  "GST applies to all payable rescheduling amounts.",
  "The rescheduled itinerary must commence within six months of the original departure date.",
  "If travel does not commence within six months, it will be treated as a no-show and only eligible taxes will be refunded.",
  "Free rescheduling may be allowed following the death of an immediate family member or severe illness when valid supporting documents are submitted; applicable fare differences still apply.",
  "Cancellation after rescheduling is calculated using the original sailing date.",
  "Rescheduling fees are non-refundable.",
];

const cancellationPolicy = [
  "46 days or more: Full refund.",
  "31 to 45 days: 50% of the cabin fare and 100% of the fuel surcharge.",
  "0 to 30 days: 100% of the cabin fare and fuel surcharge.",
  "No-show: 100% of the cabin fare and fuel surcharge.",
  "Cancellation is permitted only for the entire stateroom. Partial passenger cancellation is not allowed.",
  "Service charges and levies are refundable, including in a no-show case.",
  "GST on the refunded amount will be returned.",
  "For death or major illness, a full-stateroom refund may be provided after submission and validation of supporting proof.",
  "Refunds will be processed within 31 working days from the cancellation date.",
  "Modification fees and rescheduling fees are non-refundable.",
  "For a partially paid booking, failure to pay the balance by the due date may cause automatic cancellation and forfeiture of the paid amount.",
  "The complete fuel surcharge will be forfeited across all categories where the cancellation policy applies.",
  "Exclusive Value Fare and B.O.G.O. offers may not permit refund, rescheduling or no-show benefits.",
  "Offer benefits do not apply to modifications made after the original booking.",
  "This policy applies only after full payment has been received.",
];

function inr(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function FareSummary({ pricing }: { pricing: PricingResponse }) {
  const passengers = (pricing.rooms || []).flatMap(
    (room) => room.price_details || [],
  );
  const passengerCounts = new Map<string, number>();

  return (
    <section className="production-fare-summary">
      <div className="production-fare-heading">
        <div>
          <p className="adminmaster-kicker">Customer-facing calculation</p>
          <h2>Fare Summary</h2>
        </div>
        <span>{pricing.available ? "Available" : "Unavailable"}</span>
      </div>

      <div className="production-fare-lines">
        <div className="production-fare-group">
          <div className="production-fare-total">
            <strong>Cruise Fare</strong>
            <strong>{inr(pricing.base_price)}</strong>
          </div>
          {passengers.map((passenger, index) => {
            const type = String(passenger.type || "Passenger").toUpperCase();
            const count = (passengerCounts.get(type) || 0) + 1;
            passengerCounts.set(type, count);
            const label =
              type === "ADULT"
                ? "Adult"
                : type === "CHILD"
                  ? "Child"
                  : type === "INFANT"
                    ? "Infant"
                    : "Passenger";

            return (
              <div className="production-fare-passenger" key={`${type}-${index}`}>
                <span>
                  {label} {count}
                </span>
                <span>{inr(passenger.fare)}</span>
              </div>
            );
          })}
        </div>

        <div><span>Port Charges</span><strong>{inr(pricing.port_charges)}</strong></div>
        <div><span>Gratuity</span><strong>{inr(pricing.gratuity)}</strong></div>
        <div><span>Fuel Surcharge</span><strong>{inr(pricing.fuel_surcharge)}</strong></div>
        <div><span>GST (18%)</span><strong>{inr(pricing.gross_tax)}</strong></div>
        <div className="production-fare-grand-total">
          <span>Gross Total</span>
          <strong>{inr(pricing.gross_price)}</strong>
        </div>
      </div>

      <details className="production-policy" open>
        <summary>Rescheduling Fee</summary>
        <ul>
          {reschedulingPolicy.map((policy) => <li key={policy}>{policy}</li>)}
        </ul>
      </details>

      <details className="production-policy" open>
        <summary>CANCELLATION FEE</summary>
        <ul>
          {cancellationPolicy.map((policy) => <li key={policy}>{policy}</li>)}
        </ul>
      </details>
    </section>
  );
}

export default function ProductionTestClient({
  integrations,
}: {
  integrations: Integration[];
}) {
  const [integrationId, setIntegrationId] = useState(integrations[0]?.id || 0);
  const [form, setForm] = useState({
    itinerary: "",
    roomType: "",
    priceType: "",
    adults: "1",
    children: "0",
    infants: "0",
    offerId: "",
  });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function run(testType: TestType) {
    setBusy(testType);
    setError("");
    setResult(null);
    try {
      const response = await fetch(
        "/api/adminmaster/direct-booking/production-test",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ integrationId, testType, ...form }),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Production test failed");
      }
      setResult(data.result || {});
    } catch (testError) {
      setError(
        testError instanceof Error ? testError.message : "Production test failed",
      );
    } finally {
      setBusy("");
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="production-test">
      <div className="production-test-warning">
        <strong>Read-only Production diagnostics</strong>
        <p>
          This page can authenticate, read the wallet, check availability and
          fetch pricing. It cannot create a booking or debit the wallet.
        </p>
      </div>

      <label className="production-test-integration">
        <span>Production integration *</span>
        <select
          onChange={(event) => setIntegrationId(Number(event.target.value))}
          value={integrationId}
        >
          {integrations.map((integration) => (
            <option key={integration.id} value={integration.id}>
              {integration.label}
            </option>
          ))}
        </select>
      </label>

      <div className="direct-booking-test-actions">
        <button disabled={Boolean(busy)} onClick={() => run("authentication")} type="button">
          {busy === "authentication" ? "Testing..." : "Test authentication"}
        </button>
        <button disabled={Boolean(busy)} onClick={() => run("wallet")} type="button">
          {busy === "wallet" ? "Checking..." : "Check wallet"}
        </button>
      </div>

      <div className="production-test-grid">
        <label className="production-test-wide">
          <span>Production itinerary ID *</span>
          <input onChange={(event) => update("itinerary", event.target.value)} value={form.itinerary} />
        </label>
        <label><span>Room type *</span><input onChange={(event) => update("roomType", event.target.value)} value={form.roomType} /></label>
        <label><span>Price type</span><input onChange={(event) => update("priceType", event.target.value)} placeholder="Optional" value={form.priceType} /></label>
        <label><span>Adults *</span><input min="0" onChange={(event) => update("adults", event.target.value)} type="number" value={form.adults} /></label>
        <label><span>Children</span><input min="0" onChange={(event) => update("children", event.target.value)} type="number" value={form.children} /></label>
        <label><span>Infants</span><input min="0" onChange={(event) => update("infants", event.target.value)} type="number" value={form.infants} /></label>
        <label><span>Offer ID</span><input onChange={(event) => update("offerId", event.target.value)} placeholder="Optional" value={form.offerId} /></label>
      </div>

      <div className="direct-booking-test-actions">
        <button disabled={Boolean(busy) || !form.itinerary} onClick={() => run("availability")} type="button">
          {busy === "availability" ? "Checking..." : "Check availability"}
        </button>
        <button disabled={Boolean(busy) || !form.itinerary || !form.roomType} onClick={() => run("pricing")} type="button">
          {busy === "pricing" ? "Testing..." : "Test pricing"}
        </button>
      </div>

      {error ? <p className="email-config-message error">{error}</p> : null}
      {result ? (
        <>
          <div className="direct-booking-test-result">
            <strong>Production response</strong>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
          {"gross_price" in result && "rooms" in result ? (
            <FareSummary pricing={result as PricingResponse} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
