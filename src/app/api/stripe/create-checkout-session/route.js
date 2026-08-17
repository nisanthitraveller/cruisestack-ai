import { NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db_mysql";
import { getAgentFromSession } from "@/lib/agentAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PUBLIC_APP_ORIGIN = "https://cruisestack.ai";

export async function POST(request) {
  let connection;

  try {
    const agentSession = await getAgentFromSession(request);

    if (!agentSession) {
      return NextResponse.json(
        { message: "Please log in or create a company before choosing a plan" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const planName = String(body.planName || "").trim();

    connection = await pool.getConnection();

    const [plans] = await connection.query(
      `
      SELECT id, plan_name, stripe_price_id
      FROM subscription_plans
      WHERE plan_name = ?
        AND stripe_price_id IS NOT NULL
      LIMIT 1
      `,
      [planName],
    );

    if (!plans[0]) {
      return NextResponse.json({ message: "This plan is not available" }, { status: 400 });
    }

    const [activeSubscriptions] = await connection.query(
      `
      SELECT id
      FROM company_subscriptions
      WHERE company_id = ?
        AND status = 1
        AND (payment_status = 'Paid' OR stripe_status IN ('active', 'trialing'))
      LIMIT 1
      `,
      [agentSession.companyId],
    );

    if (activeSubscriptions[0]) {
      return NextResponse.json(
        { message: "This company already has an active subscription" },
        { status: 409 },
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plans[0].stripe_price_id, quantity: 1 }],
      client_reference_id: agentSession.companySlug,
      metadata: {
        company_id: String(agentSession.companyId),
        company_slug: agentSession.companySlug,
        plan_id: String(plans[0].id),
      },
      subscription_data: {
        metadata: {
          company_id: String(agentSession.companyId),
          company_slug: agentSession.companySlug,
          plan_id: String(plans[0].id),
        },
      },
      success_url: `${PUBLIC_APP_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_APP_ORIGIN}/pricing?company=${encodeURIComponent(agentSession.companySlug)}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create Checkout Session Error:", error);
    return NextResponse.json({ message: "Unable to start checkout" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
