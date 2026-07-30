import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import ProductionTestClient from "./ProductionTestClient";
import "../../adminmaster.css";

export const dynamic = "force-dynamic";

async function getProductionIntegrations() {
  const [rows] = await pool.query(
    `
    SELECT i.id, c.company_name, cr.name AS cruiseline_name, p.provider_name
    FROM company_cruiseline_integrations i
    JOIN companies c ON c.id = i.company_id
    JOIN cruises cr ON cr.id = i.cruiseline_id
    JOIN cruise_api_providers p ON p.id = i.provider_id
    WHERE i.environment = 'PRODUCTION'
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

export default async function ProductionTestPage() {
  const admin = await getAdminMasterFromSession(await cookies());
  if (!admin) redirect("/adminmaster/login");
  const integrations = await getProductionIntegrations();

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
            <Link href="/adminmaster/email-config">Email configuration</Link>
            <Link href="/adminmaster/direct-booking">Direct booking</Link>
            <Link className="active" href="/adminmaster/direct-booking/production-test">
              Production Test
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Read-only supplier verification</p>
              <h1>Cordelia Production Test</h1>
              <p>No Production booking or wallet-debit action is available here.</p>
            </div>
            <Link className="adminmaster-refresh" href="/adminmaster/direct-booking">
              Back to integrations
            </Link>
          </header>

          <section className="adminmaster-panel isolated-booking-panel">
            {integrations.length ? (
              <ProductionTestClient integrations={integrations} />
            ) : (
              <div className="adminmaster-empty">
                Create a Cordelia Production integration first.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
