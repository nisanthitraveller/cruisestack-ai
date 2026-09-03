import Stripe from "stripe";
import pool from "../../../lib/db_mysql";
import { tableSafePrefix } from "../../../lib/agentAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const planNames = new Set(["Beginner", "Professional", "Enterprise"]);

class UnmappedStripeObjectError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnmappedStripeObjectError";
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

function stripeDateToMysql(timestamp) {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString().slice(0, 19).replace("T", " ");
}

function amountToDecimal(amount, fallback = 0) {
  if (typeof amount !== "number") return fallback;
  return amount / 100;
}

async function logWebhookEvent(connection, event) {
  try {
    const [result] = await connection.query(
      `
      INSERT INTO stripe_webhook_events
        (stripe_event_id, event_type, stripe_object_id, processing_status, payload)
      VALUES
        (?, ?, ?, 'Received', ?)
      `,
      [
        event.id,
        event.type,
        event.data?.object?.id || null,
        JSON.stringify(event),
      ]
    );

    return { duplicate: false, logId: result.insertId };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const [existing] = await connection.query(
        `
        SELECT id, processing_status
        FROM stripe_webhook_events
        WHERE stripe_event_id = ?
        LIMIT 1
        `,
        [event.id]
      );

      return {
        duplicate: true,
        retryable: existing[0]?.processing_status === "Failed",
        logId: existing[0]?.id || null,
      };
    }

    throw error;
  }
}

async function ensureWebhookEventLogged(event) {
  const connection = await pool.getConnection();

  try {
    const result = await logWebhookEvent(connection, event);
    return result;
  } finally {
    connection.release();
  }
}

async function markWebhookEventById(eventId, fields) {
  const connection = await pool.getConnection();

  try {
    await markWebhookEvent(connection, eventId, fields);
  } finally {
    connection.release();
  }
}

async function markWebhookEvent(connection, eventId, fields) {
  await connection.query(
    `
    UPDATE stripe_webhook_events
    SET
      company_id = COALESCE(?, company_id),
      processing_status = ?,
      error_message = ?,
      processed_at = NOW()
    WHERE stripe_event_id = ?
    `,
    [
      fields.companyId || null,
      fields.processingStatus,
      fields.errorMessage || null,
      eventId,
    ]
  );
}

async function findCompanyBySlug(connection, slug) {
  if (!slug) return null;

  const [companies] = await connection.query(
    "SELECT id, slug, plan_type, enable_commission_sync FROM companies WHERE slug = ? LIMIT 1",
    [slug]
  );

  return companies[0] || null;
}

async function findCompanyByEmail(connection, email) {
  if (!email) return null;

  const [companies] = await connection.query(
    `
    SELECT id, slug, plan_type, enable_commission_sync
    FROM companies
    WHERE LOWER(support_email) = LOWER(?)
    LIMIT 2
    `,
    [email]
  );

  // Never guess when an email is shared by more than one tenant.
  return companies.length === 1 ? companies[0] : null;
}

async function findCompanyBySubscription(connection, stripeSubscriptionId) {
  if (!stripeSubscriptionId) return null;

  const [companies] = await connection.query(
    `
    SELECT c.id, c.slug, c.plan_type, c.enable_commission_sync
    FROM company_subscriptions cs
    INNER JOIN companies c ON c.id = cs.company_id
    WHERE cs.stripe_subscription_id = ?
    LIMIT 1
    `,
    [stripeSubscriptionId]
  );

  return companies[0] || null;
}

async function findCompanyByStripeCustomer(connection, stripeCustomerId) {
  if (!stripeCustomerId) return null;

  const [companies] = await connection.query(
    `
    SELECT DISTINCT c.id, c.slug, c.plan_type, c.enable_commission_sync
    FROM company_subscriptions cs
    INNER JOIN companies c ON c.id = cs.company_id
    WHERE cs.stripe_customer_id = ?
    LIMIT 2
    `,
    [stripeCustomerId]
  );

  // A Stripe customer must never be used to guess between multiple companies.
  return companies.length === 1 ? companies[0] : null;
}

