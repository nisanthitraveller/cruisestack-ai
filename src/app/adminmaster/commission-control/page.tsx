import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import CommissionControlClient from "./CommissionControlClient";
import "../adminmaster.css";

export const dynamic = "force-dynamic";

type CommissionRow = {
  commission: string;
  cruiseline_id: number;
  discount: string;
  gmc_discount: string | null;
  id: number;
  markup: string;
  status: number;
  subscription_plan_id: number;
};

type CruiseOption = {
  id: number;
  name: string;
};

type PlanOption = {
  id: number;
  plan_name: string;
};

async function getCommissionRows() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT
        id,
        subscription_plan_id,
        cruiseline_id,
        commission,
        discount,
        markup,
        gmc_discount,
        status
      FROM cruisestack_master_commission
      ORDER BY subscription_plan_id ASC, cruiseline_id ASC, id ASC
      `,
    );

    return rows as CommissionRow[];
  } finally {
    connection.release();
  }
}

async function getCruiseOptions() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT id, name
      FROM cruises
      ORDER BY name ASC
      `,
    );

    return rows as CruiseOption[];
  } finally {
    connection.release();
  }
}

async function getPlanOptions() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT id, plan_name
      FROM subscription_plans
      ORDER BY id ASC
      `,
    );

    return rows as PlanOption[];
  } finally {
    connection.release();
  }
}

async function getTenantMasterCommissionCount() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME LIKE '%\\_master_commission'
        AND TABLE_NAME <> 'cruisestack_master_commission'
      `,
    );

    return Number((rows as Array<{ total: number }>)[0]?.total || 0);
  } finally {
    connection.release();
  }
}

export default async function AdminMasterCommissionControlPage() {
  const cookieStore = await cookies();
  const admin = await getAdminMasterFromSession(cookieStore);

  if (!admin) {
    redirect("/adminmaster/login");
  }

  const [cruises, plans, rows, tenantTableCount] = await Promise.all([
    getCruiseOptions(),
    getPlanOptions(),
    getCommissionRows(),
    getTenantMasterCommissionCount(),
  ]);
  const activeRows = rows.filter((row) => Number(row.status) === 1).length;

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
            <Link href="/adminmaster/online-payment">
              Online payments
            </Link>
            <Link className="active" href="/adminmaster/commission-control">
              Commission Control
            </Link>
            <Link href="/adminmaster/companies">
              Companies
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Master commission control</p>
              <h1>Commission Control</h1>
              <p>Changes sync to every tenant agent commission table.</p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">Logged in as {admin.name || admin.email}</span>
              <Link className="adminmaster-refresh" href="/adminmaster/commission-control">
                Refresh
              </Link>
            </div>
          </header>

          <section className="adminmaster-metrics" aria-label="Commission summary">
            <article className="adminmaster-metric-card">
              <span>Master rows</span>
              <strong>{rows.length}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Active rows</span>
              <strong>{activeRows}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Tenant tables</span>
              <strong>{tenantTableCount}</strong>
            </article>
            <article className="adminmaster-metric-card">
              <span>Sync mode</span>
              <strong>Immediate</strong>
            </article>
          </section>

          <CommissionControlClient cruises={cruises} plans={plans} rows={rows} />
        </section>
      </div>
    </main>
  );
}
