import { NextResponse } from "next/server";
import Stripe from "stripe";
import { appUrl } from "@/lib/appUrl";
import pool from "@/lib/db_mysql";
import {
  AGENT_SESSION_COOKIE,
  createAgentSession,
  findCompanyBySlug,
  findFirstCompanyAgent,
  getAgentCookieOptions,
} from "@/lib/agentAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function dashboardRedirect(request, path) {
  return NextResponse.redirect(appUrl(request, path));
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
    const companySlug = checkoutSession.client_reference_id;

    if (!companySlug) {
      return dashboardRedirect(request, "/login?checkout=missing-company");
    }

    const paid =
      checkoutSession.payment_status === "paid" ||
      checkoutSession.status === "complete";

    if (!paid) {
      return dashboardRedirect(request, `/login?company=${companySlug}&checkout=pending`);
    }

    connection = await pool.getConnection();

    const company = await findCompanyBySlug(connection, companySlug);

    if (!company) {
      return dashboardRedirect(request, "/login?checkout=company-not-found");
    }

    const agent = await findFirstCompanyAgent(connection, company);

    if (!agent) {
      return dashboardRedirect(request, `/login?company=${company.slug}&checkout=agent-not-found`);
    }

    const response = dashboardRedirect(request, "/dashboard");
    response.cookies.set(
      AGENT_SESSION_COOKIE,
      await createAgentSession(connection, agent, company),
      getAgentCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Checkout Success Login Error:", error);

    return dashboardRedirect(request, "/login?checkout=error");
  } finally {
    if (connection) connection.release();
  }
}