async function findCompanyForStripeSubscription(connection, stripeSubscriptionId) {
  const existingCompany = await findCompanyBySubscription(
    connection,
    stripeSubscriptionId
  );

  if (existingCompany) return existingCompany;
  if (!stripeSubscriptionId) return null;

  const sessions = await stripe.checkout.sessions.list({
    subscription: stripeSubscriptionId,
    limit: 1,
  });
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const checkoutSession = sessions.data[0];
  const companyBySlug = await findCompanyBySlug(
    connection,
    checkoutSession?.client_reference_id || subscription.metadata?.company_slug
  );

  if (companyBySlug) return companyBySlug;

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || null;
  const companyByCustomer = await findCompanyByStripeCustomer(
    connection,
    stripeCustomerId
  );

  if (companyByCustomer) return companyByCustomer;

  const customer =
    typeof subscription.customer === "string"
      ? await stripe.customers.retrieve(subscription.customer)
      : subscription.customer;

  return findCompanyByEmail(
    connection,
    checkoutSession?.customer_details?.email ||
      (!customer?.deleted ? customer?.email : null)
  );
}

async function findPlanByPrice(connection, stripePriceId) {
  if (!stripePriceId) return null;

  const [plans] = await connection.query(
    `
    SELECT id, plan_name, stripe_product_id, stripe_price_id
    FROM subscription_plans
    WHERE stripe_price_id = ?
    LIMIT 1
    `,
    [stripePriceId]
  );

  return plans[0] || null;
}

