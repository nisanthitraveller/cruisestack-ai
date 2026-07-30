"use client";

import { useState } from "react";

type Integration = { id: number; label: string };
type TestType = "authentication" | "wallet" | "availability" | "pricing";

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
        <div className="direct-booking-test-result">
          <strong>Production response</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
