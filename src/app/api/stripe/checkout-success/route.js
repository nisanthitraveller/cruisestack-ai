import { NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db_mysql";
import {
  AGENT_SESSION_COOKIE,
  createAgentSessionRecord,
  findCompanyBySlug,
  findFirstCompanyAgent,
  getAgentCookieOptions,
} from "@/lib/agentAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PUBLIC_APP_ORIGIN = "https://cruisestack.ai";

function publicUrl(path) {
  return new URL(path, PUBLIC_APP_ORIGIN);
}

function dashboardRedirect(_request, path) {
  return NextResponse.redirect(publicUrl(path));
}

function tripSummaryPath(company, agent, token) {
  const agentSlug = String(agent?.agency_code || company.slug || "");
  const params = new URLSearchParams({
    token: String(token || ""),
    next: "admin/dashboard",
  });

  return `/agents/${encodeURIComponent(agentSlug)}/api/company/whitelabel?${params.toString()}`;
}

export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return dashboardRedirect(request, "/login?checkout=missing-session");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    let companySlug = checkoutSession.client_reference_id;

    const paid =
      checkoutSession.payment_status === "paid" ||
      checkoutSession.status === "complete";

    if (!paid) {
      return dashboardRedirect(
        request,
        `/login${companySlug ? `?company=${encodeURIComponent(companySlug)}&` : "?"}checkout=pending`,
      );
    }

    connection = await pool.getConnection();

    let company = companySlug
      ? await findCompanyBySlug(connection, companySlug)
      : null;

    if (!company && checkoutSession.customer_details?.email) {
      const [companies] = await connection.query(
        `
        SELECT id, company_name, slug, logo, primary_color, secondary_color,
               support_email, currency, plan_type, status
        FROM companies
        WHERE LOWER(support_email) = LOWER(?)
        LIMIT 2
        `,
        [checkoutSession.customer_details.email],
      );
      company = companies.length === 1 ? companies[0] : null;
      companySlug = company?.slug || null;
    }

    if (!company) {
      return dashboardRedirect(request, "/login?checkout=company-not-found");
    }

    const agent = await findFirstCompanyAgent(connection, company);

    if (!agent) {
      return dashboardRedirect(
        request,
        `/login?company=${company.slug}&checkout=agent-not-found`,
      );
    }

    const agentSession = await createAgentSessionRecord(
      connection,
      agent,
      company,
    );

    const response = dashboardRedirect(
      request,
      tripSummaryPath(company, agent, agentSession.token),
    );
    response.cookies.set(
      AGENT_SESSION_COOKIE,
      agentSession.cookieValue,
      getAgentCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("Checkout Success Login Error:", error);

    return dashboardRedirect(request, "/login?checkout=error");
  } finally {
    if (connection) connection.release();
  }
}
