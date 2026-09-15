"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type SubscriptionPlanRow = {
  api_scan_fee: number | string | null;
  booking_fee: number | string | null;
  id: number;
  monthly_booking_limit: number | null;
  monthly_fee: number | string | null;
  plan_name: string;
  status: number | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  trip_summary_fee: number | string | null;
};

type PlanForm = {
  api_scan_fee: string;
  booking_fee: string;
  monthly_booking_limit: string;
  stripe_price_id: string;
  stripe_product_id: string;
  trip_summary_fee: string;
};

type NewPlanForm = {
  apiScanFee: string;
  bookingFee: string;
  monthlyBookingLimit: string;
  monthlyPrice: string;
  planName: string;
  tripSummaryFee: string;
};

const emptyNewPlanForm: NewPlanForm = {
  apiScanFee: "0",
  bookingFee: "0",
  monthlyBookingLimit: "0",
  monthlyPrice: "",
  planName: "",
  tripSummaryFee: "0",
};

function formFromPlan(plan: SubscriptionPlanRow): PlanForm {
  return {
    api_scan_fee: String(plan.api_scan_fee ?? "0"),
    booking_fee: String(plan.booking_fee ?? "0"),
    monthly_booking_limit: String(plan.monthly_booking_limit ?? "0"),
    stripe_price_id: plan.stripe_price_id || "",
    stripe_product_id: plan.stripe_product_id || "",
    trip_summary_fee: String(plan.trip_summary_fee ?? "0"),
  };
}

function formatMoney(value: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value || 0));
}

async function postPlanUpdate(body: Record<string, unknown>) {
  const response = await fetch("/api/adminmaster/subscription-plans", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to update plan");
  }

  return data;
}