async function upsertCompanySubscription(connection, details) {
  const [existing] = await connection.query(
    `
    SELECT id
    FROM company_subscriptions
    WHERE stripe_subscription_id = ?
      OR (company_id = ? AND status = 1)
    ORDER BY id DESC
    LIMIT 1
    `,
    [details.stripeSubscriptionId || "", details.companyId]
  );

  const paymentStatus =
    details.paymentStatus === "paid" || details.stripeStatus === "active"
      ? "Paid"
      : details.stripeStatus === "canceled"
        ? "Cancelled"
        : details.paymentStatus === "failed"
          ? "Failed"
          : "Pending";

  if (existing.length > 0) {
    await connection.query(
      `
      UPDATE company_subscriptions
      SET
        plan_id = ?,
        start_date = COALESCE(DATE(?), start_date),
        end_date = COALESCE(DATE(?), end_date),
        payment_status = ?,
        stripe_customer_id = ?,
        stripe_subscription_id = ?,
        stripe_checkout_session_id = COALESCE(?, stripe_checkout_session_id),
        stripe_price_id = ?,
        stripe_product_id = ?,
        stripe_status = ?,
        current_period_start = ?,
        current_period_end = ?,
        cancel_at_period_end = ?,
        status = ?
      WHERE id = ?
      `,
      [
        details.planId,
        details.currentPeriodStart,
        details.currentPeriodEnd,
        paymentStatus,
        details.stripeCustomerId,
        details.stripeSubscriptionId,
        details.stripeCheckoutSessionId,
        details.stripePriceId,
        details.stripeProductId,
        details.stripeStatus,
        details.currentPeriodStart,
        details.currentPeriodEnd,
        details.cancelAtPeriodEnd ? 1 : 0,
        details.stripeStatus === "canceled" ? 0 : 1,
        existing[0].id,
      ]
    );

    return existing[0].id;
  }

  const [result] = await connection.query(
    `
    INSERT INTO company_subscriptions
      (
        company_id,
        plan_id,
        start_date,
        end_date,
        payment_status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        stripe_price_id,
        stripe_product_id,
        stripe_status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        status
      )
    VALUES
      (?, ?, DATE(?), DATE(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      details.companyId,
      details.planId,
      details.currentPeriodStart,
      details.currentPeriodEnd,
      paymentStatus,
      details.stripeCustomerId,
      details.stripeSubscriptionId,
      details.stripeCheckoutSessionId,
      details.stripePriceId,
      details.stripeProductId,
      details.stripeStatus,
      details.currentPeriodStart,
      details.currentPeriodEnd,
      details.cancelAtPeriodEnd ? 1 : 0,
      details.stripeStatus === "canceled" ? 0 : 1,
    ]
  );

  return result.insertId;
}

async function copyMasterCommissionToCompany(connection, company, planId) {
  if (!company?.id || !company?.slug || !planId) {
  console.log("Skipping commission copy. Missing:", {
    companyId: company?.id,
    slug: company?.slug,
    planId,
  });
  return;
}

  if (Number(company.enable_commission_sync ?? 1) !== 1) {
    console.log(`Skipping commission copy for company ${company.id}: sync disabled`);
    return;
  }

  const tablePrefix = company.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");

  const agentTable = `${tablePrefix}_agent`;
  const commissionTable = `${tablePrefix}_agent_commission`;

  const [agents] = await connection.query(
    `
    SELECT id
    FROM \`${agentTable}\`
    WHERE company_id = ?
    ORDER BY id ASC
    LIMIT 1
    `,
    [company.id]
  );

  if (agents.length === 0) {
    throw new Error(`No agent found in ${agentTable}`);
  }

  const agentId = agents[0].id;

  const [existing] = await connection.query(
    `
    SELECT id
    FROM \`${commissionTable}\`
    WHERE tour_agent_id = ?
      AND company_id = ?
    LIMIT 1
    `,
    [agentId, company.id]
  );

  if (existing.length > 0) return;

  await connection.query(
    `
    INSERT INTO \`${commissionTable}\`
      (
        tour_agent_id,
        cruiseline_id,
        commission,
        discount,
        markup,
        gmc_discount,
        created_at,
        updated_at,
        status,
        company_id
      )
    SELECT
      ?,
      cruiseline_id,
      commission,
      discount,
      markup,
      gmc_discount,
      NOW(),
      NOW(),
      status,
      ?
    FROM cruisestack_master_commission
    WHERE subscription_plan_id = ?
    `,
    [agentId, company.id, planId]
  );
  console.log(
  `Copied commission data into ${commissionTable} for company ${company.id}, agent ${agentId}, plan ${planId}`
);
}

async function handleCheckoutCompleted(connection, session) {
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product", "subscription"],
  });
  const company =
    (await findCompanyBySlug(
      connection,
      session.client_reference_id || fullSession.metadata?.company_slug
    )) ||
    (await findCompanyByEmail(connection, fullSession.customer_details?.email));

  if (!company) {
    throw new Error(
      `Company not found for checkout client_reference_id: ${session.client_reference_id || "empty"}`
    );
  }

  const lineItem = fullSession.line_items?.data?.[0];
  const price = lineItem?.price || null;
  const product = price?.product || null;
  let subscription = null;

if (typeof fullSession.subscription === "string") {
  subscription = await stripe.subscriptions.retrieve(
    fullSession.subscription
  );
} else {
  subscription = fullSession.subscription;
}
  const plan = await findPlanByPrice(connection, price?.id);

  await upsertCompanySubscription(connection, {
    companyId: company.id,
    planId: plan?.id || null,
    stripeCustomerId:
      typeof fullSession.customer === "string"
        ? fullSession.customer
        : fullSession.customer?.id || null,
    stripeSubscriptionId:
      typeof fullSession.subscription === "string"
        ? fullSession.subscription
        : fullSession.subscription?.id || null,
    stripeCheckoutSessionId: fullSession.id,
    stripePriceId: price?.id || null,
    stripeProductId:
      typeof product === "string" ? product : product?.id || null,
    stripeStatus: subscription?.status || fullSession.payment_status,
    paymentStatus: fullSession.payment_status,
    currentPeriodStart: stripeDateToMysql(subscription?.current_period_start),
    currentPeriodEnd: stripeDateToMysql(subscription?.current_period_end),
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
  });

  try {
    await copyMasterCommissionToCompany(connection, company, plan?.id || null);
  } catch (error) {
    // Commission provisioning is secondary and must not roll back a paid checkout.
    console.error("Stripe checkout commission copy failed:", error);
  }

  if (plan?.plan_name && planNames.has(plan.plan_name)) {
    await connection.query("UPDATE companies SET plan_type = ? WHERE id = ?", [
      plan.plan_name,
      company.id,
    ]);
  }

  return company.id;
}

