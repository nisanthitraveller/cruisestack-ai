"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type SubscriptionPlanRow = {
  api_scan_fee: number | string | null;
  booking_fee: number | string | null;
  id: number;
  monthly_booking_limit: number | null;
  plan_name: string;
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

  return (
    <section className="adminmaster-panel companies-panel">
      <div className="adminmaster-panel-header">
        <div>
          <h2>All plans</h2>
          <span>{plans.length} plans</span>
        </div>
      </div>

      {plans.length ? (
        <div className="adminmaster-table-wrap">
          <table className="adminmaster-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Booking fee</th>
                <th>Monthly booking limit</th>
                <th>Trip summary fee</th>
                <th>API scan fee</th>
                <th>Stripe price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong>{plan.plan_name}</strong>
                  </td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adminmaster-empty">No subscription plans found.</div>
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
    </section>
  );
}
