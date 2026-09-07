INSERT INTO subscription_plans (
  plan_name,
  one_time_deposit,
  monthly_fee,
  booking_fee,
  trip_summary_fee,
  api_scan_fee,
  booking_limit,
  api_enabled,
  crm_enabled,
  white_label_enabled,
  status,
  stripe_product_id,
  stripe_price_id,
  monthly_booking_limit
)
SELECT
  plan_name,
  599.00,
  599.00,
  booking_fee,
  trip_summary_fee,
  api_scan_fee,
  booking_limit,
  api_enabled,
  crm_enabled,
  white_label_enabled,
  1,
  'prod_VDLTqYISTK7Mxk',
  'price_1UCumLEmqvBXj5NHRkep8iTI',
  monthly_booking_limit
FROM subscription_plans
WHERE id = 2;

UPDATE subscription_plans
SET status = 0
WHERE id = 2;