async function handleSubscriptionEvent(connection, subscription) {
  const company = await findCompanyForStripeSubscription(
    connection,
    subscription.id
  );

  if (!company) {
    throw new UnmappedStripeObjectError(
      `Company not found for subscription: ${subscription.id}`
    );
  }

  const item = subscription.items?.data?.[0];
  const price = item?.price || null;
  const plan = await findPlanByPrice(connection, price?.id);

  await upsertCompanySubscription(connection, {
    companyId: company.id,
    planId: plan?.id || null,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id || null,
    stripeSubscriptionId: subscription.id,
    stripeCheckoutSessionId: null,
    stripePriceId: price?.id || null,
    stripeProductId:
      typeof price?.product === "string" ? price.product : price?.product?.id || null,
    stripeStatus: subscription.status,
    paymentStatus: subscription.status === "active" ? "paid" : "pending",
    currentPeriodStart: stripeDateToMysql(
      subscription.current_period_start || item?.current_period_start
    ),
    currentPeriodEnd: stripeDateToMysql(
      subscription.current_period_end || item?.current_period_end
    ),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  });

  if (plan?.plan_name && planNames.has(plan.plan_name)) {
    await connection.query("UPDATE companies SET plan_type = ? WHERE id = ?", [
      plan.plan_name,
      company.id,
    ]);
  }

  return company.id;
}

