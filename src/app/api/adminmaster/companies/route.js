import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import bcrypt from "bcryptjs";

const allowedActions = new Set([
  "add_agent",
  "delete",
  "list_agents",
  "set_status",
  "update",
]);
const allowedCompanyTypes = new Set(["B2B", "B2C"]);
const allowedPlans = new Set(["Beginner", "Professional", "Enterprise"]);
const allowedBillingMetrics = new Set(["none", "booking_count", "trip_summary_count"]);
const reservedWorkspacePrefixes = new Set([
  "company",
  "cruisestack",
  "stripe",
  "subscription",
  "tour",
]);

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

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeCompanyUpdate(body) {
  return {
    chatbot: Number(body.chatbot) === 1 ? 1 : 0,
    Blockingonly_flag: Number(body.Blockingonly_flag) === 1 ? 1 : 0,
    deals_enabled: Number(body.deals_enabled) === 1 ? 1 : 0,
    enable_commission_sync:
      Number(body.enable_commission_sync) === 1 ? 1 : 0,
    billing_metric: String(body.billing_metric || "").trim(),
    company_name: String(body.company_name || "").trim(),
    company_type: String(body.company_type || "").trim().toUpperCase(),
    currency: String(body.currency || "").trim().toUpperCase(),
    domain: String(body.domain || "").trim(),
    plan_type: String(body.plan_type || "").trim(),
    primary_color: String(body.primary_color || "").trim(),
    secondary_color: String(body.secondary_color || "").trim(),
    special_discount_enabled:
      Number(body.special_discount_enabled) === 1 ? 1 : 0,
    special_discount_percentage: Number(body.special_discount_percentage),
    status: Number(body.status) === 1 ? 1 : 0,
    support_email: String(body.support_email || "").trim().toLowerCase(),
  };
}

function validateCompanyUpdate(company) {
  if (!company.company_name || company.company_name.length > 150) {
    throw httpError("Company name is required and must be 150 characters or fewer");
  }

  if (company.domain.length > 255) {
    throw httpError("Domain must be 255 characters or fewer");
  }

  if (
    company.support_email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.support_email)
  ) {
    throw httpError("Enter a valid support email address");
  }

  if (!/^[A-Z]{3}$/.test(company.currency)) {
    throw httpError("Currency must be a three-letter code such as USD or INR");
  }

  if (!allowedPlans.has(company.plan_type)) {
    throw httpError("Invalid company plan");
  }

  if (!allowedCompanyTypes.has(company.company_type)) {
    throw httpError("Invalid company type");
  }

  if (!allowedBillingMetrics.has(company.billing_metric)) {
    throw httpError("Invalid billing metric");
  }

  if (
    !Number.isFinite(company.special_discount_percentage) ||
    company.special_discount_percentage < 0 ||
    company.special_discount_percentage > 100
  ) {
    throw httpError("Special discount percentage must be between 0 and 100");
  }

  if (
    company.special_discount_enabled === 1 &&
    company.company_type !== "B2C"
  ) {
    throw httpError("Special discount can only be enabled for a B2C company");
  }

  if (!/^#[0-9a-f]{6}$/i.test(company.primary_color)) {
    throw httpError("Primary colour must use the format #003366");
  }

  if (!/^#[0-9a-f]{6}$/i.test(company.secondary_color)) {
    throw httpError("Secondary colour must use the format #ffffff");
  }
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

async function deleteCompanyRowsIfTableExists(connection, tableName, companyId) {
  if (!(await tableExists(connection, tableName))) return;

  await connection.query(
    `DELETE FROM ${quoteIdentifier(tableName)} WHERE company_id = ?`,
    [companyId],
  );
}

async function clearCompanySessions(connection, slug) {
  const tablePrefix = tableSafePrefix(slug);
  const sessionTable = `${tablePrefix}_whitelabel_sessions`;

  if (!tablePrefix || !(await tableExists(connection, sessionTable))) return;

  await connection.query(`DELETE FROM ${quoteIdentifier(sessionTable)}`);
}

async function listTenantTables(connection, slug) {
  const tablePrefix = tableSafePrefix(slug);

  if (!tablePrefix) {
    throw httpError("Company has an invalid workspace slug", 409);
  }

  if (reservedWorkspacePrefixes.has(tablePrefix)) {
    throw httpError(
      "This company uses a reserved workspace prefix and cannot be permanently deleted here",
      409,
    );
  }

  const prefixWithSeparator = `${tablePrefix}_`;
  const [rows] = await connection.query(
    `
    SELECT TABLE_NAME AS table_name
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      AND LEFT(TABLE_NAME, ?) = ?
    ORDER BY TABLE_NAME ASC
    `,
    [prefixWithSeparator.length, prefixWithSeparator],
  );

  return rows.map((row) => row.table_name).filter(Boolean);
}

