import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

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

    if (!planId || action !== "update") {
      return NextResponse.json(
        { message: "Invalid subscription plan action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();

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
