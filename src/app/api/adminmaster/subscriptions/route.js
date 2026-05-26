import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";

const allowedActions = new Set(["activate", "block", "update_cycle"]);
const billingCycles = new Set(["monthly", "yearly"]);

function addBillingCycle(date, billingCycle) {
  const next = new Date(date);

  if (billingCycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    const subscriptionId = Number(body.subscriptionId || 0);
    const action = String(body.action || "");
    const billingCycle = billingCycles.has(body.billingCycle)
      ? body.billingCycle
      : "monthly";

    if (!subscriptionId || !allowedActions.has(action)) {
      return NextResponse.json(
        { message: "Invalid subscription action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [subscriptions] = await connection.query(
      `
      SELECT id, company_id, payment_method
      FROM company_subscriptions
      WHERE id = ?
      LIMIT 1
      `,
      [subscriptionId],
    );
    const subscription = subscriptions[0];

    if (!subscription) {
      await connection.rollback();

      return NextResponse.json(
        { message: "Subscription was not found" },
        { status: 404 },
      );
    }

    if (subscription.payment_method !== "manual") {
      await connection.rollback();

      return NextResponse.json(
        { message: "Only manual payment subscriptions can be controlled here" },
        { status: 400 },
      );
    }

    if (action === "block") {
      await connection.query(
        `
        UPDATE company_subscriptions
        SET
          status = 0,
          payment_status = 'Cancelled',
          stripe_status = 'manual_blocked'
        WHERE id = ?
        `,
        [subscriptionId],
      );

      await connection.query(
        `
        UPDATE companies
        SET status = 0
        WHERE id = ?
        `,
        [subscription.company_id],
      );
    }

    if (action === "activate") {
      await connection.query(
        `
        UPDATE company_subscriptions
        SET
          status = 1,
          payment_status = 'Paid',
          stripe_status = 'manual_active'
        WHERE id = ?
        `,
        [subscriptionId],
      );

      await connection.query(
        `
        UPDATE companies
        SET status = 1
        WHERE id = ?
        `,
        [subscription.company_id],
      );
    }

    if (action === "update_cycle") {
      const now = new Date();
      const periodEnd = addBillingCycle(now, billingCycle);

      await connection.query(
        `
        UPDATE company_subscriptions
        SET
          billing_cycle = ?,
          start_date = DATE(?),
          end_date = DATE(?),
          current_period_start = ?,
          current_period_end = ?,
          status = 1,
          payment_status = 'Paid',
          stripe_status = 'manual_active'
        WHERE id = ?
        `,
        [billingCycle, now, periodEnd, now, periodEnd, subscriptionId],
      );

      await connection.query(
        `
        UPDATE companies
        SET status = 1
        WHERE id = ?
        `,
        [subscription.company_id],
      );
    }

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Adminmaster subscription update error:", error);

    return NextResponse.json(
      { message: error.message || "Unable to update subscription" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