async function findCompany(connection, companyId) {
  const [rows] = await connection.query(
    `
    SELECT
      c.id,
      c.company_name,
      c.slug,
      c.status,
      cs.payment_method,
      cs.stripe_status,
      cs.stripe_subscription_id
    FROM companies c
    LEFT JOIN company_subscriptions cs
      ON cs.id = (
        SELECT latest_cs.id
        FROM company_subscriptions latest_cs
        WHERE latest_cs.company_id = c.id
        ORDER BY latest_cs.id DESC
        LIMIT 1
      )
    WHERE c.id = ?
    LIMIT 1
    `,
    [companyId],
  );

  return rows[0] || null;
}

async function getCompanyAgents(connection, company) {
  const tablePrefix = tableSafePrefix(company.slug);
  const agentTable = `${tablePrefix}_agent`;
  const commissionTable = `${tablePrefix}_agent_commission`;

  if (
    !(await tableExists(connection, agentTable)) ||
    !(await tableExists(connection, commissionTable))
  ) {
    throw httpError("Agent tables are not available for this company", 409);
  }

  const [rows] = await connection.query(
    `
    SELECT
      a.id,
      a.name,
      a.email,
      a.mobile,
      a.type,
      a.user_id,
      a.status,
      COUNT(ac.id) AS commission_count
    FROM ${quoteIdentifier(agentTable)} a
    LEFT JOIN ${quoteIdentifier(commissionTable)} ac
      ON ac.tour_agent_id = a.id
     AND ac.company_id = a.company_id
    WHERE a.company_id = ?
    GROUP BY
      a.id, a.name, a.email, a.mobile, a.type, a.user_id, a.status
    ORDER BY a.type = 'Admin' DESC, a.id ASC
    `,
    [company.id],
  );

  return rows;
}

