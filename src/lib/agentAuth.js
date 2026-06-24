import crypto from "crypto";
import bcrypt from "bcryptjs";
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

export function getAgentCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

function getCookieValue(source, name) {
  if (!source) return null;

  if (typeof source.get === "function") {
    const cookie = source.get(name);
    if (typeof cookie === "string") return cookie;
    return cookie?.value || null;
  }

  if (typeof source.cookies?.get === "function") {
    const cookie = source.cookies.get(name);
    if (typeof cookie === "string") return cookie;
    return cookie?.value || null;
  }

  const cookieHeader =
    typeof source.headers?.get === "function"
      ? source.headers.get("cookie")
      : source.headers?.cookie;

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const matchedCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return matchedCookie
    ? decodeURIComponent(matchedCookie.slice(name.length + 1))
    : null;
}

function createSessionExpiry() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

function getWhitelabelSessionTable(companySlug) {
  return `${tableSafePrefix(companySlug)}_whitelabel_sessions`;
}

function encodeSessionCookie(companySlug, token) {
  return `${companySlug}.${token}`;
}

function decodeSessionCookie(value) {
  if (!value || typeof value !== "string") return null;

  const separatorIndex = value.indexOf(".");
  if (separatorIndex === -1) return null;

  const companySlug = value.slice(0, separatorIndex);
  const token = value.slice(separatorIndex + 1);

  if (!companySlug || !token) return null;

  return { companySlug, token };
}

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ""));
}

async function passwordMatches(inputPassword, storedPassword) {
  if (!storedPassword) return false;

  const storedValue = String(storedPassword);

  if (!isBcryptHash(storedValue)) {
    return storedValue === inputPassword;
  }

  return bcrypt.compare(inputPassword, storedValue);
}

export async function createAgentSessionRecord(connection, agent, company) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = createSessionExpiry();
  const sessionTable = getWhitelabelSessionTable(company.slug);

  await connection.query(
    `
    INSERT INTO \`${sessionTable}\`
      (token, agent_id, expires_at)
    VALUES
      (?, ?, ?)
    `,
    [token, agent.id, expiresAt]
  );

  return {
    token,
    cookieValue: encodeSessionCookie(company.slug, token),
  };
}

export async function createAgentSession(connection, agent, company) {
  const session = await createAgentSessionRecord(connection, agent, company);

  return session.cookieValue;
}

export async function getAgentFromSession(source) {
  const sessionCookie = decodeSessionCookie(
    getCookieValue(source, AGENT_SESSION_COOKIE)
  );

  if (!sessionCookie) return null;

  const connection = await pool.getConnection();

  try {
    const company = await findCompanyBySlug(connection, sessionCookie.companySlug);

    if (!company) return null;

    const sessionTable = getWhitelabelSessionTable(company.slug);

    const [sessions] = await connection.query(
      `
      SELECT
        token,
        agent_id AS agentId,
        expires_at AS expiresAt
      FROM \`${sessionTable}\`
      WHERE token = ?
        AND expires_at > NOW()
      LIMIT 1
      `,
      [sessionCookie.token]
    );

    if (!sessions[0]) return null;

    return {
      token: sessionCookie.token,
      companyId: company.id,
      companySlug: company.slug,
      agentId: sessions[0].agentId,
      expiresAt: sessions[0].expiresAt,
    };
  } finally {
    connection.release();
  }
}

export async function clearAgentSession(source) {
  const sessionCookie = decodeSessionCookie(
    getCookieValue(source, AGENT_SESSION_COOKIE)
  );

  if (!sessionCookie) return;

  const connection = await pool.getConnection();

  try {
    const company = await findCompanyBySlug(connection, sessionCookie.companySlug);

    if (!company) return;

    const sessionTable = getWhitelabelSessionTable(company.slug);

    await connection.query(`DELETE FROM \`${sessionTable}\` WHERE token = ?`, [
      sessionCookie.token,
    ]);
  } finally {
    connection.release();
  }
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

export async function findCompaniesByAgentIdentifier(connection, identifier) {
  const [companies] = await connection.query(
    `
    SELECT id, company_name, slug, logo, primary_color, secondary_color, support_email, currency, plan_type, status
    FROM companies
    WHERE status = 1
    ORDER BY id ASC
    `
  );

  const matches = [];

  for (const company of companies) {
    const tablePrefix = tableSafePrefix(company.slug);
    const agentTable = `${tablePrefix}_agent`;

    try {
      const [agents] = await connection.query(
        `
        SELECT id
        FROM \`${agentTable}\`
        WHERE company_id = ?
          AND status = 1
          AND (email = ? OR user_id = ?)
        LIMIT 1
        `,
        [company.id, identifier, identifier]
      );

      if (agents[0]) {
        matches.push(company);
      }
    } catch (error) {
      if (error?.code !== "ER_NO_SUCH_TABLE") {
        throw error;
      }
    }
  }

  return matches;
}

export async function findAgentByCredentials(connection, company, identifier, password) {
  const tablePrefix = tableSafePrefix(company.slug);
  const agentTable = `${tablePrefix}_agent`;

  const [agents] = await connection.query(
    `
    SELECT id, name, email, password, type, user_id, agency_code, company_id, status
    FROM \`${agentTable}\`
    WHERE company_id = ?
      AND status = 1
      AND (email = ? OR user_id = ?)
    LIMIT 1
    `,
    [company.id, identifier, identifier]
  );

  if (!agents[0] || !(await passwordMatches(password, agents[0].password))) {
    return null;
  }

  if (!isBcryptHash(agents[0].password)) {
    await connection.query(
      `
      UPDATE \`${agentTable}\`
      SET password = ?
      WHERE id = ?
      LIMIT 1
      `,
      [await bcrypt.hash(password, 10), agents[0].id]
    );
  }

  delete agents[0].password;

  return {
    ...agents[0],
    slug: agents[0].agency_code || company.slug,
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
    slug: agents[0].agency_code || company.slug,
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
    const agentTable = `${tablePrefix}_agent`;
    const commissionTable = `${tablePrefix}_agent_commission`;

    const [agents] = await connection.query(
      `
      SELECT
        id,
        name,
        email,
        mobile,
        company_name,
        address,
        primary_contact_name,
        gst_number,
        bank_name,
        bank_account_number,
        bank_account_name,
        ifsc_code,
        branch_name,
        logo,
        status,
        type,
        user_id,
        agency_code,
        company_id
      FROM \`${agentTable}\`
      WHERE company_id = ?
        AND id = ?
      LIMIT 1
      `,
      [company.id, session.agentId]
    );

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
      ORDER BY CAST(discount AS DECIMAL(10, 4)) DESC, cruiseline_id ASC
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
      agentDetails: agents[0] || null,
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
