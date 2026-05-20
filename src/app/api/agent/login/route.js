import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import {
  AGENT_SESSION_COOKIE,
  createAgentSessionRecord,
  findAgentByCredentials,
  findCompanyBySlug,
  getAgentCookieOptions,
} from "@/lib/agentAuth";

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    const companySlug = body.companySlug?.trim().toLowerCase();
    const identifier = body.identifier?.trim().toLowerCase();
    const password = body.password || "";

    if (!companySlug || !identifier || !password) {
      return NextResponse.json(
        { message: "Company slug, email/user ID, and password are required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    const company = await findCompanyBySlug(connection, companySlug);

    if (!company) {
      return NextResponse.json(
        { message: "Company workspace was not found" },
        { status: 404 }
      );
    }

    const agent = await findAgentByCredentials(
      connection,
      company,
      identifier,
      password
    );

    if (!agent) {
      return NextResponse.json(
        { message: "Invalid agent credentials" },
        { status: 401 }
      );
    }

    const agentSession = await createAgentSessionRecord(
      connection,
      agent,
      company
    );

    const response = NextResponse.json({
      ok: true,
      redirectUrl: "/dashboard",
    });
    response.cookies.set(
      AGENT_SESSION_COOKIE,
      agentSession.cookieValue,
      getAgentCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Agent Login Error:", error);

    return NextResponse.json(
      { message: "Unable to log in" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
