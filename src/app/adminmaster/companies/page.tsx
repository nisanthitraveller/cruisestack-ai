import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import CompaniesClient, { type CompanyRow } from "./CompaniesClient";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

async function getCompanies(): Promise<CompanyRow[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT
        c.id,
        c.company_name,
        c.slug,
        c.domain,
        c.logo,
        c.primary_color,
        c.secondary_color,
        c.support_email,
        c.currency,
        c.plan_type,
        c.status,
        c.company_type,
        c.special_discount_enabled,
        c.special_discount_percentage,
        c.created_at,
        c.chatbot,
        c.deals_enabled,
        cs.payment_method,
        cs.payment_status,
        cs.status AS subscription_status,
        sp.plan_name AS subscription_plan
      FROM companies c
      LEFT JOIN company_subscriptions cs
        ON cs.id = (
          SELECT latest_cs.id
          FROM company_subscriptions latest_cs
          WHERE latest_cs.company_id = c.id
          ORDER BY latest_cs.id DESC
          LIMIT 1
        )
      LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
      ORDER BY c.id DESC
      `,
    );

    const companyRows = rows as Array<
      Omit<CompanyRow, "created_at"> & { created_at: Date | string | null }
    >;

    return companyRows.map((company) => ({
        ...company,
        created_at:
          company.created_at instanceof Date
            ? company.created_at.toISOString()
            : company.created_at,
      }));
  } finally {
    connection.release();
  }
}

export default async function AdminMasterCompaniesPage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) {
    redirect("/adminmaster/login");
  }

  const companies = await getCompanies();
  const activeCompanies = companies.filter(
    (company) => Number(company.status) === 1,
  ).length;
  const companiesWithDomains = companies.filter((company) =>
    Boolean(String(company.domain || "").trim()),
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
            <Link href="/adminmaster/commission-control">
              Commission Control
            </Link>
            <Link className="active" href="/adminmaster/companies">
              Companies
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
              <p className="adminmaster-kicker">Company management</p>
              <h1>Companies</h1>
              <p>Review and manage every CruiseStack tenant.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">
                Logged in as {admin.name || admin.email}
              </span>
              <Link className="adminmaster-refresh" href="/adminmaster/companies">
                Refresh
              </Link>
            </div>
          </header>

          <section className="adminmaster-metrics" aria-label="Company summary">
            <article className="adminmaster-metric-card">
              <span>Total companies</span>
              <strong>{companies.length}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Active</span>
              <strong>{activeCompanies}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Inactive</span>
              <strong>{companies.length - activeCompanies}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>With domains</span>
              <strong>{companiesWithDomains}</strong>
            </article>
          </section>

          <CompaniesClient companies={companies} />
        </section>
      </div>
    </main>
  );
}
