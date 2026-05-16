import { NextResponse } from "next/server";
import { AGENT_SESSION_COOKIE } from "@/lib/agentAuth";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  response.cookies.set(AGENT_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
