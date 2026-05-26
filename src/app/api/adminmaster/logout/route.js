import { NextResponse } from "next/server";
import { ADMINMASTER_SESSION_COOKIE } from "@/lib/adminMasterAuth";

function appUrl(request, path) {
  return new URL(path, request.url);
}

export async function POST(request) {
  const response = NextResponse.redirect(appUrl(request, "/adminmaster/login"), 303);

  response.cookies.set(ADMINMASTER_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
