import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizePlanUpdate(body) {
  return {
    api_scan_fee: Number(body.api_scan_fee),
    booking_fee: Number(body.booking_fee),
    monthly_booking_limit: Number(body.monthly_booking_limit),
    stripe_price_id: String(body.stripe_price_id || "").trim(),
    stripe_product_id: String(body.stripe_product_id || "").trim(),
    trip_summary_fee: Number(body.trip_summary_fee),
  };
}

function validatePlanUpdate(plan) {
  if (!Number.isFinite(plan.booking_fee) || plan.booking_fee < 0) {
    throw httpError("Booking fee must be zero or greater");
  }

  if (
    !Number.isFinite(plan.monthly_booking_limit) ||
    plan.monthly_booking_limit < 0 ||
    !Number.isInteger(plan.monthly_booking_limit)
  ) {
    throw httpError("Monthly booking limit must be a whole number of zero or greater");
  }

  if (!Number.isFinite(plan.trip_summary_fee) || plan.trip_summary_fee < 0) {
    throw httpError("Trip summary fee must be zero or greater");
  }

  if (!Number.isFinite(plan.api_scan_fee) || plan.api_scan_fee < 0) {
    throw httpError("API scan fee must be zero or greater");
  }
}

export async function POST(request) {
  let connection;

  try {
    const admin = await getAdminMasterFromSession(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Master admin login required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const action = String(body.action || "");
    const planId = Number(body.planId || 0);

    if (!planId || !["update", "create_stripe_price"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid subscription plan action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();

    if (action === "create_stripe_price") {
      if (!stripe) {
        throw httpError("Stripe secret key is not configured", 500);
      }

      const monthlyPrice = Number(body.monthlyPrice);
      if (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0) {
        throw httpError("Monthly price must be greater than zero");
      }

      const unitAmount = Math.round(monthlyPrice * 100);
      if (Math.abs(unitAmount / 100 - monthlyPrice) > 0.000001) {
        throw httpError("Monthly price can have a maximum of two decimal places");
      }

      const [plans] = await connection.query(
        `SELECT * FROM subscription_plans WHERE id = ? AND status = 1 LIMIT 1`,
        [planId],
      );
      const currentPlan = plans[0];

      if (!currentPlan) {
        throw httpError("The active subscription plan was not found", 404);
      }

      if (!["Professional", "Enterprise"].includes(currentPlan.plan_name)) {
        throw httpError("Stripe price creation is only available for Professional and Enterprise plans");
      }

      let stripeProductId = currentPlan.stripe_product_id;
      let createdProductId = null;
      let newStripePrice = null;

      try {
        if (!stripeProductId) {
          const product = await stripe.products.create({
            name: currentPlan.plan_name,
            metadata: { subscription_plan_id: String(currentPlan.id) },
          });
          stripeProductId = product.id;
          createdProductId = product.id;
        }

        newStripePrice = await stripe.prices.create({
          currency: "usd",
          nickname: `${currentPlan.plan_name} $${monthlyPrice}/month`,
          product: stripeProductId,
          recurring: { interval: "month" },
          unit_amount: unitAmount,
          metadata: {
            previous_plan_id: String(currentPlan.id),
            plan_name: currentPlan.plan_name,
          },
        });

        await connection.beginTransaction();
        await connection.query(
          `UPDATE subscription_plans SET status = 0 WHERE id = ? LIMIT 1`,
          [planId],
        );
        const [insertResult] = await connection.query(
          `
          INSERT INTO subscription_plans (
            plan_name, one_time_deposit, monthly_fee, booking_fee,
            trip_summary_fee, api_scan_fee, booking_limit, api_enabled,
            crm_enabled, white_label_enabled, status, stripe_product_id,
            stripe_price_id, monthly_booking_limit
          )
          SELECT
            plan_name, ?, ?, booking_fee,
            trip_summary_fee, api_scan_fee, booking_limit, api_enabled,
            crm_enabled, white_label_enabled, 1, ?, ?, monthly_booking_limit
          FROM subscription_plans
          WHERE id = ?
          `,
          [monthlyPrice, monthlyPrice, stripeProductId, newStripePrice.id, planId],
        );
        await connection.commit();

        let oldStripePriceArchived = false;
        if (currentPlan.stripe_price_id) {
          try {
            await stripe.prices.update(currentPlan.stripe_price_id, { active: false });
            oldStripePriceArchived = true;
          } catch (archiveError) {
            console.error("Unable to archive previous Stripe price:", archiveError);
          }
        }

        return NextResponse.json({
          success: true,
          planId: insertResult.insertId,
          stripePriceId: newStripePrice.id,
          stripeProductId,
          oldStripePriceArchived,
        });
      } catch (error) {
        await connection.rollback().catch(() => {});
        if (newStripePrice?.id) {
          await stripe.prices.update(newStripePrice.id, { active: false }).catch(() => {});
        }
        if (createdProductId) {
          await stripe.products.update(createdProductId, { active: false }).catch(() => {});
        }
        throw error;
      }
    }

    const [existing] = await connection.query(
      "SELECT id FROM subscription_plans WHERE id = ? LIMIT 1",
      [planId],
    );

    if (!existing[0]) {
      return NextResponse.json(
        { message: "Subscription plan was not found" },
        { status: 404 },
      );
    }

    const update = normalizePlanUpdate(body);
    validatePlanUpdate(update);

    await connection.query(
      `
      UPDATE subscription_plans
      SET
        booking_fee = ?,
        monthly_booking_limit = ?,
        trip_summary_fee = ?,
        api_scan_fee = ?,
        stripe_price_id = ?,
        stripe_product_id = ?
      WHERE id = ?
      LIMIT 1
      `,
      [
        update.booking_fee,
        update.monthly_booking_limit,
        update.trip_summary_fee,
        update.api_scan_fee,
        update.stripe_price_id || null,
        update.stripe_product_id || null,
        planId,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const statusCode = error?.statusCode || 500;

    if (statusCode === 500) {
      console.error("adminmaster subscription-plans error:", error);
    }

    return NextResponse.json(
      { message: error?.message || "Unable to update subscription plan" },
      { status: statusCode },
    );
  } finally {
    connection?.release();
  }
}