async function upsertBillingHistory(connection, invoice, paymentStatus, failureMessage) {
  const legacySubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id || null;
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  const stripeSubscriptionId =
    legacySubscriptionId ||
    (typeof parentSubscription === "string"
      ? parentSubscription
      : parentSubscription?.id || null);
  const company = await findCompanyForStripeSubscription(
    connection,
    stripeSubscriptionId
  );

  if (!company) {
    throw new UnmappedStripeObjectError(
      `Company not found for invoice subscription: ${stripeSubscriptionId || "none"}`
    );
  }

  const totalAmount = amountToDecimal(invoice.amount_paid || invoice.amount_due);
  const paidAt = paymentStatus === "Paid" ? stripeDateToMysql(invoice.status_transitions?.paid_at) : null;

  const [existing] = await connection.query(
    `
    SELECT id
    FROM company_billing_history
    WHERE stripe_invoice_id = ?
    LIMIT 1
    `,
    [invoice.id]
  );

  if (existing.length > 0) {
    await connection.query(
      `
      UPDATE company_billing_history
      SET
        invoice_no = ?,
        total_amount = ?,
        payment_status = ?,
        invoice_url = ?,
        stripe_payment_intent_id = ?,
        stripe_charge_id = ?,
        stripe_subscription_id = ?,
        hosted_invoice_url = ?,
        invoice_pdf = ?,
        paid_at = ?,
        failure_message = ?
      WHERE id = ?
      `,
      [
        invoice.number || invoice.id,
        totalAmount,
        paymentStatus,
        invoice.hosted_invoice_url || null,
        typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id || null,
        typeof invoice.charge === "string" ? invoice.charge : invoice.charge?.id || null,
        stripeSubscriptionId,
        invoice.hosted_invoice_url || null,
        invoice.invoice_pdf || null,
        paidAt,
        failureMessage || null,
        existing[0].id,
      ]
    );
  } else {
    await connection.query(
      `
      INSERT INTO company_billing_history
        (
          company_id,
          invoice_no,
          billing_month,
          total_amount,
          payment_status,
          invoice_url,
          stripe_invoice_id,
          stripe_payment_intent_id,
          stripe_charge_id,
          stripe_subscription_id,
          hosted_invoice_url,
          invoice_pdf,
          paid_at,
          failure_message
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company.id,
        invoice.number || invoice.id,
        new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000)
          .toISOString()
          .slice(0, 7),
        totalAmount,
        paymentStatus,
        invoice.hosted_invoice_url || null,
        invoice.id,
        typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id || null,
        typeof invoice.charge === "string" ? invoice.charge : invoice.charge?.id || null,
        stripeSubscriptionId,
        invoice.hosted_invoice_url || null,
        invoice.invoice_pdf || null,
        paidAt,
        failureMessage || null,
      ]
    );
  }

  return company.id;
}

async function handleInvoiceCreated(connection, invoice) {
  if (invoice.billing_reason !== "subscription_cycle") return null;

  const legacySubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id || null;
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  const stripeSubscriptionId =
    legacySubscriptionId ||
    (typeof parentSubscription === "string"
      ? parentSubscription
      : parentSubscription?.id || null);

  if (!stripeSubscriptionId) return null;

  const stripeCustomerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null;

  const [rows] = await connection.query(
    `
    SELECT
      cs.company_id,
      c.slug,
      c.billing_metric,
      sp.booking_fee,
      sp.trip_summary_fee
    FROM company_subscriptions cs
    INNER JOIN companies c ON c.id = cs.company_id
    LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
    WHERE cs.stripe_subscription_id = ?
    ORDER BY cs.id DESC
    LIMIT 1
    `,
    [stripeSubscriptionId]
  );

  const subscription = rows[0];

  if (!subscription) {
    throw new UnmappedStripeObjectError(
      `Company not found for invoice subscription: ${stripeSubscriptionId}`
    );
  }

  if (subscription.billing_metric !== "booking_count" && subscription.billing_metric !== "trip_summary_count") {
    // Flat-fee only ("none") — no usage line for this company, ever.
    return subscription.company_id;
  }

  // invoice.period_start/end mark when items may still be attached to this invoice,
  // not the service period — the actual billed cycle lives on the line item.
  const usageLine = invoice.lines?.data?.find((line) => line.period) || null;
  const periodStartSeconds = usageLine?.period?.start || invoice.period_start || invoice.created;
  const periodEndSeconds = usageLine?.period?.end || invoice.period_end || invoice.created;
  const periodStart = stripeDateToMysql(periodStartSeconds);
  const periodEnd = stripeDateToMysql(periodEndSeconds);

  const tablePrefix = tableSafePrefix(subscription.slug);
  const bookingsTable = `${tablePrefix}_bookings`;
  const metric = subscription.billing_metric === "trip_summary_count" ? "trip_summary_count" : "booking_count";

  let count = 0;

  try {
    const whereClause =
      metric === "trip_summary_count" ? "package_url IS NOT NULL" : "advance_paid = 1";
    const [usageRows] = await connection.query(
      `
      SELECT COUNT(*) AS cnt
      FROM \`${bookingsTable}\`
      WHERE ${whereClause}
        AND created_at >= ?
        AND created_at < ?
      `,
      [periodStart, periodEnd]
    );

    count = Number(usageRows[0]?.cnt || 0);
  } catch (error) {
    if (error.code !== "ER_NO_SUCH_TABLE") throw error;
  }

  const fee =
    Number(metric === "trip_summary_count" ? subscription.trip_summary_fee : subscription.booking_fee) || 0;
  const amount = Math.round(count * fee * 100) / 100;

  try {
    await connection.query(
      `
      INSERT INTO company_billing_usage
        (
          company_id,
          stripe_subscription_id,
          stripe_invoice_id,
          billing_period_start,
          billing_period_end,
          billing_metric,
          booking_count,
          booking_fee,
          booking_amount,
          trip_summary_count,
          trip_summary_fee,
          trip_summary_amount
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        subscription.company_id,
        stripeSubscriptionId,
        invoice.id,
        periodStart,
        periodEnd,
        metric,
        metric === "booking_count" ? count : 0,
        metric === "booking_count" ? fee : 0,
        metric === "booking_count" ? amount : 0,
        metric === "trip_summary_count" ? count : 0,
        metric === "trip_summary_count" ? fee : 0,
        metric === "trip_summary_count" ? amount : 0,
      ]
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      // Already processed for this invoice on an earlier delivery of this webhook.
      return subscription.company_id;
    }

    throw error;
  }

  if (amount > 0 && stripeCustomerId) {
    const invoiceItem = await stripe.invoiceItems.create({
      amount: Math.round(amount * 100),
      currency: invoice.currency || "usd",
      customer: stripeCustomerId,
      description:
        metric === "trip_summary_count"
          ? `Trip summary usage - ${count} x $${fee.toFixed(2)}`
          : `Booking usage - ${count} x $${fee.toFixed(2)}`,
      invoice: invoice.id,
    });

    await connection.query(
      `
      UPDATE company_billing_usage
      SET stripe_invoice_item_id = ?, processed_at = NOW()
      WHERE stripe_invoice_id = ?
      `,
      [invoiceItem.id, invoice.id]
    );
  } else {
    await connection.query(
      `UPDATE company_billing_usage SET processed_at = NOW() WHERE stripe_invoice_id = ?`,
      [invoice.id]
    );
  }

  return subscription.company_id;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const signature = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({
      message: "Stripe webhook secret is not configured",
    });
  }

  let event;

  try {
    const rawBody = await readRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe Checkout Webhook Signature Error:", error.message);
    return res.status(400).json({
      message: `Webhook signature verification failed: ${error.message}`,
    });
  }

  let connection;

  try {
    const webhookLog = await ensureWebhookEventLogged(event);

    if (webhookLog.duplicate && !webhookLog.retryable) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let companyId = null;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        companyId = await handleCheckoutCompleted(connection, session);

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        companyId = await handleSubscriptionEvent(connection, subscription);

        break;
      }

      case "invoice.created": {
        const invoice = event.data.object;

        companyId = await handleInvoiceCreated(connection, invoice);

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        companyId = await upsertBillingHistory(connection, invoice, "Paid");

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const failureMessage =
          invoice.last_payment_error?.message || "Invoice payment failed";

        companyId = await upsertBillingHistory(
          connection,
          invoice,
          "Failed",
          failureMessage
        );

        break;
      }

      default:
        console.log("Unhandled Stripe event:", event.type);
    }

    await markWebhookEvent(connection, event.id, {
      companyId,
      processingStatus: "Processed",
    });

    await connection.commit();

    return res.status(200).json({ received: true });
  } catch (error) {
    if (connection) {
      await connection.rollback();

      if (error instanceof UnmappedStripeObjectError) {
        try {
          await markWebhookEventById(event.id, {
            processingStatus: "Processed",
            errorMessage: `Ignored: ${error.message}`,
          });
        } catch (logError) {
          console.error("Stripe Webhook Log Update Error:", logError);
          return res.status(500).json({ message: "Webhook handler failed" });
        }

        console.warn("Stripe webhook ignored:", error.message);
        return res.status(200).json({ received: true, ignored: true });
      }

      try {
        await markWebhookEventById(event.id, {
          processingStatus: "Failed",
          errorMessage: error.message,
        });
      } catch (logError) {
        console.error("Stripe Webhook Log Update Error:", logError);
      }
    }

    console.error("Stripe Checkout Webhook Error:", error);
    return res.status(500).json({ message: "Webhook handler failed" });
  } finally {
    if (connection) connection.release();
  }
}
