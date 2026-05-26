import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

const allowedActions = new Set(["activate", "block", "delete_user", "update_cycle"]);
const billingCycles = new Set(["monthly", "yearly"]);
const MASTER_PREFIX = "cruisestack_";
const excludedTemplateTables = ["cruisestack_logs", "cruisestack_migrations"];

function addBillingCycle(date, billingCycle) {
  const next = new Date(date);

  if (billingCycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

function tableSafePrefix(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
}

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, "``")}\``;
}

async function getTenantTables(connection, companySlug) {
  const tablePrefix = tableSafePrefix(companySlug);

  if (!tablePrefix) {
    throw new Error("Invalid company slug");
  }

  const [templateRows] = await connection.query(
    `SHOW TABLES LIKE '${MASTER_PREFIX}%'`,
  );
  const templateTables = templateRows
    .map((row) => Object.values(row)[0])
    .filter((table) => !excludedTemplateTables.includes(table));
  const tenantTables = new Set(
    templateTables.map((table) => table.replace(MASTER_PREFIX, `${tablePrefix}_`)),
  );

  tenantTables.add(`${tablePrefix}_whitelabel_sessions`);

  return Array.from(tenantTables);
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    LIMIT 1
    `,
    [tableName],
  );

  return Boolean(rows[0]);
}

async function deleteIfTableExists(connection, tableName, whereColumn, whereValue) {
  if (!(await tableExists(connection, tableName))) {
    return;
  }

  await connection.query(
    `
    DELETE FROM ${quoteIdentifier(tableName)}
    WHERE ${quoteIdentifier(whereColumn)} = ?
    `,
    [whereValue],
  );
}

async function deleteCompanyWorkspace(connection, company) {
  const tenantTables = await getTenantTables(connection, company.slug);

  await deleteIfTableExists(
    connection,
    "company_billing_history",
    "company_id",
    company.id,
  );
  await deleteIfTableExists(
    connection,
    "stripe_webhook_events",
    "company_id",
    company.id,
  );
  await deleteIfTableExists(
    connection,
    "company_subscriptions",
    "company_id",
    company.id,
  );

  for (const tenantTable of tenantTables) {
    await connection.query(
      `
      DROP TABLE IF EXISTS ${quoteIdentifier(tenantTable)}
      `,
    );
  }

  await connection.query(
    `
    DELETE FROM companies
    WHERE id = ?
    `,
    [company.id],
  );
}

export async function POST(request) {
  let connection;

  try {
    const admin = await getAdminMasterFromSession(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Master admin login required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const subscriptionId = Number(body.subscriptionId || 0);
    const action = String(body.action || "");
    const billingCycle = billingCycles.has(body.billingCycle)
      ? body.billingCycle
      : "monthly";

    if (!subscriptionId || !allowedActions.has(action)) {
      return NextResponse.json(
        { message: "Invalid subscription action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [subscriptions] = await connection.query(
      `
      SELECT
        cs.id,
        cs.company_id,
        cs.payment_method,
        c.slug,
        c.company_name
      FROM company_subscriptions cs
      INNER JOIN companies c ON c.id = cs.company_id
      WHERE cs.id = ?
      LIMIT 1
      `,
      [subscriptionId],
    );
    const subscription = subscriptions[0];

    if (!subscription) {
      await connection.rollback();

      return NextResponse.json(
        { message: "Subscription was not found" },
        { status: 404 },
      );
    }

    if (action === "delete_user") {
      await deleteCompanyWorkspace(connection, {
        company_name: subscription.company_name,
        id: subscription.company_id,
        slug: subscription.slug,
      });

      await connection.commit();

      return NextResponse.json({ success: true });
    }

    if (action === "update_cycle" && subscription.payment_method !== "manual") {
      await connection.rollback();

      return NextResponse.json(
        { message: "Billing cycle can only be changed for manual payment subscriptions" },
        { status: 400 },
      );
    }

    if (action === "block") {
      if (subscription.payment_method === "manual") {
        await connection.query(
          `
          UPDATE company_subscriptions
          SET
            status = 0,
            payment_status = 'Cancelled',
            stripe_status = 'manual_blocked'
          WHERE id = ?
          `,
          [subscriptionId],
        );
      } else {
        await connection.query(
          `
          UPDATE company_subscriptions
          SET status = 0
          WHERE id = ?
          `,
          [subscriptionId],
        );
      }

      await connection.query(
        `
        UPDATE companies
        SET status = 0
        WHERE id = ?
        `,
        [subscription.company_id],
      );
    }

    if (action === "activate") {
      if (subscription.payment_method === "manual") {
        await connection.query(
          `
          UPDATE company_subscriptions
          SET
            status = 1,
            payment_status = 'Paid',
            stripe_status = 'manual_active'
          WHERE id = ?
          `,
          [subscriptionId],
        );
      } else {
        await connection.query(
          `
          UPDATE company_subscriptions
          SET status = 1
          WHERE id = ?
          `,
          [subscriptionId],
        );
      }

      await connection.query(
        `
        UPDATE companies
        SET status = 1
        WHERE id = ?
        `,
        [subscription.company_id],
      );
    }

    if (action === "update_cycle") {
      const now = new Date();
      const periodEnd = addBillingCycle(now, billingCycle);

      await connection.query(
        `
        UPDATE company_subscriptions
        SET
          billing_cycle = ?,
          start_date = DATE(?),
          end_date = DATE(?),
          current_period_start = ?,
          current_period_end = ?,
          status = 1,
          payment_status = 'Paid',
          stripe_status = 'manual_active'
        WHERE id = ?
        `,
        [billingCycle, now, periodEnd, now, periodEnd, subscriptionId],
      );

      await connection.query(
        `
        UPDATE companies
        SET status = 1
        WHERE id = ?
        `,
        [subscription.company_id],
      );
    }

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Adminmaster subscription update error:", error);

    return NextResponse.json(
      { message: error.message || "Unable to update subscription" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
