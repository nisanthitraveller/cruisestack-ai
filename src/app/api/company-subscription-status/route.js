import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { findCompanyBySlug } from "@/lib/agentAuth";

function isActiveSubscription(company, subscription) {
  if (!company || !subscription) return false;

  const paymentStatus = String(subscription.payment_status || "").toLowerCase();
  const stripeStatus = String(subscription.stripe_status || "").toLowerCase();

  return (
    Number(company.status) === 1 &&
    Number(subscription.status) === 1 &&
    (paymentStatus === "paid" ||
      stripeStatus === "active" ||
      stripeStatus === "trialing" ||
      stripeStatus === "manual_active")
  );
}

export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("company") || "";

    if (!companySlug) {
      return NextResponse.json({ companyFound: false, isActive: false });
    }

    connection = await pool.getConnection();

    const company = await findCompanyBySlug(connection, companySlug);

    if (!company) {
      return NextResponse.json({ companyFound: false, isActive: false });
    }

    const [subscriptions] = await connection.query(
      `
      SELECT
        cs.id,
        cs.payment_status,
        cs.stripe_status,
        cs.current_period_start,
        cs.current_period_end,
        cs.status,
        cs.payment_method,
        cs.billing_cycle,
        sp.plan_name
      FROM company_subscriptions cs
      LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
      WHERE cs.company_id = ?
      ORDER BY cs.id DESC
      LIMIT 1
      `,
      [company.id],
    );

    const subscription = subscriptions[0] || null;

    return NextResponse.json({
      billingCycle: subscription?.billing_cycle || null,
      companyFound: true,
      companyName: company.company_name,
      companyStatus: company.status,
      currentPeriodEnd: subscription?.current_period_end || null,
      currentPeriodStart: subscription?.current_period_start || null,
      dashboardUrl: `/api/company-dashboard?company=${encodeURIComponent(company.slug)}`,
      hasSubscription: Boolean(subscription),
      isActive: isActiveSubscription(company, subscription),
      paymentMethod: subscription?.payment_method || "stripe",
      paymentStatus: subscription?.payment_status || null,
      planName: subscription?.plan_name || company.plan_type || null,
      stripeStatus: subscription?.stripe_status || null,
      subscriptionStatus: subscription?.status || null,
    });
  } catch (error) {
    console.error("Company subscription status error:", error);

    return NextResponse.json(
      { message: "Unable to check company subscription" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
