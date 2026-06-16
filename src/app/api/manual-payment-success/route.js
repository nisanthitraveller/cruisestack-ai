import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import {
  AGENT_SESSION_COOKIE,
  createAgentSessionRecord,
  findCompanyBySlug,
  findFirstCompanyAgent,
  getAgentCookieOptions,
  tableSafePrefix,
} from "@/lib/agentAuth";

const PUBLIC_APP_ORIGIN = "https://cruisestack.ai";
const MASTER_PREFIX = "cruisestack_";
const excludedTemplateTables = ["cruisestack_logs", "cruisestack_migrations"];
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

async function ensureWhitelabelSessionsTable(connection, tableName) {
  await connection.query(
    `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      token varchar(128) NOT NULL,
      agent_id bigint(20) NOT NULL,
      expires_at datetime NOT NULL,
      created_at datetime DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY token (token),
      KEY token_2 (token),
      KEY agent_id (agent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,
  );
}

async function ensureActivityLogsTable(connection, tableName) {
  await connection.query(
    `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      package_url VARCHAR(255) NULL,
      activity_type VARCHAR(100) NOT NULL,
      activity_name VARCHAR(150) NOT NULL,
      source_page VARCHAR(150) NULL,
      api_endpoint VARCHAR(255) NULL,
      http_method VARCHAR(20) NULL,
      agent_id VARCHAR(100) NULL,
      agent_name VARCHAR(255) NULL,
      agent_email VARCHAR(255) NULL,
      user_id VARCHAR(100) NULL,
      user_name VARCHAR(255) NULL,
      user_email VARCHAR(255) NULL,
      user_role VARCHAR(100) NULL,
      customer_id VARCHAR(100) NULL,
      customer_email VARCHAR(255) NULL,
      tracking_token VARCHAR(255) NULL,
      action_by VARCHAR(255) NULL,
      request_payload JSON NULL,
      response_payload JSON NULL,
      metadata JSON NULL,
      status_code INT NULL,
      is_success TINYINT(1) NULL,
      error_message TEXT NULL,
      duration_ms INT NULL,
      ip_address VARCHAR(100) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_activity_package_url (package_url),
      INDEX idx_activity_type (activity_type),
      INDEX idx_activity_name (activity_name),
      INDEX idx_activity_agent_id (agent_id),
      INDEX idx_activity_customer_id (customer_id),
      INDEX idx_activity_tracking_token (tracking_token),
      INDEX idx_activity_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,
  );
}

async function ensureTenantTables(connection, company) {
  const tablePrefix = tableSafePrefix(company.slug);

  if (!tablePrefix) {
    throw new Error("Company slug is invalid for tenant table creation");
  }

  const [tables] = await connection.query(
    `SHOW TABLES LIKE '${MASTER_PREFIX}%'`,
  );

  const templateTables = tables
    .map((row) => Object.values(row)[0])
    .filter((table) => !excludedTemplateTables.includes(table));

  if (templateTables.length === 0) {
    throw new Error("No cruisestack master template tables found");
  }

  for (const templateTable of templateTables) {
    const newTable = templateTable.replace(MASTER_PREFIX, `${tablePrefix}_`);

    await connection.query(
      `
      CREATE TABLE IF NOT EXISTS \`${newTable}\`
      LIKE \`${templateTable}\`
      `,
    );
  }

  await ensureWhitelabelSessionsTable(
    connection,
    `${tablePrefix}_whitelabel_sessions`,
  );

  await ensureActivityLogsTable(
    connection,
    `${tablePrefix}_activity_logs`,
  );
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

    return plan;
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

  return plan;
}

async function copyProfessionalCommissionToCompany(connection, company, planId) {
  if (!company?.id || !company?.slug || !planId) {
    return;
  }

  const tablePrefix = tableSafePrefix(company.slug);
  const agentTable = `${tablePrefix}_agent`;
  const commissionTable = `${tablePrefix}_agent_commission`;

  const [agents] = await connection.query(
    `
    SELECT id
    FROM \`${agentTable}\`
    WHERE company_id = ?
    ORDER BY type = 'Admin' DESC, id ASC
    LIMIT 1
    `,
    [company.id],
  );

  if (!agents[0]?.id) {
    throw new Error(`No agent found in ${agentTable}`);
  }

  const agentId = agents[0].id;
  const [existing] = await connection.query(
    `
    SELECT id
    FROM \`${commissionTable}\`
    WHERE tour_agent_id = ?
      AND company_id = ?
    LIMIT 1
    `,
    [agentId, company.id],
  );

  if (existing[0]?.id) {
    return;
  }

  await connection.query(
    `
    INSERT INTO \`${commissionTable}\`
      (
        tour_agent_id,
        cruiseline_id,
        commission,
        discount,
        markup,
        gmc_discount,
        created_at,
        updated_at,
        status,
        company_id
      )
    SELECT
      ?,
      cruiseline_id,
      commission,
      discount,
      markup,
      gmc_discount,
      NOW(),
      NOW(),
      status,
      ?
    FROM cruisestack_master_commission
    WHERE subscription_plan_id = ?
    `,
    [agentId, company.id, planId],
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

    await ensureTenantTables(connection, company);

    const agent = await findFirstCompanyAgent(connection, company);

    if (!agent) {
      return dashboardRedirect(`/login?company=${company.slug}&manual=agent-not-found`);
    }

    const plan = await upsertManualSubscription(connection, company, billingCycle);

    await copyProfessionalCommissionToCompany(connection, company, plan.id);

    await connection.query(
      `
      UPDATE companies
      SET plan_type = ?
      WHERE id = ?
      `,
      [plan.plan_name, company.id],
    );

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
