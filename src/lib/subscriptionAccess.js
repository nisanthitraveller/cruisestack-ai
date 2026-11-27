export function isActiveCompanySubscription(company, subscription) {
  if (!company || !subscription || Number(company.status) !== 1) return false;
  if (Number(subscription.status) !== 1) return false;

  const paymentMethod = String(
    subscription.payment_method || "stripe",
  ).toLowerCase();
  const paymentStatus = String(subscription.payment_status || "").toLowerCase();
  const stripeStatus = String(subscription.stripe_status || "").toLowerCase();

  if (paymentMethod === "manual") {
    return paymentStatus === "paid" && stripeStatus === "manual_active";
  }

  // Preserve access for legacy Stripe rows that recorded Paid before
  // stripe_status was populated. New Stripe subscriptions use active/trialing.
  return (
    paymentStatus === "paid" ||
    stripeStatus === "active" ||
    stripeStatus === "trialing"
  );
}

export async function findLatestCompanySubscription(connection, companyId) {
  const [subscriptions] = await connection.query(
    `
    SELECT
      id,
      payment_method,
      payment_status,
      stripe_status,
      status,
      current_period_start,
      current_period_end,
      billing_cycle,
      plan_id
    FROM company_subscriptions
    WHERE company_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [companyId],
  );

  return subscriptions[0] || null;
}
