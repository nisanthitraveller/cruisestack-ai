import crypto from "crypto";
import pool from "./db_mysql";

export const AGENT_SESSION_COOKIE = "cruisestack_agent_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function tableSafePrefix(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
}

function getSessionSecret() {
  return (
    process.env.AGENT_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "cruisestack-dev-agent-session-secret"
  );
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlJson(value) {
  return base64UrlEncode(JSON.stringify(value));
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAgentSessionToken(agent) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    agentId: agent.id,
    companyId: agent.company_id,
    companySlug: agent.company_slug,
    email: agent.email,
    name: agent.name,
    type: agent.type,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlJson(payload);

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAgentSessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getAgentCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function findCompanyBySlug(connection, slug) {
  const [companies] = await connection.query(
    `
    SELECT id, company_name, slug, logo, primary_color, secondary_color, support_email, currency, plan_type, status
    FROM companies
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return companies[0] || null;
}

export async function findAgentByCredentials(connection, company, identifier, password) {
  const tablePrefix = tableSafePrefix(company.slug);
  const agentTable = `${tablePrefix}_agent`;

  const [agents] = await connection.query(
    `
    SELECT id, name, email, type, user_id, agency_code, company_id, status
    FROM \`${agentTable}\`
    WHERE company_id = ?
      AND status = 1
      AND (email = ? OR user_id = ?)
      AND password = ?
    LIMIT 1
    `,
    [company.id, identifier, identifier, password]
  );

  if (!agents[0]) return null;

  return {
    ...agents[0],
    company_slug: company.slug,
  };
}

export async function findFirstCompanyAgent(connection, company) {
  const tablePrefix = tableSafePrefix(company.slug);
  const agentTable = `${tablePrefix}_agent`;

  const [agents] = await connection.query(
    `
    SELECT id, name, email, type, user_id, agency_code, company_id, status
    FROM \`${agentTable}\`
    WHERE company_id = ?
      AND status = 1
    ORDER BY type = 'Admin' DESC, id ASC
    LIMIT 1
    `,
    [company.id]
  );

  if (!agents[0]) return null;

  return {
    ...agents[0],
    company_slug: company.slug,
  };
}

export async function getDashboardData(session) {
  const connection = await pool.getConnection();

  try {
    const company = await findCompanyBySlug(connection, session.companySlug);

    if (!company || company.id !== session.companyId) {
      return null;
    }

    const tablePrefix = tableSafePrefix(company.slug);
    const commissionTable = `${tablePrefix}_agent_commission`;

    const [subscriptions] = await connection.query(
      `
      SELECT
        cs.id,
        cs.payment_status,
        cs.stripe_status,
        cs.current_period_start,
        cs.current_period_end,
        cs.cancel_at_period_end,
        cs.stripe_subscription_id,
        cs.stripe_checkout_session_id,
        sp.plan_name,
        sp.booking_fee,
        sp.trip_summary_fee,
        sp.api_scan_fee
      FROM company_subscriptions cs
      LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
      WHERE cs.company_id = ?
      ORDER BY cs.id DESC
      LIMIT 1
      `,
      [company.id]
    );

    const [billingHistory] = await connection.query(
      `
      SELECT invoice_no, billing_month, total_amount, payment_status, hosted_invoice_url, invoice_pdf, paid_at
      FROM company_billing_history
      WHERE company_id = ?
      ORDER BY id DESC
      LIMIT 5
      `,
      [company.id]
    );

    const [commissionRows] = await connection.query(
      `
      SELECT cruiseline_id, commission, discount, markup, gmc_discount, status
      FROM \`${commissionTable}\`
      WHERE company_id = ?
        AND tour_agent_id = ?
      ORDER BY id ASC
      LIMIT 8
      `,
      [company.id, session.agentId]
    );

    const [commissionSummaryRows] = await connection.query(
      `
      SELECT
        COUNT(*) AS total_rows,
        AVG(commission) AS average_commission,
        AVG(discount) AS average_discount,
        AVG(markup) AS average_markup
      FROM \`${commissionTable}\`
      WHERE company_id = ?
        AND tour_agent_id = ?
      `,
      [company.id, session.agentId]
    );

    return {
      agent: session,
      company,
      subscription: subscriptions[0] || null,
      billingHistory,
      commissionRows,
      commissionSummary: commissionSummaryRows[0] || null,
    };
  } finally {
    connection.release();
  }
}
