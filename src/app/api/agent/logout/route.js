import { NextResponse } from "next/server";
import { appUrl } from "@/lib/appUrl";
import { AGENT_SESSION_COOKIE, clearAgentSession } from "@/lib/agentAuth";

export async function POST(request) {
  await clearAgentSession(request);

  const response = NextResponse.redirect(appUrl(request, "/login"), 303);

  response.cookies.set(AGENT_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
