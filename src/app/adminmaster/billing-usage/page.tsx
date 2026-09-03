import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import BillingUsageClient, { type BillingUsageRow } from "./BillingUsageClient";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

async function getBillingUsage(): Promise<BillingUsageRow[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT
        bu.id,
        c.company_name,
        c.slug,
        bu.billing_metric,
        bu.billing_period_start,
        bu.billing_period_end,
        bu.booking_count,
        bu.booking_fee,
        bu.booking_amount,
        bu.trip_summary_count,
        bu.trip_summary_fee,
        bu.trip_summary_amount,
        bu.stripe_invoice_id,
        bu.stripe_invoice_item_id,
        bu.processed_at,
        bu.created_at
      FROM company_billing_usage bu
      INNER JOIN companies c ON c.id = bu.company_id
      ORDER BY bu.id DESC
      LIMIT 500
      `,
    );

    const usageRows = rows as Array<
      Omit<BillingUsageRow, "billing_period_start" | "billing_period_end" | "processed_at" | "created_at"> & {
        billing_period_start: Date | string;
        billing_period_end: Date | string;
        processed_at: Date | string | null;
        created_at: Date | string;
      }
    >;

    return usageRows.map((row) => ({
      ...row,
      billing_period_start:
        row.billing_period_start instanceof Date
          ? row.billing_period_start.toISOString()
          : row.billing_period_start,
      billing_period_end:
        row.billing_period_end instanceof Date
          ? row.billing_period_end.toISOString()
          : row.billing_period_end,
      processed_at:
        row.processed_at instanceof Date ? row.processed_at.toISOString() : row.processed_at,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    }));
  } finally {
    connection.release();
  }
}

export default async function AdminMasterBillingUsagePage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) {
    redirect("/adminmaster/login");
  }

  const usage = await getBillingUsage();

  return (
    <main className="adminmaster-page">
      <div className="adminmaster-shell">
        <aside className="adminmaster-sidebar">
          <div className="adminmaster-brand">
            <span>CruiseStack</span>
            <strong>Master Admin</strong>
          </div>

          <nav className="adminmaster-nav" aria-label="Master admin navigation">
            <Link href="/adminmaster/subscriptions">Manual payments</Link>
            <Link href="/adminmaster/online-payment">Online payments</Link>
            <Link href="/adminmaster/commission-control">
              Commission Control
            </Link>
            <Link href="/adminmaster/companies">Companies</Link>
            <Link href="/adminmaster/subscription-plans">Subscription plans</Link>
            <Link className="active" href="/adminmaster/billing-usage">
              Billing usage
            </Link>
            <Link href="/adminmaster/email-config">Email configuration</Link>
            <Link href="/adminmaster/direct-booking">Direct booking</Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Metered billing</p>
              <h1>Billing usage</h1>
              <p>Booking / trip summary counts reported to Stripe per billing cycle.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">
                Logged in as {admin.name || admin.email}
              </span>
              <Link className="adminmaster-refresh" href="/adminmaster/billing-usage">
                Refresh
              </Link>
            </div>
          </header>

          <BillingUsageClient usage={usage} />
        </section>
      </div>
    </main>
  );
}
