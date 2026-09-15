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

    if (
      !["update", "create_stripe_price", "deactivate", "create_plan", "delete"].includes(action) ||
      (action !== "create_plan" && !planId)
    ) {
      return NextResponse.json(
        { message: "Invalid subscription plan action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();

    if (action === "delete") {
      const [plans] = await connection.query(
        `SELECT id, plan_name, status, stripe_product_id, stripe_price_id, stripe_payment_link_id FROM subscription_plans WHERE id = ? LIMIT 1`,
        [planId],
      );
      const plan = plans[0];

      if (!plan) {
        throw httpError("Subscription plan was not found", 404);
      }
      if (Number(plan.status) === 1) {
        throw httpError("Make the plan inactive before deleting it");
      }

      const [subscriptions] = await connection.query(
        `SELECT id FROM company_subscriptions WHERE plan_id = ? LIMIT 1`,
        [planId],
      );
      if (subscriptions[0]) {
        throw httpError("This plan cannot be deleted because company subscriptions reference it", 409);
      }

      const [sharedProducts] = plan.stripe_product_id
        ? await connection.query(
            `SELECT id FROM subscription_plans WHERE stripe_product_id = ? AND id <> ? LIMIT 1`,
            [plan.stripe_product_id, planId],
          )
        : [[]];

      await connection.query(`DELETE FROM subscription_plans WHERE id = ? LIMIT 1`, [planId]);

      if (stripe) {
        if (plan.stripe_payment_link_id) {
          await stripe.paymentLinks.update(plan.stripe_payment_link_id, { active: false }).catch((error) => {
            console.error("Unable to archive deleted plan payment link:", error);
          });
        }
        if (plan.stripe_price_id) {
          await stripe.prices.update(plan.stripe_price_id, { active: false }).catch((error) => {
            console.error("Unable to archive deleted plan price:", error);
          });
        }
        if (plan.stripe_product_id && !sharedProducts[0]) {
          await stripe.products.update(plan.stripe_product_id, { active: false }).catch((error) => {
            console.error("Unable to archive deleted plan product:", error);
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === "create_plan") {
      if (!stripe) {
        throw httpError("Stripe secret key is not configured", 500);
      }

      const planName = String(body.planName || "").trim();
      const monthlyPrice = Number(body.monthlyPrice);
      const bookingFee = Number(body.bookingFee);
      const monthlyBookingLimit = Number(body.monthlyBookingLimit);
      const tripSummaryFee = Number(body.tripSummaryFee);
      const apiScanFee = Number(body.apiScanFee);
      const moneyValues = [monthlyPrice, bookingFee, tripSummaryFee, apiScanFee];

      if (!planName || planName.length > 100) {
        throw httpError("Plan name is required and must be 100 characters or fewer");
      }
      if (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0) {
        throw httpError("Monthly price must be greater than zero");
      }
      if (moneyValues.some((value) => !Number.isFinite(value) || value < 0)) {
        throw httpError("Plan prices and fees must be valid positive amounts");
      }
      if (
        !Number.isInteger(monthlyBookingLimit) ||
        monthlyBookingLimit < 0
      ) {
        throw httpError("Monthly booking limit must be a whole number of zero or greater");
      }
      if (moneyValues.some((value) => Math.abs(Math.round(value * 100) / 100 - value) > 0.000001)) {
        throw httpError("Prices and fees can have a maximum of two decimal places");
      }

      const [duplicatePlans] = await connection.query(
        `SELECT id FROM subscription_plans WHERE LOWER(plan_name) = LOWER(?) AND status = 1 LIMIT 1`,
        [planName],
      );
      if (duplicatePlans[0]) {
        throw httpError("An active plan with this name already exists");
      }

      let product = null;
      let price = null;
      let paymentLink = null;

      try {
        product = await stripe.products.create({
          name: planName,
          metadata: { managed_by: "cruisestack_master_admin" },
        });
        price = await stripe.prices.create({
          currency: "usd",
          nickname: `${planName} $${monthlyPrice}/month`,
          product: product.id,
          recurring: { interval: "month" },
          unit_amount: Math.round(monthlyPrice * 100),
          metadata: { plan_name: planName },
        });
        paymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: price.id, quantity: 1 }],
          metadata: { plan_name: planName },
        });

        const [insertResult] = await connection.query(
          `
          INSERT INTO subscription_plans (
            plan_name, one_time_deposit, monthly_fee, booking_fee,
            trip_summary_fee, api_scan_fee, booking_limit, api_enabled,
            crm_enabled, white_label_enabled, status, stripe_product_id,
            stripe_price_id, monthly_booking_limit, stripe_payment_link_id,
            stripe_payment_link_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 1, ?, ?, ?, ?, ?)
          `,
          [
            planName,
            monthlyPrice,
            monthlyPrice,
            bookingFee,
            tripSummaryFee,
            apiScanFee,
            monthlyBookingLimit,
            product.id,
            price.id,
            monthlyBookingLimit,
            paymentLink.id,
            paymentLink.url,
          ],
        );

        return NextResponse.json({
          success: true,
          planId: insertResult.insertId,
          stripePriceId: price.id,
          stripeProductId: product.id,
          stripePaymentLinkId: paymentLink.id,
          stripePaymentLinkUrl: paymentLink.url,
        });
      } catch (error) {
        if (paymentLink?.id) {
          await stripe.paymentLinks.update(paymentLink.id, { active: false }).catch(() => {});
        }
        if (price?.id) {
          await stripe.prices.update(price.id, { active: false }).catch(() => {});
        }
        if (product?.id) {
          await stripe.products.update(product.id, { active: false }).catch(() => {});
        }
        throw error;
      }
    }

    if (action === "deactivate") {
      const [plans] = await connection.query(
        `SELECT id, plan_name, status, stripe_price_id, stripe_payment_link_id FROM subscription_plans WHERE id = ? LIMIT 1`,
        [planId],
      );
      const currentPlan = plans[0];

      if (!currentPlan) {
        throw httpError("Subscription plan was not found", 404);
      }
      if (Number(currentPlan.status) !== 1) {
        throw httpError("Subscription plan is already inactive");
      }
      await connection.query(
        `UPDATE subscription_plans SET status = 0 WHERE id = ? LIMIT 1`,
        [planId],
      );

      let stripePriceArchived = null;
      let stripePaymentLinkArchived = null;
      if (currentPlan.stripe_payment_link_id) {
        stripePaymentLinkArchived = false;
        if (stripe) {
          try {
            await stripe.paymentLinks.update(currentPlan.stripe_payment_link_id, { active: false });
            stripePaymentLinkArchived = true;
          } catch (archiveError) {
            console.error("Unable to archive deactivated Stripe payment link:", archiveError);
          }
        }
      }
      if (currentPlan.stripe_price_id) {
        stripePriceArchived = false;
        if (stripe) {
          try {
            await stripe.prices.update(currentPlan.stripe_price_id, { active: false });
            stripePriceArchived = true;
          } catch (archiveError) {
            console.error("Unable to archive deactivated Stripe price:", archiveError);
          }
        }
      }

      return NextResponse.json({ success: true, stripePriceArchived, stripePaymentLinkArchived });
    }

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

      const [productCandidates] = await connection.query(
        `
        SELECT DISTINCT stripe_product_id
        FROM subscription_plans
        WHERE plan_name = ?
          AND stripe_product_id IS NOT NULL
        ORDER BY (id = ?) DESC, status DESC, id DESC
        `,
        [currentPlan.plan_name, currentPlan.id],
      );

      let stripeProductId = null;
      let createdProductId = null;
      let newStripePrice = null;
      let newPaymentLink = null;

      try {
        for (const candidate of productCandidates) {
          try {
            const product = await stripe.products.retrieve(candidate.stripe_product_id);
            if (
              !product.deleted &&
              product.active !== false &&
              product.name.trim().toLowerCase() ===
                currentPlan.plan_name.trim().toLowerCase()
            ) {
              stripeProductId = product.id;
              break;
            }
          } catch (productError) {
            console.warn(
              `Unable to verify Stripe product ${candidate.stripe_product_id}:`,
              productError,
            );
          }
        }

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
        newPaymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: newStripePrice.id, quantity: 1 }],
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
            , stripe_payment_link_id, stripe_payment_link_url
          )
          SELECT
            plan_name, ?, ?, booking_fee,
            trip_summary_fee, api_scan_fee, booking_limit, api_enabled,
            crm_enabled, white_label_enabled, 1, ?, ?, monthly_booking_limit,
            ?, ?
          FROM subscription_plans
          WHERE id = ?
          `,
          [monthlyPrice, monthlyPrice, stripeProductId, newStripePrice.id, newPaymentLink.id, newPaymentLink.url, planId],
        );
        await connection.commit();

        let oldStripePaymentLinkArchived = false;
        if (currentPlan.stripe_payment_link_id) {
          try {
            await stripe.paymentLinks.update(currentPlan.stripe_payment_link_id, { active: false });
            oldStripePaymentLinkArchived = true;
          } catch (archiveError) {
            console.error("Unable to archive previous Stripe payment link:", archiveError);
          }
        }

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
          stripePaymentLinkId: newPaymentLink.id,
          stripePaymentLinkUrl: newPaymentLink.url,
          oldStripePaymentLinkArchived,
          oldStripePriceArchived,
        });
      } catch (error) {
        await connection.rollback().catch(() => {});
        if (newPaymentLink?.id) {
          await stripe.paymentLinks.update(newPaymentLink.id, { active: false }).catch(() => {});
        }
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
