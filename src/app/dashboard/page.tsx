import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAgentFromSession, getDashboardData } from "@/lib/agentAuth";
import DashboardActions from "./DashboardActions";
import cruiseNames from "@/data/cruises.json";
import '../style.css'; 

const cruiseNameMap = cruiseNames as Record<string, string>;
const PUBLIC_APP_ORIGIN = "https://cruisestack.ai";

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

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not available";

  return String(value);
}

function MaskedValue() {
  return (
    <span className="masked-value" aria-label="Hidden">
      ••••
    </span>
  );
}

function getCruiseLineName(cruiselineId: string | number | null) {
  const id = String(cruiselineId || "");

  return cruiseNameMap[id] || (id ? `Cruiseline ${id}` : "Unknown cruiseline");
}

type DashboardForWhitelabel = {
  agent: { token?: string | null };
  company: { slug?: string | null };
};

function agentWhitelabelUrl(
  agentDetails: Record<string, string | number | null>,
  dashboard: DashboardForWhitelabel,
) {
  const agentSlug = String(agentDetails?.agency_code || dashboard.company.slug || "");

  return `${PUBLIC_APP_ORIGIN}/agents/${encodeURIComponent(
    agentSlug,
  )}/whitelabel?token=${encodeURIComponent(String(dashboard.agent.token || ""))}`;
}

function agentPublicUrl(agentDetails: Record<string, string | number | null>, dashboard: DashboardForWhitelabel) {
  const agentSlug = String(agentDetails?.agency_code || dashboard.company.slug || "");

  return `${PUBLIC_APP_ORIGIN}/agents/${encodeURIComponent(agentSlug)}`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getAgentFromSession(cookieStore);

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
  const agentDetails = dashboard.agentDetails || dashboard.agent;
  const tripSummaryUrl = agentWhitelabelUrl(agentDetails, dashboard);
  const b2cUrl = agentPublicUrl(agentDetails, dashboard);

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div>
          <p className="panel-kicker">CruiseStack AI</p>
          <h1>{dashboard.company.company_name}</h1>
        </div>

        <DashboardActions b2bUrl={tripSummaryUrl} b2cUrl={b2cUrl} />

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

        <section className="dashboard-section" id="subscription">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">Company</p>
              <h3>Workspace information</h3>
            </div>
          </div>

          <div className="detail-grid profile-grid">
            <div>
              <span>Company name</span>
              <strong>{formatValue(dashboard.company.company_name)}</strong>
            </div>
            <div>
              <span>Slug</span>
              <strong>{formatValue(dashboard.company.slug)}</strong>
            </div>
            <div>
              <span>Support email</span>
              <strong>{formatValue(dashboard.company.support_email)}</strong>
            </div>
            <div>
              <span>Currency</span>
              <strong>{formatValue(dashboard.company.currency)}</strong>
            </div>
            <div>
              <span>Plan type</span>
              <strong>{formatValue(dashboard.company.plan_type)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{Number(dashboard.company.status) === 1 ? "Active" : "Inactive"}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section" id="commissions">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">Agent</p>
              <h3>Logged-in agent information</h3>
            </div>
          </div>

          <div className="detail-grid profile-grid">
            <div>
              <span>Name</span>
              <strong>{formatValue(agentDetails.name)}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{formatValue(agentDetails.email)}</strong>
            </div>
            <div>
              <span>Mobile</span>
              <strong>{formatValue(agentDetails.mobile)}</strong>
            </div>
            <div>
              <span>Type</span>
              <strong>{formatValue(agentDetails.type)}</strong>
            </div>
            <div>
              <span>Agency code</span>
              <strong>{formatValue(agentDetails.agency_code)}</strong>
            </div>
            <div>
              <span>User ID</span>
              <strong>{formatValue(agentDetails.user_id)}</strong>
            </div>
            <div>
              <span>Contact person</span>
              <strong>{formatValue(agentDetails.primary_contact_name)}</strong>
            </div>
            <div>
              <span>Address</span>
              <strong>{formatValue(agentDetails.address)}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section" id="billing">
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
              <span>Avg commission <MaskedValue /></span>
              <span>Avg markup <MaskedValue /></span>
            </div>
          </div>

          <div className="dashboard-table">
            <div className="table-row header">
              <span>Cruiseline</span>
              <span>Commission</span>
            </div>

            {commissionRows.length > 0 ? (
              commissionRows.map((row) => (
                <div className="table-row" key={String(row.cruiseline_id)}>
                  <span>
                    <strong>{getCruiseLineName(row.cruiseline_id)}</strong>
                    <small>ID {row.cruiseline_id}</small>
                  </span>
                  <span>{formatPercent(row.discount)}</span>
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