async function addCompanyAgent(connection, company, body) {
  const tablePrefix = tableSafePrefix(company.slug);
  const agentTable = `${tablePrefix}_agent`;
  const commissionTable = `${tablePrefix}_agent_commission`;
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const mobile = String(body.mobile || "").trim();
  const userId = String(body.user_id || "").trim().toLowerCase();
  const password = String(body.password || "");
  const sourceAgentId = Number(body.source_agent_id || 0);

  if (!name || name.length > 150) {
    throw httpError("Agent name is required and must be 150 characters or fewer");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError("Enter a valid agent email address");
  }
  if (!userId || userId.length > 100) {
    throw httpError("User ID is required and must be 100 characters or fewer");
  }
  if (password.length < 8) {
    throw httpError("Password must be at least 8 characters");
  }
  if (!sourceAgentId) {
    throw httpError("Select an existing agent to copy commission details from");
  }
  if (
    !(await tableExists(connection, agentTable)) ||
    !(await tableExists(connection, commissionTable))
  ) {
    throw httpError("Agent tables are not available for this company", 409);
  }

  const [sourceAgents] = await connection.query(
    `SELECT id
     FROM ${quoteIdentifier(agentTable)}
     WHERE id = ? AND company_id = ?
     LIMIT 1`,
    [sourceAgentId, company.id],
  );
  if (!sourceAgents[0]) {
    throw httpError("The selected commission source agent was not found", 404);
  }

  const [sourceCommissionCount] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM ${quoteIdentifier(commissionTable)}
     WHERE tour_agent_id = ? AND company_id = ?`,
    [sourceAgentId, company.id],
  );
  if (Number(sourceCommissionCount[0]?.total || 0) === 0) {
    throw httpError("The selected agent has no commission details to copy", 409);
  }

  const [duplicates] = await connection.query(
    `SELECT id
     FROM ${quoteIdentifier(agentTable)}
     WHERE company_id = ? AND (LOWER(email) = ? OR LOWER(user_id) = ?)
     LIMIT 1`,
    [company.id, email, userId],
  );
  if (duplicates[0]) {
    throw httpError("An agent with this email or user ID already exists", 409);
  }

  const [agentResult] = await connection.query(
    `INSERT INTO ${quoteIdentifier(agentTable)}
      (name, email, password, mobile, company_name, address,
       primary_contact_name, gst_number, bank_name, bank_account_number,
       bank_account_name, ifsc_code, branch_name, logo, status, type, user_id,
       agency_code, company_id)
     VALUES (?, ?, ?, ?, ?, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL,
             NULL, 1, 'Agent', ?, ?, ?)`,
    [
      name,
      email,
      await bcrypt.hash(password, 10),
      mobile || null,
      company.company_name,
      name,
      userId,
      company.slug,
      company.id,
    ],
  );

  const [commissionResult] = await connection.query(
    `INSERT INTO ${quoteIdentifier(commissionTable)}
      (tour_agent_id, cruiseline_id, commission, discount, markup,
       gmc_discount, created_at, updated_at, status, company_id)
     SELECT ?, cruiseline_id, commission, discount, markup, gmc_discount,
            NOW(), NOW(), status, ?
     FROM ${quoteIdentifier(commissionTable)}
     WHERE tour_agent_id = ? AND company_id = ?`,
    [agentResult.insertId, company.id, sourceAgentId, company.id],
  );

  return {
    agentId: agentResult.insertId,
    commissionsCopied: commissionResult.affectedRows,
  };
}

async function permanentlyDeleteCompany(connection, company, confirmation) {
  if (confirmation !== company.company_name) {
    throw httpError("Company-name confirmation did not match", 400);
  }

  const stripeStatus = String(company.stripe_status || "").toLowerCase();
  const hasLiveStripeSubscription =
    company.stripe_subscription_id &&
    !["canceled", "incomplete_expired"].includes(stripeStatus);

  if (hasLiveStripeSubscription) {
    throw httpError(
      "Cancel the active Stripe subscription before permanently deleting this company",
      409,
    );
  }

  const tenantTables = await listTenantTables(connection, company.slug);

  await connection.query("UPDATE companies SET status = 0 WHERE id = ?", [
    company.id,
  ]);

  await deleteCompanyRowsIfTableExists(
    connection,
    "company_api_keys",
    company.id,
  );
  await deleteCompanyRowsIfTableExists(
    connection,
    "company_billing_history",
    company.id,
  );
  await deleteCompanyRowsIfTableExists(
    connection,
    "stripe_webhook_events",
    company.id,
  );
  await deleteCompanyRowsIfTableExists(
    connection,
    "company_subscriptions",
    company.id,
  );
  await deleteCompanyRowsIfTableExists(
    connection,
    "cruisestack_deal",
    company.id,
  );

  for (const tableName of tenantTables) {
    await connection.query(`DROP TABLE IF EXISTS ${quoteIdentifier(tableName)}`);
  }

  await connection.query("DELETE FROM companies WHERE id = ?", [company.id]);
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
    const action = String(body.action || "");
    const companyId = Number(body.companyId || 0);

    if (!companyId || !allowedActions.has(action)) {
      return NextResponse.json(
        { message: "Invalid company action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    const company = await findCompany(connection, companyId);

    if (!company) {
      return NextResponse.json(
        { message: "Company was not found" },
        { status: 404 },
      );
    }

    if (action === "list_agents") {
      return NextResponse.json({
        success: true,
        agents: await getCompanyAgents(connection, company),
      });
    }

    if (action === "add_agent") {
      await connection.beginTransaction();
      const result = await addCompanyAgent(connection, company, body);
      await connection.commit();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "update") {
      const update = normalizeCompanyUpdate(body);
      validateCompanyUpdate(update);

      await connection.query(
        `
        UPDATE companies
        SET
          company_name = ?,
          domain = ?,
          support_email = ?,
          currency = ?,
          plan_type = ?,
          company_type = ?,
          special_discount_enabled = ?,
          special_discount_percentage = ?,
          primary_color = ?,
          secondary_color = ?,
          status = ?,
          chatbot = ?,
          Blockingonly_flag = ?,
          deals_enabled = ?,
          enable_commission_sync = ?,
          billing_metric = ?
        WHERE id = ?
        LIMIT 1
        `,
        [
          update.company_name,
          update.domain || null,
          update.support_email || null,
          update.currency,
          update.plan_type,
          update.company_type,
          update.special_discount_enabled,
          update.special_discount_percentage,
          update.primary_color,
          update.secondary_color,
          update.status,
          update.chatbot,
          update.Blockingonly_flag,
          update.deals_enabled,
          update.enable_commission_sync,
          update.billing_metric,
          company.id,
        ],
      );

      if (update.status === 0) {
        await clearCompanySessions(connection, company.slug);
      }
    }

    if (action === "set_status") {
      const status = Number(body.status) === 1 ? 1 : 0;
      await connection.query(
        "UPDATE companies SET status = ? WHERE id = ? LIMIT 1",
        [status, company.id],
      );

      if (status === 0) {
        await clearCompanySessions(connection, company.slug);
      }
    }

    if (action === "delete") {
      await permanentlyDeleteCompany(
        connection,
        company,
        String(body.confirmation || ""),
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }
    console.error("Adminmaster company action error:", error);

    return NextResponse.json(
      { message: error.message || "Unable to update company" },
      { status: Number(error.statusCode) || 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
