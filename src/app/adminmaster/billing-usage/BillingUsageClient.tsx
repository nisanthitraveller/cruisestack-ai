"use client";

import { useMemo, useState } from "react";

export type BillingUsageRow = {
  billing_metric: string;
  billing_period_end: string;
  billing_period_start: string;
  booking_amount: number | string;
  booking_count: number;
  booking_fee: number | string;
  company_name: string;
  created_at: string;
  id: number;
  processed_at: string | null;
  slug: string;
  stripe_invoice_id: string;
  stripe_invoice_item_id: string | null;
  trip_summary_amount: number | string;
  trip_summary_count: number;
  trip_summary_fee: number | string;
};

function formatDate(value: string | null) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value || 0));
}

export default function BillingUsageClient({ usage }: { usage: BillingUsageRow[] }) {
  const [query, setQuery] = useState("");

  const visibleUsage = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return usage;

    return usage.filter((row) =>
      [row.company_name, row.slug, row.stripe_invoice_id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [usage, query]);

  return (
    <section className="adminmaster-panel companies-panel">
      <div className="adminmaster-panel-header companies-toolbar">
        <div>
          <h2>Billing usage history</h2>
          <span>
            Showing {visibleUsage.length} of {usage.length}
          </span>
        </div>
        <div className="companies-filters">
          <input
            aria-label="Search billing usage"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, slug or invoice"
            type="search"
            value={query}
          />
        </div>
      </div>

      {visibleUsage.length ? (
        <div className="adminmaster-table-wrap">
          <table className="adminmaster-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Billing period</th>
                <th>Metric</th>
                <th>Count</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Invoice</th>
                <th>Processed</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsage.map((row) => {
                const isTripSummary = row.billing_metric === "trip_summary_count";
                const count = isTripSummary ? row.trip_summary_count : row.booking_count;
                const fee = isTripSummary ? row.trip_summary_fee : row.booking_fee;
                const amount = isTripSummary ? row.trip_summary_amount : row.booking_amount;

                return (
                  <tr key={row.id}>
                    <td>
                      <div className="adminmaster-company">
                        <strong>{row.company_name}</strong>
                        <span>{row.slug}</span>
                      </div>
                    </td>
                    <td>
                      {formatDate(row.billing_period_start)} - {formatDate(row.billing_period_end)}
                    </td>
                    <td>
                      <span className="adminmaster-pill neutral">
                        {isTripSummary ? "Trip summary" : "Booking"}
                      </span>
                    </td>
                    <td>{count}</td>
                    <td>{formatMoney(fee)}</td>
                    <td>{formatMoney(amount)}</td>
                    <td>{row.stripe_invoice_id}</td>
                    <td>
                      <span className={`adminmaster-pill ${row.processed_at ? "active" : "blocked"}`}>
                        {row.processed_at ? formatDate(row.processed_at) : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adminmaster-empty">No billing usage recorded yet.</div>
      )}
    </section>
  );
}
