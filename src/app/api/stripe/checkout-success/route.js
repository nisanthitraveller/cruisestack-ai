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

function agentWhitelabelPath(agent, agentSession) {
  return `/agents/${encodeURIComponent(
    agent.slug,
  )}/whitelabel?token=${encodeURIComponent(agentSession.token)}`;
}

function wantsJsonResponse(searchParams) {
  return searchParams.get("format") === "json";
}

export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const jsonResponse = wantsJsonResponse(searchParams);

    if (!sessionId) {
      return dashboardRedirect(request, "/login?checkout=missing-session");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const companySlug = checkoutSession.client_reference_id;

    if (!companySlug) {
      return dashboardRedirect(request, "/login?checkout=missing-company");
    }

    const paid =
      checkoutSession.payment_status === "paid" ||
      checkoutSession.status === "complete";

    if (!paid) {
      return dashboardRedirect(
        request,
        `/login?company=${companySlug}&checkout=pending`,
      );
    }

    connection = await pool.getConnection();

    const company = await findCompanyBySlug(connection, companySlug);

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

    const redirectPath = agentWhitelabelPath(agent, agentSession);
    const response = jsonResponse
      ? NextResponse.json({
          ok: true,
          redirectUrl: publicUrl(redirectPath).toString(),
        })
      : dashboardRedirect(request, redirectPath);

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
