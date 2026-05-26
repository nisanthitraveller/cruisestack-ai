import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import {
  AGENT_SESSION_COOKIE,
  createAgentSessionRecord,
  findCompanyBySlug,
  findFirstCompanyAgent,
  getAgentCookieOptions,
} from "@/lib/agentAuth";

const PUBLIC_APP_ORIGIN = "https://cruisestack.ai";
const billingCycles = new Set(["monthly", "yearly"]);

function publicUrl(path) {
  return new URL(path, PUBLIC_APP_ORIGIN);
}

function dashboardRedirect(path) {
  return NextResponse.redirect(publicUrl(path));
}

function whitelabelPath(company, agent, token) {
  const agentSlug = String(agent?.agency_code || company.slug || "");
  const params = new URLSearchParams({
    token: String(token || ""),
    next: "admin/dashboard",
  });

  return `/agents/${encodeURIComponent(agentSlug)}/api/company/whitelabel?${params.toString()}`;
}

function addBillingCycle(date, billingCycle) {
  const next = new Date(date);

  if (billingCycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

async function findProfessionalPlan(connection) {
  const [plans] = await connection.query(
    `
    SELECT id, plan_name
    FROM subscription_plans
    WHERE plan_name = ?
    LIMIT 1
    `,
    ["Professional"],
  );

  return plans[0] || null;
}

async function ensureManualColumns(connection) {
  const [columns] = await connection.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'company_subscriptions'
      AND COLUMN_NAME IN ('payment_method', 'billing_cycle')
    `,
  );
  const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

  if (!existingColumns.has("payment_method")) {
    await connection.query(
      `
      ALTER TABLE company_subscriptions
      ADD COLUMN payment_method varchar(50) DEFAULT 'stripe'
      `,
    );
  }

  if (!existingColumns.has("billing_cycle")) {
    await connection.query(
      `
      ALTER TABLE company_subscriptions
      ADD COLUMN billing_cycle varchar(50) DEFAULT 'monthly'
      `,
    );
  }
}

async function upsertManualSubscription(connection, company, billingCycle) {
  const plan = await findProfessionalPlan(connection);

  if (!plan?.id) {
    throw new Error("Professional plan was not found");
  }

  await ensureManualColumns(connection);

  const now = new Date();
  const periodEnd = addBillingCycle(now, billingCycle);

  const [existing] = await connection.query(
    `
    SELECT id
    FROM company_subscriptions
    WHERE company_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [company.id],
  );

  if (existing[0]?.id) {
    await connection.query(
      `
      UPDATE company_subscriptions
      SET
        plan_id = ?,
        start_date = DATE(?),
        end_date = DATE(?),
        payment_status = ?,
        stripe_customer_id = NULL,
        stripe_subscription_id = NULL,
        stripe_checkout_session_id = NULL,
        stripe_price_id = NULL,
        stripe_product_id = NULL,
        stripe_status = ?,
        current_period_start = ?,
        current_period_end = ?,
        cancel_at_period_end = 0,
        payment_method = ?,
        billing_cycle = ?,
        status = 1
      WHERE id = ?
      `,
      [
        plan.id,
        now,
        periodEnd,
        "Paid",
        "manual_active",
        now,
        periodEnd,
        "manual",
        billingCycle,
        existing[0].id,
      ],
    );

    return;
  }

  await connection.query(
    `
    INSERT INTO company_subscriptions
      (
        company_id,
        plan_id,
        start_date,
        end_date,
        payment_status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        stripe_price_id,
        stripe_product_id,
        stripe_status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        payment_method,
        billing_cycle,
        status
      )
    VALUES
      (?, ?, DATE(?), DATE(?), ?, NULL, NULL, NULL, NULL, NULL, ?, ?, ?, 0, ?, ?, 1)
    `,
    [
      company.id,
      plan.id,
      now,
      periodEnd,
      "Paid",
      "manual_active",
      now,
      periodEnd,
      "manual",
      billingCycle,
    ],
  );
}

export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("company") || "";
    const billingCycleParam = searchParams.get("billing_cycle") || "monthly";
    const billingCycle = billingCycles.has(billingCycleParam)
      ? billingCycleParam
      : "monthly";

    if (!companySlug) {
      return dashboardRedirect("/login?manual=missing-company");
    }

    connection = await pool.getConnection();

    const company = await findCompanyBySlug(connection, companySlug);

    if (!company) {
      return dashboardRedirect("/login?manual=company-not-found");
    }

    const agent = await findFirstCompanyAgent(connection, company);

    if (!agent) {
      return dashboardRedirect(`/login?company=${company.slug}&manual=agent-not-found`);
    }

    await upsertManualSubscription(connection, company, billingCycle);

    const agentSession = await createAgentSessionRecord(
      connection,
      agent,
      company,
    );

    const response = dashboardRedirect(
      whitelabelPath(company, agent, agentSession.token),
    );
    response.cookies.set(
      AGENT_SESSION_COOKIE,
      agentSession.cookieValue,
      getAgentCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("Manual Payment Success Error:", error);

    return dashboardRedirect("/login?manual=error");
  } finally {
    if (connection) connection.release();
  }
}
