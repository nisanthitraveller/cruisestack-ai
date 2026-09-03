import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import SubscriptionPlansClient, { type SubscriptionPlanRow } from "./SubscriptionPlansClient";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

async function getSubscriptionPlans(): Promise<SubscriptionPlanRow[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT
        id,
        plan_name,
        stripe_product_id,
        stripe_price_id,
        booking_fee,
        monthly_booking_limit,
        trip_summary_fee,
        api_scan_fee
      FROM subscription_plans
      ORDER BY id ASC
      `,
    );

    return rows as SubscriptionPlanRow[];
  } finally {
    connection.release();
  }
}

export default async function AdminMasterSubscriptionPlansPage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) {
    redirect("/adminmaster/login");
  }

  const plans = await getSubscriptionPlans();

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
            <Link className="active" href="/adminmaster/subscription-plans">
              Subscription plans
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
              <p className="adminmaster-kicker">Plan pricing</p>
              <h1>Subscription plans</h1>
              <p>Set per-plan booking and trip summary billing rates.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">
                Logged in as {admin.name || admin.email}
              </span>
              <Link className="adminmaster-refresh" href="/adminmaster/subscription-plans">
                Refresh
              </Link>
            </div>
          </header>

          <SubscriptionPlansClient plans={plans} />
        </section>
      </div>
    </main>
  );
}
