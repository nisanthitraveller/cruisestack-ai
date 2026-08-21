import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import DirectBookingClient, {
  type DirectBookingCompany,
  type DirectBookingCruiseline,
  type DirectBookingIntegration,
  type DirectBookingProvider,
} from "./DirectBookingClient";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

async function getDirectBookingData() {
  const [companyRows] = await pool.query(
    `SELECT id, company_name, slug FROM companies ORDER BY company_name, slug`,
  );
  const [cruiseRows] = await pool.query(
    `SELECT id, name, od_id FROM cruises WHERE name IS NOT NULL AND name <> '' ORDER BY name`,
  );
  const [providerRows] = await pool.query(
    `
    SELECT id, provider_code, provider_name, adapter_code, status
    FROM cruise_api_providers
    ORDER BY provider_name, provider_code
    `,
  );
  const [integrationRows] = await pool.query(
    `
    SELECT
      i.id,
      i.company_id,
      i.cruiseline_id,
      i.provider_id,
      i.environment,
      i.is_enabled,
      i.inr_flow_enabled,
      i.pre_payment_balance_check_enabled,
      i.post_payment_booking_enabled,
      i.exact_supplier_price_enabled,
      i.updated_at,
      GROUP_CONCAT(c.credential_key ORDER BY c.credential_key SEPARATOR ',') AS credential_keys
    FROM company_cruiseline_integrations i
    LEFT JOIN company_integration_credentials c ON c.integration_id = i.id
    GROUP BY
      i.id, i.company_id, i.cruiseline_id, i.provider_id, i.environment,
      i.is_enabled, i.inr_flow_enabled, i.pre_payment_balance_check_enabled,
      i.post_payment_booking_enabled, i.exact_supplier_price_enabled,
      i.updated_at
    ORDER BY i.updated_at DESC, i.id DESC
    `,
  );

  const companies: DirectBookingCompany[] = (
    companyRows as Array<Record<string, unknown>>
  ).map((row) => ({
    id: Number(row.id),
    name: String(row.company_name || ""),
    slug: String(row.slug || ""),
  }));
  const cruiselines: DirectBookingCruiseline[] = (
    cruiseRows as Array<Record<string, unknown>>
  ).map((row) => ({
    id: Number(row.id),
    name: String(row.name || ""),
    odId: row.od_id == null ? null : Number(row.od_id),
  }));
  const providers: DirectBookingProvider[] = (
    providerRows as Array<Record<string, unknown>>
  ).map((row) => ({
    id: Number(row.id),
    providerCode: String(row.provider_code || ""),
    providerName: String(row.provider_name || ""),
    adapterCode: String(row.adapter_code || ""),
    status: Number(row.status) === 1,
  }));
  const integrations: DirectBookingIntegration[] = (
    integrationRows as Array<Record<string, unknown>>
  ).map((row) => ({
    id: Number(row.id),
    companyId: Number(row.company_id),
    cruiselineId: Number(row.cruiseline_id),
    providerId: Number(row.provider_id),
    environment: String(row.environment) === "PRODUCTION" ? "PRODUCTION" : "UAT",
    isEnabled: Number(row.is_enabled) === 1,
    inrFlowEnabled: Number(row.inr_flow_enabled) === 1,
    prePaymentBalanceCheckEnabled:
      Number(row.pre_payment_balance_check_enabled) === 1,
    postPaymentBookingEnabled:
      Number(row.post_payment_booking_enabled) === 1,
    exactSupplierPriceEnabled:
      Number(row.exact_supplier_price_enabled) === 1,
    credentialKeys: String(row.credential_keys || "")
      .split(",")
      .filter(Boolean),
    updatedAt: row.updated_at
      ? new Date(String(row.updated_at)).toISOString()
      : null,
  }));

  return { companies, cruiselines, providers, integrations };
}

export default async function AdminMasterDirectBookingPage() {
  const admin = await getAdminMasterFromSession(await cookies());
  if (!admin) redirect("/adminmaster/login");

  const data = await getDirectBookingData();
  const enabled = data.integrations.filter(
    (integration) => integration.isEnabled,
  ).length;
  const production = data.integrations.filter(
    (integration) => integration.environment === "PRODUCTION",
  ).length;

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
            <Link className="active" href="/adminmaster/direct-booking">
              Direct booking
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Supplier API routing</p>
              <h1>Direct booking integrations</h1>
              <p>
                Configure direct cruise-line booking per company and cruise line.
              </p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">
                Logged in as {admin.name || admin.email}
              </span>
              <Link
                className="adminmaster-refresh"
                href="/adminmaster/direct-booking"
              >
                Refresh
              </Link>
              <Link
                className="adminmaster-refresh"
                href="/adminmaster/direct-booking/booking-test"
              >
                UAT Booking Test
              </Link>
              <Link
                className="adminmaster-refresh"
                href="/adminmaster/direct-booking/production-test"
              >
                Production Test
              </Link>
            </div>
          </header>

          <section className="adminmaster-metrics" aria-label="Integration summary">
            <article className="adminmaster-metric-card">
              <span>Integrations</span>
              <strong>{data.integrations.length}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Enabled</span>
              <strong>{enabled}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>UAT</span>
              <strong>{data.integrations.length - production}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Production</span>
              <strong>{production}</strong>
            </article>
          </section>

          <section className="adminmaster-panel direct-booking-panel">
            <DirectBookingClient {...data} />
          </section>
        </section>
      </div>
    </main>
  );
}
