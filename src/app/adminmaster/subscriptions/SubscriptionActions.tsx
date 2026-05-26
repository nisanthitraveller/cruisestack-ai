"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubscriptionActionsProps = {
  billingCycle: string | null;
  companyStatus: number;
  subscriptionId: number;
  subscriptionStatus: number;
};

export default function SubscriptionActions({
  billingCycle,
  companyStatus,
  subscriptionId,
  subscriptionStatus,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [selectedCycle, setSelectedCycle] = useState(
    billingCycle === "yearly" ? "yearly" : "monthly",
  );
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const isActive = Number(companyStatus) === 1 && Number(subscriptionStatus) === 1;

  async function runAction(action: "activate" | "block" | "update_cycle") {
    setBusyAction(action);

    try {
      const response = await fetch("/api/adminmaster/subscriptions", {
        body: JSON.stringify({
          action,
          billingCycle: selectedCycle,
          subscriptionId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to update subscription");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update subscription");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="adminmaster-actions">
      <div className="adminmaster-action-row">
        <button
          className="adminmaster-button activate"
          disabled={busyAction !== null || isActive}
          onClick={() => runAction("activate")}
          type="button"
        >
          {busyAction === "activate" ? "Saving..." : "Activate"}
        </button>
        <button
          className="adminmaster-button block"
          disabled={busyAction !== null || !isActive}
          onClick={() => runAction("block")}
          type="button"
        >
          {busyAction === "block" ? "Saving..." : "Block"}
        </button>
      </div>

      <div className="adminmaster-action-row">
        <select
          className="adminmaster-select"
          disabled={busyAction !== null}
          onChange={(event) => setSelectedCycle(event.target.value)}
          value={selectedCycle}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button
          className="adminmaster-button update"
          disabled={busyAction !== null}
          onClick={() => runAction("update_cycle")}
          type="button"
        >
          {busyAction === "update_cycle" ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}
