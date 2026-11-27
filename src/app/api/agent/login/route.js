import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import {
  AGENT_SESSION_COOKIE,
  createAgentSessionRecord,
  findAgentByCredentials,
  findCompaniesByAgentIdentifier,
  findCompanyBySlug,
  getAgentCookieOptions,
} from "@/lib/agentAuth";
import {
  findLatestCompanySubscription,
  isActiveCompanySubscription,
} from "@/lib/subscriptionAccess";

function whitelabelPath(company, agent, token) {
  const agentSlug = String(company.slug || "");
  const params = new URLSearchParams({
    token: String(token || ""),
    next: "admin/dashboard",
  });

  return `/agents/${encodeURIComponent(agentSlug)}/api/company/whitelabel?${params.toString()}`;
}

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    const companySlug = body.companySlug?.trim().toLowerCase();
    const identifier = body.identifier?.trim().toLowerCase();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email/user ID and password are required" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();

    let company = null;

    if (companySlug) {
      company = await findCompanyBySlug(connection, companySlug);
    } else {
      const companies = await findCompaniesByAgentIdentifier(
        connection,
        identifier,
      );

      if (companies.length > 1) {
        return NextResponse.json(
          {
            message:
              "Multiple workspaces found for this user. Please contact support.",
          },
          { status: 409 },
        );
      }

      company = companies[0] || null;
    }

    if (!company) {
      return NextResponse.json(
        { message: "Invalid agent credentials" },
        { status: 401 },
      );
    }

    const agent = await findAgentByCredentials(
      connection,
      company,
      identifier,
      password,
    );

    if (!agent) {
      return NextResponse.json(
        { message: "Invalid agent credentials" },
        { status: 401 },
      );
    }

    const subscription = await findLatestCompanySubscription(
      connection,
      company.id,
    );

    if (!isActiveCompanySubscription(company, subscription)) {
      // Keep the user authenticated on the public app so Stripe checkout can
      // resolve the company, but do not issue a tenant dashboard redirect.
      const publicSession = await createAgentSessionRecord(
        connection,
        agent,
        company,
      );
      const response = NextResponse.json(
        {
          ok: true,
          dashboardAccess: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: "Please select and activate a subscription to continue",
          redirectUrl: `/pricing?company=${encodeURIComponent(company.slug)}`,
        },
      );
      response.cookies.set(
        AGENT_SESSION_COOKIE,
        publicSession.cookieValue,
        getAgentCookieOptions(),
      );
      return response;
    }

    const agentSession = await createAgentSessionRecord(
      connection,
      agent,
      company,
    );

    const response = NextResponse.json({
      ok: true,
      redirectUrl: whitelabelPath(company, agent, agentSession.token),
    });
    response.cookies.set(
      AGENT_SESSION_COOKIE,
      agentSession.cookieValue,
      getAgentCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("Agent Login Error:", error);

    return NextResponse.json({ message: "Unable to log in" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
