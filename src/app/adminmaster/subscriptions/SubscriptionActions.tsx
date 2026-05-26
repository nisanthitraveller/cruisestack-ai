"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubscriptionActionsProps = {
  allowBillingCycle?: boolean;
  billingCycle: string | null;
  companyName?: string | null;
  companyStatus: number;
  subscriptionId: number;
  subscriptionStatus: number;
};

export default function SubscriptionActions({
  allowBillingCycle = true,
  billingCycle,
  companyName,
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

  async function runAction(action: "activate" | "block" | "delete_user" | "update_cycle") {
    if (action === "delete_user") {
      const confirmed = window.confirm(
        `Delete ${companyName || "this user"} and all tenant tables? This cannot be undone.`,
      );

      if (!confirmed) return;
    }

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
          {busyAction === "block" ? "Saving..." : "Suspend"}
        </button>
      </div>

      {allowBillingCycle ? (
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
      ) : null}

      <button
        className="adminmaster-button delete"
        disabled={busyAction !== null}
        onClick={() => runAction("delete_user")}
        type="button"
      >
        {busyAction === "delete_user" ? "Deleting..." : "Delete user"}
      </button>
    </div>
  );
}
