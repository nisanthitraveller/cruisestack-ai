import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import BookingTestClient from "./BookingTestClient";
import "../../adminmaster.css";

export const dynamic = "force-dynamic";

async function getUatIntegrations() {
  const [rows] = await pool.query(
    `
    SELECT
      i.id,
      c.company_name,
      cr.name AS cruiseline_name,
      p.provider_name
    FROM company_cruiseline_integrations i
    JOIN companies c ON c.id = i.company_id
    JOIN cruises cr ON cr.id = i.cruiseline_id
    JOIN cruise_api_providers p ON p.id = i.provider_id
    WHERE i.environment = 'UAT'
      AND i.is_enabled = 1
      AND p.provider_code = 'CORDELIA'
      AND p.adapter_code = 'cordelia-agent-api'
    ORDER BY c.company_name, cr.name
    `,
  );

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    label: `${row.company_name} → ${row.cruiseline_name} (${row.provider_name})`,
  }));
}

export default async function AdminMasterBookingTestPage() {
  const admin = await getAdminMasterFromSession(await cookies());
  if (!admin) redirect("/adminmaster/login");

  const integrations = await getUatIntegrations();

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
            <Link href="/adminmaster/commission-control">Commission Control</Link>
            <Link href="/adminmaster/companies">Companies</Link>
            <Link href="/adminmaster/subscription-plans">Subscription plans</Link>
            <Link href="/adminmaster/billing-usage">Billing usage</Link>
            <Link href="/adminmaster/email-config">Email configuration</Link>
            <Link href="/adminmaster/direct-booking">Direct booking</Link>
            <Link className="active" href="/adminmaster/direct-booking/booking-test">
              UAT Booking Test
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Isolated supplier test</p>
              <h1>Cordelia UAT Booking Test</h1>
              <p>Prepare, reprice and create a controlled one-adult UAT booking.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">
                Logged in as {admin.name || admin.email}
              </span>
              <Link className="adminmaster-refresh" href="/adminmaster/direct-booking">
                Back to integrations
              </Link>
            </div>
          </header>

          <section className="adminmaster-panel isolated-booking-panel">
            {integrations.length ? (
              <BookingTestClient integrations={integrations} />
            ) : (
              <div className="adminmaster-empty">
                No enabled Cordelia UAT integration is available.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
