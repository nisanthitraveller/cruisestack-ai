"use client";

import { useState } from "react";

type Inspection = {
  bookingReference: string;
  outstandingAmount: number | null;
  balanceCandidates: Array<{ path: string; amount: number }>;
  walletBalance: number | null;
  booking: Record<string, unknown>;
  priorAttempt: Record<string, unknown> | null;
  inspectionToken: string | null;
  expiresAt: string;
};

export default function BalancePaymentTestClient({
  agentId: suppliedAgentId = "",
  agentKey: suppliedAgentKey = "",
  showCredentials = true,
}: {
  agentId?: string;
  agentKey?: string;
  showCredentials?: boolean;
}) {
  const [enteredAgentId, setEnteredAgentId] = useState("");
  const [enteredAgentKey, setEnteredAgentKey] = useState("");
  const agentId = suppliedAgentId || enteredAgentId;
  const agentKey = suppliedAgentKey || enteredAgentKey;
  const [bookingReference, setBookingReference] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function callApi(body: Record<string, unknown>) {
    const response = await fetch(
      "/api/adminmaster/direct-booking/balance-payment-test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, agentKey, ...body }),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "UAT balance test failed");
    return data.result;
  }

  async function inspectBooking(event: React.FormEvent) {
    event.preventDefault();
    setBusy("inspect");
    setError("");
    setResult(null);
    setInspection(null);
    try {
      setInspection(
        await callApi({ action: "inspect", bookingReference: bookingReference.trim() }),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Inspection failed");
    } finally {
      setBusy("");
    }
  }

  async function repayBalance() {
    if (!inspection?.inspectionToken) return;
    setBusy("repay");
    setError("");
    try {
      const response = await callApi({
        action: "repay",
        inspectionToken: inspection.inspectionToken,
        confirmation,
      });
      setResult(response);
      setInspection(null);
      setConfirmation("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Payment failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="isolated-booking-test">
      <div className="isolated-booking-warning">
        <strong>UAT supplier-wallet debit</strong>
        <p>
          This isolated tool calls Cordelia’s documented repay_due_amount API.
          It does not collect a customer payment and it does not modify the
          Thomas Cook production payment flow. Never retry a timeout.
        </p>
      </div>

      <form className="isolated-booking-form" onSubmit={inspectBooking}>
        {showCredentials ? (
          <>
            <label>
              <span>UAT Agent ID *</span>
              <input
                autoComplete="off"
                onChange={(event) => setEnteredAgentId(event.target.value)}
                required
                value={enteredAgentId}
              />
            </label>
            <label>
              <span>UAT Agent Key *</span>
              <input
                autoComplete="new-password"
                onChange={(event) => setEnteredAgentKey(event.target.value)}
                required
                type="password"
                value={enteredAgentKey}
              />
            </label>
          </>
        ) : null}
        <label>
          <span>Cordelia booking reference *</span>
          <input
            onChange={(event) => setBookingReference(event.target.value)}
            placeholder="C-XXXXXXXXXX"
            required
            value={bookingReference}
          />
        </label>
        <button disabled={Boolean(busy) || !agentId || !agentKey} type="submit">
          {busy === "inspect" ? "Retrieving..." : "Retrieve current balance"}
        </button>
      </form>

      {error ? <div className="adminmaster-error">{error}</div> : null}

      {inspection ? (
        <section className="isolated-booking-confirm">
          <div className="isolated-booking-price">
            <span>Booking <strong>{inspection.bookingReference}</strong></span>
            <span>
              Customer outstanding balance{" "}
              <strong>
                {inspection.outstandingAmount == null
                  ? "Not identified"
                  : `₹${inspection.outstandingAmount}`}
              </strong>
            </span>
            <span>
              Agency wallet balance{" "}
              <strong>
                {inspection.walletBalance == null
                  ? "Unavailable"
                  : `₹${inspection.walletBalance}`}
              </strong>
            </span>
          </div>

          {inspection.balanceCandidates.length > 1 ? (
            <div className="direct-booking-test-result">
              <strong>Balance fields returned by Cordelia</strong>
              <pre>{JSON.stringify(inspection.balanceCandidates, null, 2)}</pre>
            </div>
          ) : null}

          {inspection.priorAttempt ? (
            <div className="adminmaster-error">
              An earlier UAT repayment attempt exists. A second debit is blocked.
            </div>
          ) : null}

          <label className="isolated-booking-confirmation">
            <span>Type PAY UAT BALANCE to debit the UAT wallet *</span>
            <input
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
          <button
            className="isolated-booking-create"
            disabled={
              Boolean(busy) ||
              confirmation !== "PAY UAT BALANCE" ||
              !inspection.inspectionToken ||
              inspection.outstandingAmount == null ||
              inspection.outstandingAmount <= 0 ||
              Boolean(inspection.priorAttempt)
            }
            onClick={repayBalance}
            type="button"
          >
            {busy === "repay" ? "Paying and reconciling..." : "Pay UAT balance"}
          </button>

          <details className="direct-booking-test-result">
            <summary>Redacted Cordelia booking response</summary>
            <pre>{JSON.stringify(inspection.booking, null, 2)}</pre>
          </details>
        </section>
      ) : null}

      {result ? (
        <section className="direct-booking-test-result">
          <strong>Repayment and reconciliation result</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  );
}
