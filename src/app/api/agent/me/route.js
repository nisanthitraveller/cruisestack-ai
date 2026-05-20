import { NextResponse } from "next/server";
import { getAgentFromSession, getDashboardData } from "@/lib/agentAuth";

export async function GET(request) {
  const session = await getAgentFromSession(request);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const dashboard = await getDashboardData(session);

  if (!dashboard) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const agent = dashboard.agentDetails || dashboard.agent;

  return NextResponse.json({
    authenticated: true,
    agent: {
      name: agent?.name || agent?.email || agent?.user_id || "Agent",
      email: agent?.email || null,
      type: agent?.type || null,
    },
    company: {
      name: dashboard.company?.company_name || null,
      slug: dashboard.company?.slug || session.companySlug,
    },
  });
}
