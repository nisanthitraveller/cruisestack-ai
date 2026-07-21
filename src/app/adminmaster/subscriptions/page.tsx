import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import { tableSafePrefix } from "@/lib/agentAuth";
import SubscriptionActions from "./SubscriptionActions";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

type ManualSubscriptionRow = {
  agent_email: string | null;
  agent_name: string | null;
  agent_user_id: string | null;
  billing_cycle: string | null;
  company_id: number;
  company_name: string | null;
  company_status: number;
  current_period_end: string | Date | null;
  current_period_start: string | Date | null;
  end_date: string | Date | null;
  payment_method: string | null;
  payment_status: string | null;
  plan_name: string | null;
  slug: string;
  stripe_status: string | null;
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

async function getPrimaryAgent(connection: Awaited<ReturnType<typeof pool.getConnection>>, row: ManualSubscriptionRow) {
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

async function getManualSubscriptions() {
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
        cs.end_date,
        cs.status AS subscription_status,
        cs.payment_method,
        cs.billing_cycle,
        c.company_name,
        c.slug,
        c.support_email,
        c.status AS company_status,
        sp.plan_name
      FROM company_subscriptions cs
      INNER JOIN companies c ON c.id = cs.company_id
      LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
      WHERE cs.payment_method = 'manual'
      ORDER BY cs.id DESC
      `,
    );

    const subscriptions = rows as ManualSubscriptionRow[];

    return Promise.all(
      subscriptions.map((subscription) => getPrimaryAgent(connection, subscription)),
    );
  } finally {
    connection.release();
  }
}

function getSummary(rows: ManualSubscriptionRow[]) {
  return {
    active: rows.filter(
      (row) => Number(row.company_status) === 1 && Number(row.subscription_status) === 1,
    ).length,
    blocked: rows.filter(
      (row) => Number(row.company_status) !== 1 || Number(row.subscription_status) !== 1,
    ).length,
    monthly: rows.filter((row) => row.billing_cycle !== "yearly").length,
    yearly: rows.filter((row) => row.billing_cycle === "yearly").length,
  };
}

export default async function AdminMasterSubscriptionsPage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) {
    redirect("/adminmaster/login");
  }

  const subscriptions = await getManualSubscriptions();
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
            <Link className="active" href="/adminmaster/subscriptions">
              Manual payments
            </Link>
            <Link href="/adminmaster/online-payment">
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
              <p className="adminmaster-kicker">Manual subscription control</p>
              <h1>Manual payment users</h1>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">Logged in as {admin.name || admin.email}</span>
              <Link className="adminmaster-refresh" href="/adminmaster/subscriptions">
                Refresh
              </Link>
            </div>
          </header>

          <section className="adminmaster-metrics" aria-label="Manual payment summary">
            <article className="adminmaster-metric-card">
              <span>Total manual</span>
              <strong>{subscriptions.length}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Active</span>
              <strong>{summary.active}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Blocked</span>
              <strong>{summary.blocked}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Yearly</span>
              <strong>{summary.yearly}</strong>
            </article>
          </section>

          <section className="adminmaster-panel">
            <div className="adminmaster-panel-header">
              <h2>Manual payment subscriptions</h2>
              <span>
                Monthly {summary.monthly} / Yearly {summary.yearly}
              </span>
            </div>

            {subscriptions.length > 0 ? (
              <div className="adminmaster-table-wrap">
                <table className="adminmaster-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Admin agent</th>
                      <th>Plan</th>
                      <th>Billing</th>
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
                            <strong>{subscription.plan_name || "Professional"}</strong>
                            <br />
                            <span className="adminmaster-pill manual">Manual</span>
                          </td>
                          <td>{subscription.billing_cycle === "yearly" ? "Yearly" : "Monthly"}</td>
                          <td>
                            {formatDate(subscription.current_period_start)} -{" "}
                            {formatDate(subscription.current_period_end || subscription.end_date)}
                          </td>
                          <td>
                            <span className={`adminmaster-pill ${isActive ? "active" : "blocked"}`}>
                              {isActive ? "Active" : "Blocked"}
                            </span>
                            <br />
                            {subscription.payment_status || "Pending"}
                            <br />
                            {subscription.stripe_status || "manual"}
                          </td>
                          <td>
                            <SubscriptionActions
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
                No manual payment subscriptions found.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
