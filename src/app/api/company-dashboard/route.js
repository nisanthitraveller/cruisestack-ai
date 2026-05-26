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

function publicUrl(path) {
  return new URL(path, PUBLIC_APP_ORIGIN);
}

function redirectTo(path) {
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

function isActiveSubscription(company, subscription) {
  if (!company || !subscription) return false;

  const paymentStatus = String(subscription.payment_status || "").toLowerCase();
  const stripeStatus = String(subscription.stripe_status || "").toLowerCase();

  return (
    Number(company.status) === 1 &&
    Number(subscription.status) === 1 &&
    (paymentStatus === "paid" ||
      stripeStatus === "active" ||
      stripeStatus === "trialing" ||
      stripeStatus === "manual_active")
  );
}

export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("company") || "";

    if (!companySlug) {
      return redirectTo("/login?dashboard=missing-company");
    }

    connection = await pool.getConnection();

    const company = await findCompanyBySlug(connection, companySlug);

    if (!company) {
      return redirectTo("/login?dashboard=company-not-found");
    }

    const [subscriptions] = await connection.query(
      `
      SELECT payment_status, stripe_status, status
      FROM company_subscriptions
      WHERE company_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [company.id],
    );

    if (!isActiveSubscription(company, subscriptions[0] || null)) {
      return redirectTo(`/pricing?company=${encodeURIComponent(company.slug)}&dashboard=inactive`);
    }

    const agent = await findFirstCompanyAgent(connection, company);

    if (!agent) {
      return redirectTo(`/login?company=${company.slug}&dashboard=agent-not-found`);
    }

    const agentSession = await createAgentSessionRecord(
      connection,
      agent,
      company,
    );

    const response = redirectTo(
      whitelabelPath(company, agent, agentSession.token),
    );
    response.cookies.set(
      AGENT_SESSION_COOKIE,
      agentSession.cookieValue,
      getAgentCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("Company dashboard redirect error:", error);

    return redirectTo("/login?dashboard=error");
  } finally {
    if (connection) connection.release();
  }
}