export default function SubscriptionPlansClient({ plans }: { plans: SubscriptionPlanRow[] }) {
  const router = useRouter();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanRow | null>(null);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [creatingStripePriceFor, setCreatingStripePriceFor] = useState<number | null>(null);
  const [deactivatingPlanId, setDeactivatingPlanId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [newPlanForm, setNewPlanForm] = useState<NewPlanForm | null>(null);
  const visiblePlans = plans.filter((plan) =>
    activeTab === "active" ? Number(plan.status) === 1 : Number(plan.status) !== 1,
  );

  function openEdit(plan: SubscriptionPlanRow) {
    setEditingPlan(plan);
    setForm(formFromPlan(plan));
  }

  function closeEdit() {
    if (busy) return;
    setEditingPlan(null);
    setForm(null);
  }

  function updateField(field: keyof PlanForm, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPlan || !form) return;

    setBusy(true);

    try {
      await postPlanUpdate({
        action: "update",
        planId: editingPlan.id,
        ...form,
      });

      setEditingPlan(null);
      setForm(null);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update plan");
    } finally {
      setBusy(false);
    }
  }

  async function createStripePrice(plan: SubscriptionPlanRow) {
    const suggestedPrice = plan.plan_name === "Professional" ? "799" : plan.plan_name === "Enterprise" ? "1299" : String(plan.monthly_fee ?? "");
    const enteredPrice = window.prompt(
      `Enter the new monthly price in USD for ${plan.plan_name}`,
      suggestedPrice,
    );

    if (enteredPrice === null) return;

    const monthlyPrice = Number(enteredPrice);
    if (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0) {
      window.alert("Enter a valid monthly price greater than zero");
      return;
    }

    if (!window.confirm(`Create a new Stripe price of $${monthlyPrice}/month for ${plan.plan_name}? The current plan and Stripe price will be made inactive for new sales.`)) {
      return;
    }

    setCreatingStripePriceFor(plan.id);

    try {
      const result = await postPlanUpdate({
        action: "create_stripe_price",
        monthlyPrice,
        planId: plan.id,
      });
      window.alert(
        `${plan.plan_name} is now $${monthlyPrice}/month. New Stripe price: ${result.stripePriceId}`,
      );
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to create Stripe price");
    } finally {
      setCreatingStripePriceFor(null);
    }
  }

  async function deactivatePlan(plan: SubscriptionPlanRow) {
    if (!window.confirm(`Make the current ${plan.plan_name} plan inactive? It will no longer be available for new subscriptions. Existing subscriptions will not be changed.`)) {
      return;
    }

    setDeactivatingPlanId(plan.id);

    try {
      const result = await postPlanUpdate({
        action: "deactivate",
        planId: plan.id,
      });
      window.alert(
        result.stripePriceArchived === false
          ? `${plan.plan_name} was made inactive in CruiseStack, but its Stripe price could not be archived. Please check Stripe.`
          : `${plan.plan_name} was made inactive successfully.`,
      );
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to deactivate plan");
    } finally {
      setDeactivatingPlanId(null);
    }
  }

  function updateNewPlanField(field: keyof NewPlanForm, value: string) {
    setNewPlanForm((current) => current ? { ...current, [field]: value } : current);
  }

  async function addPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPlanForm) return;

    setBusy(true);
    try {
      const result = await postPlanUpdate({
        action: "create_plan",
        ...newPlanForm,
      });
      window.alert(
        `${newPlanForm.planName} was created in CruiseStack and Stripe. Price ID: ${result.stripePriceId}`,
      );
      setNewPlanForm(null);
      setActiveTab("active");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to create plan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="adminmaster-panel companies-panel">
      <div className="adminmaster-panel-header">
        <div>
          <h2>{activeTab === "active" ? "Active plans" : "Inactive plans"}</h2>
          <span>{visiblePlans.length} plans</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="adminmaster-button update"
            onClick={() => setNewPlanForm({ ...emptyNewPlanForm })}
            type="button"
          >
            Add New Plan
          </button>
          <button
            className={activeTab === "active" ? "adminmaster-button update" : "adminmaster-refresh"}
            onClick={() => setActiveTab("active")}
            type="button"
          >
            Active ({plans.filter((plan) => Number(plan.status) === 1).length})
          </button>
          <button
            className={activeTab === "inactive" ? "adminmaster-button update" : "adminmaster-refresh"}
            onClick={() => setActiveTab("inactive")}
            type="button"
          >
            Inactive ({plans.filter((plan) => Number(plan.status) !== 1).length})
          </button>
        </div>
      </div>

      {visiblePlans.length ? (
        <div className="adminmaster-table-wrap">
          <table className="adminmaster-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Status</th>
                <th>Monthly price</th>
                <th>Booking fee</th>
                <th>Monthly booking limit</th>
                <th>Trip summary fee</th>
                <th>API scan fee</th>
                <th>Stripe price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong>{plan.plan_name}</strong>
                  </td>
                  <td>{Number(plan.status) === 1 ? "Active" : "Inactive"}</td>
                  <td>{formatMoney(plan.monthly_fee)}</td>
                  <td>{formatMoney(plan.booking_fee)}</td>
                  <td>{plan.monthly_booking_limit ?? "Not set"}</td>
                  <td>{formatMoney(plan.trip_summary_fee)}</td>
                  <td>{formatMoney(plan.api_scan_fee)}</td>
                  <td>{plan.stripe_price_id || "Not set"}</td>
                  <td>
                    <button
                      className="adminmaster-button update"
                      disabled={busy}
                      onClick={() => openEdit(plan)}
                      type="button"
                    >
                      Edit
                    </button>
                    {Number(plan.status) === 1 && (plan.plan_name === "Professional" || plan.plan_name === "Enterprise") ? (
                      <>
                        <button
                          className="adminmaster-button update"
                          disabled={busy || creatingStripePriceFor !== null || deactivatingPlanId !== null}
                          onClick={() => createStripePrice(plan)}
                          type="button"
                        >
                          {creatingStripePriceFor === plan.id ? "Creating..." : "Create Stripe Price"}
                        </button>
                        <button
                          className="adminmaster-refresh"
                          disabled={busy || creatingStripePriceFor !== null || deactivatingPlanId !== null}
                          onClick={() => deactivatePlan(plan)}
                          type="button"
                        >
                          {deactivatingPlanId === plan.id ? "Making inactive..." : "Make Inactive"}
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adminmaster-empty">No {activeTab} subscription plans found.</div>
      )}

      {editingPlan && form ? (
        <div className="companies-modal-backdrop" onMouseDown={closeEdit} role="presentation">
          <section
            aria-labelledby="plan-edit-title"
            aria-modal="true"
            className="companies-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="companies-modal-header">
              <div>
                <p className="adminmaster-kicker">Plan pricing</p>
                <h2 id="plan-edit-title">Edit {editingPlan.plan_name}</h2>
              </div>
              <button aria-label="Close edit plan" disabled={busy} onClick={closeEdit} type="button">
                ×
              </button>
            </div>

            <form className="companies-edit-form" onSubmit={savePlan}>
              <label>
                <span>Booking fee (USD)</span>
                <input
                  min={0}
                  onChange={(event) => updateField("booking_fee", event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={form.booking_fee}
                />
              </label>
              <label>
                <span>Monthly booking limit</span>
                <input
                  min={0}
                  onChange={(event) => updateField("monthly_booking_limit", event.target.value)}
                  required
                  step="1"
                  type="number"
                  value={form.monthly_booking_limit}
                />
              </label>
              <label>
                <span>Trip summary fee (USD)</span>
                <input
                  min={0}
                  onChange={(event) => updateField("trip_summary_fee", event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={form.trip_summary_fee}
                />
              </label>
              <label>
                <span>API scan fee (USD)</span>
                <input
                  min={0}
                  onChange={(event) => updateField("api_scan_fee", event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={form.api_scan_fee}
                />
              </label>
              <label>
                <span>Stripe price ID</span>
                <input onChange={(event) => updateField("stripe_price_id", event.target.value)} value={form.stripe_price_id} />
              </label>
              <label>
                <span>Stripe product ID</span>
                <input onChange={(event) => updateField("stripe_product_id", event.target.value)} value={form.stripe_product_id} />
              </label>

              <div className="companies-modal-actions">
                <button className="adminmaster-refresh" disabled={busy} onClick={closeEdit} type="button">
                  Cancel
                </button>
                <button className="adminmaster-button update" disabled={busy} type="submit">
                  {busy ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {newPlanForm ? (
        <div
          className="companies-modal-backdrop"
          onMouseDown={() => !busy && setNewPlanForm(null)}
          role="presentation"
        >
          <section
            aria-labelledby="new-plan-title"
            aria-modal="true"
            className="companies-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="companies-modal-header">
              <div>
                <p className="adminmaster-kicker">Stripe subscription</p>
                <h2 id="new-plan-title">Add New Plan</h2>
              </div>
              <button
                aria-label="Close new plan"
                disabled={busy}
                onClick={() => setNewPlanForm(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <form className="companies-edit-form" onSubmit={addPlan}>
              <label>
                <span>Plan name</span>
                <input
                  maxLength={100}
                  onChange={(event) => updateNewPlanField("planName", event.target.value)}
                  required
                  value={newPlanForm.planName}
                />
              </label>
              <label>
                <span>Monthly subscription price (USD)</span>
                <input
                  min={0.01}
                  onChange={(event) => updateNewPlanField("monthlyPrice", event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={newPlanForm.monthlyPrice}
                />
              </label>
              <label>
                <span>Billing interval</span>
                <input disabled value="Monthly" />
              </label>
              <label>
                <span>Currency</span>
                <input disabled value="USD" />
              </label>
              <label>
                <span>Booking fee (USD)</span>
                <input min={0} onChange={(event) => updateNewPlanField("bookingFee", event.target.value)} required step="0.01" type="number" value={newPlanForm.bookingFee} />
              </label>
              <label>
                <span>Monthly booking limit</span>
                <input min={0} onChange={(event) => updateNewPlanField("monthlyBookingLimit", event.target.value)} required step="1" type="number" value={newPlanForm.monthlyBookingLimit} />
              </label>
              <label>
                <span>Trip summary fee (USD)</span>
                <input min={0} onChange={(event) => updateNewPlanField("tripSummaryFee", event.target.value)} required step="0.01" type="number" value={newPlanForm.tripSummaryFee} />
              </label>
              <label>
                <span>API scan fee (USD)</span>
                <input min={0} onChange={(event) => updateNewPlanField("apiScanFee", event.target.value)} required step="0.01" type="number" value={newPlanForm.apiScanFee} />
              </label>

              <div className="companies-modal-actions">
                <button className="adminmaster-refresh" disabled={busy} onClick={() => setNewPlanForm(null)} type="button">
                  Cancel
                </button>
                <button className="adminmaster-button update" disabled={busy} type="submit">
                  {busy ? "Creating in Stripe..." : "Create Plan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
