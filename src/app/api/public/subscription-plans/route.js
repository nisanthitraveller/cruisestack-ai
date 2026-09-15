import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";

const excludedPlanNames = ["$1 Test", "TesT-Jeevan"];

export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const companySlug = String(searchParams.get("company") || "").trim();
    connection = await pool.getConnection();

    const [plans] = await connection.query(
      `
      SELECT
        id, plan_name, monthly_fee, booking_fee, trip_summary_fee,
        api_scan_fee, monthly_booking_limit, stripe_price_id,
        stripe_payment_link_url
      FROM subscription_plans
      WHERE status = 1
        AND plan_name NOT IN (?, ?)
      ORDER BY id ASC
      `,
      excludedPlanNames,
    );

    let billingMetric = "none";
    if (companySlug) {
      const [companies] = await connection.query(
        `SELECT billing_metric FROM companies WHERE slug = ? LIMIT 1`,
        [companySlug],
      );
      billingMetric = companies[0]?.billing_metric || "none";
    }

    return NextResponse.json({ billingMetric, plans });
  } catch (error) {
    console.error("Public subscription plans error:", error);
    return NextResponse.json(
      { message: "Unable to load subscription plans" },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}
