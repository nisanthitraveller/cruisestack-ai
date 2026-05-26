import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import {
  ADMINMASTER_SESSION_COOKIE,
  createAdminMasterSessionCookie,
  findAdminMasterByCredentials,
  getAdminMasterCookieOptions,
} from "@/lib/adminMasterAuth";

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    const identifier = body.identifier?.trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email/user ID and password are required" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();

    const admin = await findAdminMasterByCredentials(
      connection,
      identifier,
      password,
    );

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid master admin credentials" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      ok: true,
      redirectUrl: "/adminmaster/subscriptions",
    });
    response.cookies.set(
      ADMINMASTER_SESSION_COOKIE,
      createAdminMasterSessionCookie(admin),
      getAdminMasterCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("Adminmaster login error:", error);

    return NextResponse.json(
      { message: "Unable to log in" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
