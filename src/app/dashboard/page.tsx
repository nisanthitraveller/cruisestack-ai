import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AGENT_SESSION_COOKIE,
  getDashboardData,
  verifyAgentSessionToken,
} from "@/lib/agentAuth";

function formatDate(value: string | Date | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number | string | null, currency = "USD") {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number | string | null) {
  if (value === null || value === undefined) return "0%";

  return `${Number(value).toFixed(2)}%`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = verifyAgentSessionToken(
    cookieStore.get(AGENT_SESSION_COOKIE)?.value
  );

  if (!session) {
    redirect("/login");
  }

  const dashboard = await getDashboardData(session);

  if (!dashboard) {
    redirect("/login");
  }

  const billingHistory = Array.isArray(dashboard.billingHistory)
    ? (dashboard.billingHistory as Array<Record<string, string | number | null>>)
    : [];
  const commissionRows = Array.isArray(dashboard.commissionRows)
    ? (dashboard.commissionRows as Array<Record<string, string | number | null>>)
    : [];
  const subscription = dashboard.subscription;
  const commissionSummary = dashboard.commissionSummary;

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div>
          <p className="panel-kicker">CruiseStack AI</p>
          <h1>{dashboard.company.company_name}</h1>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard sections">
          <span className="active">Dashboard</span>
          <span>Subscription</span>
          <span>Commissions</span>
          <span>Billing</span>
        </nav>

        <form action="/api/agent/logout" method="post">
          <button className="secondary-button" type="submit">
            Log out
          </button>
        </form>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">Logged in as {dashboard.agent.type || "Agent"}</p>
            <h2>{dashboard.agent.name}</h2>
          </div>
          <span className="status-pill">{subscription?.payment_status || "Pending"}</span>
        </header>

        <section className="metric-grid" aria-label="Subscription summary">
          <article className="metric-card">
            <span>Plan</span>
            <strong>{subscription?.plan_name || dashboard.company.plan_type || "Not selected"}</strong>
          </article>

          <article className="metric-card">
            <span>Subscription status</span>
            <strong>{subscription?.stripe_status || "Waiting for Stripe"}</strong>
          </article>

          <article className="metric-card">
            <span>Current period</span>
            <strong>
              {formatDate(subscription?.current_period_start || null)} -{" "}
              {formatDate(subscription?.current_period_end || null)}
            </strong>
          </article>

          <article className="metric-card">
            <span>Commission rows</span>
            <strong>{Number(commissionSummary?.total_rows || 0)}</strong>
          </article>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">Subscription</p>
              <h3>Billing setup</h3>
            </div>
          </div>

          <div className="detail-grid">
            <div>
              <span>Booking fee</span>
              <strong>{formatMoney(subscription?.booking_fee || 0, dashboard.company.currency)}</strong>
            </div>
            <div>
              <span>Trip summary fee</span>
              <strong>{formatMoney(subscription?.trip_summary_fee || 0, dashboard.company.currency)}</strong>
            </div>
            <div>
              <span>API scan fee</span>
              <strong>{formatMoney(subscription?.api_scan_fee || 0, dashboard.company.currency)}</strong>
            </div>
            <div>
              <span>Cancel at period end</span>
              <strong>{subscription?.cancel_at_period_end ? "Yes" : "No"}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">Commission</p>
              <h3>Loaded from agent commission table</h3>
            </div>
            <div className="summary-chips">
              <span>Avg commission {formatPercent(commissionSummary?.average_commission || 0)}</span>
              <span>Avg markup {formatPercent(commissionSummary?.average_markup || 0)}</span>
            </div>
          </div>

          <div className="dashboard-table">
            <div className="table-row header">
              <span>Cruiseline</span>
              <span>Commission</span>
              <span>Discount</span>
              <span>Markup</span>
              <span>GMC discount</span>
            </div>

            {commissionRows.length > 0 ? (
              commissionRows.map((row) => (
                <div className="table-row" key={String(row.cruiseline_id)}>
                  <span>{row.cruiseline_id}</span>
                  <span>{formatPercent(row.commission)}</span>
                  <span>{formatPercent(row.discount)}</span>
                  <span>{formatPercent(row.markup)}</span>
                  <span>{formatPercent(row.gmc_discount)}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">Commission data is still waiting for the webhook.</div>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">Billing</p>
              <h3>Recent invoices</h3>
            </div>
          </div>

          <div className="dashboard-table billing-table">
            <div className="table-row header">
              <span>Invoice</span>
              <span>Month</span>
              <span>Total</span>
              <span>Status</span>
              <span>Paid</span>
            </div>

            {billingHistory.length > 0 ? (
              billingHistory.map((invoice) => (
                <div className="table-row" key={String(invoice.invoice_no)}>
                  <span>{invoice.invoice_no}</span>
                  <span>{invoice.billing_month}</span>
                  <span>{formatMoney(invoice.total_amount, dashboard.company.currency)}</span>
                  <span>{invoice.payment_status}</span>
                  <span>{formatDate(String(invoice.paid_at || ""))}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No invoices have been received yet.</div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
