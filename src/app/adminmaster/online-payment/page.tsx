import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import { tableSafePrefix } from "@/lib/agentAuth";
import SubscriptionActions from "../subscriptions/SubscriptionActions";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

type OnlineSubscriptionRow = {
  agent_email: string | null;
  agent_name: string | null;
  agent_user_id: string | null;
  billing_cycle: string | null;
  company_id: number;
  company_name: string | null;
  company_status: number;
  current_period_end: string | Date | null;
  current_period_start: string | Date | null;
  payment_method: string | null;
  payment_status: string | null;
  plan_name: string | null;
  slug: string;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_status: string | null;
  stripe_subscription_id: string | null;
  subscription_id: number;
  subscription_status: number;
  support_email: string | null;
};

function formatDate(value: string | Date | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

async function getPrimaryAgent(connection: Awaited<ReturnType<typeof pool.getConnection>>, row: OnlineSubscriptionRow) {
  const tablePrefix = tableSafePrefix(row.slug);
  const agentTable = `${tablePrefix}_agent`;

  try {
    const [agents] = await connection.query(
      `
      SELECT name, email, user_id
      FROM \`${agentTable}\`
      WHERE company_id = ?
      ORDER BY type = 'Admin' DESC, id ASC
      LIMIT 1
      `,
      [row.company_id],
    );
    const agentRows = agents as Array<{
      email?: string | null;
      name?: string | null;
      user_id?: string | null;
    }>;
    const agent = agentRows[0] || null;

    return {
      ...row,
      agent_email: agent?.email || null,
      agent_name: agent?.name || null,
      agent_user_id: agent?.user_id || null,
    };
  } catch (error) {
    if ((error as { code?: string })?.code !== "ER_NO_SUCH_TABLE") {
      throw error;
    }

    return row;
  }
}

async function getOnlineSubscriptions() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT
        cs.id AS subscription_id,
        cs.company_id,
        cs.payment_status,
        cs.stripe_status,
        cs.current_period_start,
        cs.current_period_end,
        cs.status AS subscription_status,
        cs.payment_method,
        cs.billing_cycle,
        cs.stripe_customer_id,
        cs.stripe_subscription_id,
        cs.stripe_checkout_session_id,
        c.company_name,
        c.slug,
        c.support_email,
        c.status AS company_status,
        sp.plan_name
      FROM company_subscriptions cs
      INNER JOIN companies c ON c.id = cs.company_id
      LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
      WHERE COALESCE(cs.payment_method, 'stripe') <> 'manual'
      ORDER BY cs.id DESC
      `,
    );

    const subscriptions = rows as OnlineSubscriptionRow[];

    return Promise.all(
      subscriptions.map((subscription) => getPrimaryAgent(connection, subscription)),
    );
  } finally {
    connection.release();
  }
}

function getSummary(rows: OnlineSubscriptionRow[]) {
  return {
    active: rows.filter(
      (row) => Number(row.company_status) === 1 && Number(row.subscription_status) === 1,
    ).length,
    blocked: rows.filter(
      (row) => Number(row.company_status) !== 1 || Number(row.subscription_status) !== 1,
    ).length,
    paid: rows.filter((row) => row.payment_status === "Paid").length,
    stripeActive: rows.filter((row) => row.stripe_status === "active").length,
  };
}

export default async function AdminMasterOnlinePaymentPage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) {
    redirect("/adminmaster/login");
  }

  const subscriptions = await getOnlineSubscriptions();
  const summary = getSummary(subscriptions);

  return (
    <main className="adminmaster-page">
      <div className="adminmaster-shell">
        <aside className="adminmaster-sidebar">
          <div className="adminmaster-brand">
            <span>CruiseStack</span>
            <strong>Master Admin</strong>
          </div>

          <nav className="adminmaster-nav" aria-label="Master admin navigation">
            <Link href="/adminmaster/subscriptions">
              Manual payments
            </Link>
            <Link className="active" href="/adminmaster/online-payment">
              Online payments
            </Link>
            <Link href="/adminmaster/commission-control">
              Commission Control
            </Link>
            <Link href="/adminmaster/email-config">
              Email configuration
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Stripe subscription control</p>
              <h1>Online payment users</h1>
              <p>Review Stripe users and control workspace access.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">Logged in as {admin.name || admin.email}</span>
              <Link className="adminmaster-refresh" href="/adminmaster/online-payment">
                Refresh
              </Link>
            </div>
          </header>

          <section className="adminmaster-metrics" aria-label="Online payment summary">
            <article className="adminmaster-metric-card">
              <span>Total online</span>
              <strong>{subscriptions.length}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Active access</span>
              <strong>{summary.active}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Blocked access</span>
              <strong>{summary.blocked}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Stripe active</span>
              <strong>{summary.stripeActive}</strong>
            </article>
          </section>

          <section className="adminmaster-panel">
            <div className="adminmaster-panel-header">
              <h2>Online payment subscriptions</h2>
              <span>Paid {summary.paid} / Stripe active {summary.stripeActive}</span>
            </div>

            {subscriptions.length > 0 ? (
              <div className="adminmaster-table-wrap">
                <table className="adminmaster-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Admin agent</th>
                      <th>Plan</th>
                      <th>Stripe IDs</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => {
                      const isActive =
                        Number(subscription.company_status) === 1 &&
                        Number(subscription.subscription_status) === 1;

                      return (
                        <tr key={subscription.subscription_id}>
                          <td>
                            <div className="adminmaster-company">
                              <strong>{subscription.company_name || subscription.slug}</strong>
                              <span>{subscription.slug}</span>
                              <span>{subscription.support_email || "No support email"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="adminmaster-agent">
                              <strong>{subscription.agent_name || "No agent found"}</strong>
                              <span>{subscription.agent_email || "No email"}</span>
                              <span>{subscription.agent_user_id || "No user ID"}</span>
                            </div>
                          </td>
                          <td>
                            <strong>{subscription.plan_name || "Not selected"}</strong>
                            <br />
                            <span className="adminmaster-pill online">Online</span>
                          </td>
                          <td>
                            <div className="adminmaster-stripe-ids">
                              <span title={subscription.stripe_customer_id || "No customer ID"}>
                                {subscription.stripe_customer_id || "No customer ID"}
                              </span>
                              <span title={subscription.stripe_subscription_id || "No subscription ID"}>
                                {subscription.stripe_subscription_id || "No subscription ID"}
                              </span>
                              <span title={subscription.stripe_checkout_session_id || "No checkout session"}>
                                {subscription.stripe_checkout_session_id || "No checkout session"}
                              </span>
                            </div>
                          </td>
                          <td>
                            {formatDate(subscription.current_period_start)} -{" "}
                            {formatDate(subscription.current_period_end)}
                          </td>
                          <td>
                            <span className={`adminmaster-pill ${isActive ? "active" : "blocked"}`}>
                              {isActive ? "Active" : "Blocked"}
                            </span>
                            <br />
                            {subscription.payment_status || "Pending"}
                            <br />
                            {subscription.stripe_status || "No Stripe status"}
                          </td>
                          <td>
                            <SubscriptionActions
                              allowBillingCycle={false}
                              billingCycle={subscription.billing_cycle}
                              companyName={subscription.company_name || subscription.slug}
                              companyStatus={subscription.company_status}
                              subscriptionId={subscription.subscription_id}
                              subscriptionStatus={subscription.subscription_status}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="adminmaster-empty">
                No online payment subscriptions found.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
