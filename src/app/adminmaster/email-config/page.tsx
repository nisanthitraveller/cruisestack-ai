import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import EmailConfigClient, { type CompanyEmailConfig } from "./EmailConfigClient";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

async function getCompanies(): Promise<CompanyEmailConfig[]> {
  const [rows] = await pool.query(
    `
    SELECT
      c.id AS company_id,
      c.company_name,
      c.slug,
      ec.is_enabled,
      ec.smtp_host,
      ec.smtp_port,
      ec.smtp_username,
      ec.from_email,
      ec.from_name,
      ec.reply_to_email,
      ec.updated_at,
      CASE WHEN ec.smtp_password IS NOT NULL AND ec.smtp_password <> '' THEN 1 ELSE 0 END AS has_password
    FROM companies c
    LEFT JOIN company_email_config ec
      ON ec.id = (
        SELECT email_config.id
        FROM company_email_config email_config
        WHERE email_config.company_id = c.id
        ORDER BY email_config.updated_at DESC, email_config.id DESC
        LIMIT 1
      )
    ORDER BY c.company_name ASC, c.slug ASC
    `,
  );

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    companyId: Number(row.company_id),
    companyName: String(row.company_name || ""),
    fromEmail: String(row.from_email || ""),
    fromName: String(row.from_name || ""),
    hasPassword: Number(row.has_password) === 1,
    isEnabled: Number(row.is_enabled) === 1,
    replyToEmail: String(row.reply_to_email || ""),
    slug: String(row.slug || ""),
    smtpHost: String(row.smtp_host || ""),
    smtpPort: row.smtp_port ? String(row.smtp_port) : "",
    smtpUsername: String(row.smtp_username || ""),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : null,
  }));
}

export default async function AdminMasterEmailConfigPage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) redirect("/adminmaster/login");

  const companies = await getCompanies();

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
            <Link className="active" href="/adminmaster/email-config">Email configuration</Link>
            <Link href="/adminmaster/direct-booking">Direct booking</Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Tenant email delivery</p>
              <h1>SMTP configuration</h1>
              <p>Manage sender accounts and control which tenants use their own SMTP server.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">Logged in as {admin.name || admin.email}</span>
              <Link className="adminmaster-refresh" href="/adminmaster/email-config">Refresh</Link>
            </div>
          </header>

          <section className="adminmaster-panel email-config-panel">
            <EmailConfigClient companies={companies} />
          </section>
        </section>
      </div>
    </main>
  );
}
