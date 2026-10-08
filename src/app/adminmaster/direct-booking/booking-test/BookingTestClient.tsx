"use client";

import { useState } from "react";
import BalancePaymentTestClient from "../balance-payment-test/BalancePaymentTestClient";

type Prepared = {
  preparationToken: string;
  expiresAt: string;
  itinerary: string;
  roomType: string;
  totalPrice: number;
  partialPayableAmount: number | null;
  partialPaymentAvailable: boolean;
  paymentOptionId: string | null;
  dueDate: string | null;
};

const initialGuest = {
  firstName: "",
  lastName: "",
  gender: "Male",
  dob: "",
  mealType: "Vegetarian",
  country: "India",
  state: "",
  phoneNumber: "",
  email: "",
  panNumber: "",
  gstin: "",
  usePartialPayment: false,
  confirmation: "",
};

export default function BookingTestClient() {
  const [agentId, setAgentId] = useState("");
  const [agentKey, setAgentKey] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [roomType, setRoomType] = useState("");
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [guest, setGuest] = useState(initialGuest);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [diagnostic, setDiagnostic] = useState<Record<string, unknown> | null>(null);

  async function callApi(body: Record<string, unknown>) {
    const response = await fetch(
      "/api/adminmaster/direct-booking/booking-test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, agentKey, ...body }),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Booking Test failed");
    return data.result;
  }

  async function prepare(event: React.FormEvent) {
    event.preventDefault();
    setBusy("prepare");
    setError("");
    setResult(null);
    setPrepared(null);
    try {
      setPrepared(await callApi({ action: "prepare", itinerary, roomType }));
    } catch (prepareError) {
      setError(
        prepareError instanceof Error ? prepareError.message : "Unable to prepare",
      );
    } finally {
      setBusy("");
    }
  }

  async function runDiagnostic(action: "connection" | "wallet") {
    setBusy(action);
    setError("");
    setDiagnostic(null);
    try {
      setDiagnostic(await callApi({ action }));
    } catch (diagnosticError) {
      setError(
        diagnosticError instanceof Error
          ? diagnosticError.message
          : "Diagnostic failed",
      );
    } finally {
      setBusy("");
    }
  }

  async function confirm() {
    if (!prepared) return;
    setBusy("confirm");
    setError("");
    try {
      const booking = await callApi({
        action: "confirm",
        preparationToken: prepared.preparationToken,
        ...guest,
      });
      setResult(booking);
      setPrepared(null);
      setGuest(initialGuest);
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to create UAT booking",
      );
    } finally {
      setBusy("");
    }
  }

  function updateGuest(key: keyof typeof guest, value: string | boolean) {
    setGuest((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="isolated-booking-test">
      <section className="direct-booking-diagnostics">
        <div className="direct-booking-diagnostics-heading">
          <div>
            <h3>UAT diagnostics</h3>
            <p>These tests do not create a booking or debit the supplier wallet.</p>
          </div>
          <span className="uat">UAT</span>
        </div>
        <div className="isolated-booking-grid">
          <label>
            <span>UAT Agent ID *</span>
            <input
              autoComplete="off"
              onChange={(event) => setAgentId(event.target.value)}
              required
              value={agentId}
            />
          </label>
          <label>
            <span>UAT Agent Key *</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setAgentKey(event.target.value)}
              required
              type="password"
              value={agentKey}
            />
          </label>
        </div>
        <div className="direct-booking-test-actions">
          <button
            disabled={Boolean(busy) || !agentId || !agentKey}
            onClick={() => runDiagnostic("connection")}
            type="button"
          >
            {busy === "connection" ? "Testing..." : "Test Cordelia connection"}
          </button>
          <button
            disabled={Boolean(busy) || !agentId || !agentKey}
            onClick={() => runDiagnostic("wallet")}
            type="button"
          >
            {busy === "wallet" ? "Checking..." : "Check agency wallet"}
          </button>
        </div>
        {diagnostic ? (
          <div className="direct-booking-test-result">
            <pre>{JSON.stringify(diagnostic, null, 2)}</pre>
          </div>
        ) : null}
      </section>

      <section className="direct-booking-diagnostics">
        <div className="direct-booking-diagnostics-heading">
          <div>
            <h3>Availability and pricing test</h3>
            <p>
              Reprice one adult and display Cordelia’s live UAT price,
              payment option, partial amount, and due date. This does not
              create a booking or debit the wallet.
            </p>
          </div>
          <span className="uat">UAT</span>
        </div>
        <form className="isolated-booking-form" onSubmit={prepare}>
          <label>
            <span>Itinerary ID *</span>
            <input
              onChange={(event) => setItinerary(event.target.value)}
              required
              value={itinerary}
            />
          </label>
          <label>
            <span>Room type *</span>
            <input
              onChange={(event) => setRoomType(event.target.value)}
              placeholder="PENTHOUSEBALCONY2"
              required
              value={roomType}
            />
          </label>
          <button disabled={Boolean(busy) || !agentId || !agentKey} type="submit">
            {busy === "prepare" ? "Testing..." : "Test availability and pricing"}
          </button>
        </form>
      </section>

      {prepared ? (
        <section className="isolated-booking-confirm">
          <div className="isolated-booking-warning">
            <strong>Cordelia UAT Booking Test</strong>
            <p>
              The availability test is complete. The action below creates a
              real UAT booking and may debit the UAT supplier wallet. Cordelia
              does not provide an idempotency key, so never retry a timed-out
              booking request.
            </p>
          </div>
          <div className="isolated-booking-price">
            <span>Room <strong>{prepared.roomType}</strong></span>
            <span>Full amount <strong>₹{prepared.totalPrice}</strong></span>
            <span>
              Partial amount{" "}
              <strong>
                {prepared.partialPayableAmount == null
                  ? "Not available"
                  : `₹${prepared.partialPayableAmount}`}
              </strong>
            </span>
            <span>
              Payment option <strong>{prepared.paymentOptionId || "Not returned"}</strong>
            </span>
            <span>
              Supplier due date <strong>{prepared.dueDate || "Not returned"}</strong>
            </span>
            <span>
              Valid until{" "}
              <strong>{new Date(prepared.expiresAt).toLocaleTimeString()}</strong>
            </span>
          </div>

          <div className="isolated-booking-grid">
            <label><span>First name *</span><input onChange={(e) => updateGuest("firstName", e.target.value)} value={guest.firstName} /></label>
            <label><span>Last name *</span><input onChange={(e) => updateGuest("lastName", e.target.value)} value={guest.lastName} /></label>
            <label><span>Gender *</span><select onChange={(e) => updateGuest("gender", e.target.value)} value={guest.gender}><option>Male</option><option>Female</option></select></label>
            <label><span>Date of birth (DD/MM/YYYY) *</span><input onChange={(e) => updateGuest("dob", e.target.value)} placeholder="01/01/1990" value={guest.dob} /></label>
            <label><span>Meal type *</span><select onChange={(e) => updateGuest("mealType", e.target.value)} value={guest.mealType}><option>Vegetarian</option><option>Non - Vegetarian</option><option>Jain</option></select></label>
            <label><span>Country *</span><input onChange={(e) => updateGuest("country", e.target.value)} value={guest.country} /></label>
            <label><span>State *</span><input onChange={(e) => updateGuest("state", e.target.value)} value={guest.state} /></label>
            <label><span>Phone with country code *</span><input onChange={(e) => updateGuest("phoneNumber", e.target.value)} value={guest.phoneNumber} /></label>
            <label><span>Email *</span><input onChange={(e) => updateGuest("email", e.target.value)} type="email" value={guest.email} /></label>
            <label><span>PAN number</span><input onChange={(e) => updateGuest("panNumber", e.target.value.toUpperCase())} value={guest.panNumber} /></label>
            <label><span>GSTIN</span><input onChange={(e) => updateGuest("gstin", e.target.value.toUpperCase())} value={guest.gstin} /></label>
          </div>

          {prepared.partialPaymentAvailable ? (
            <label className="isolated-booking-check">
              <input checked={guest.usePartialPayment} onChange={(e) => updateGuest("usePartialPayment", e.target.checked)} type="checkbox" />
              Use Cordelia partial-payment option
            </label>
          ) : null}

          <label className="isolated-booking-confirmation">
            <span>Type <strong>CREATE UAT BOOKING</strong> to confirm *</span>
            <input onChange={(e) => updateGuest("confirmation", e.target.value)} value={guest.confirmation} />
          </label>
          <button
            className="isolated-booking-create"
            disabled={Boolean(busy) || guest.confirmation !== "CREATE UAT BOOKING"}
            onClick={confirm}
            type="button"
          >
            {busy === "confirm"
              ? "Creating booking — do not retry..."
              : "Create UAT booking and debit wallet"}
          </button>
        </section>
      ) : null}

      {error ? <p className="email-config-message error">{error}</p> : null}
      {result ? (
        <div className="direct-booking-test-result">
          <strong>UAT booking confirmed</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}

      <section className="isolated-booking-confirm">
        <h3>Existing booking balance and second installment</h3>
        <p>
          Retrieve the live booking balance, keep it separate from the agency
          wallet, and test Cordelia repay_due_amount against the same booking.
        </p>
        <BalancePaymentTestClient
          agentId={agentId}
          agentKey={agentKey}
          showCredentials={false}
        />
      </section>
    </div>
  );
}
