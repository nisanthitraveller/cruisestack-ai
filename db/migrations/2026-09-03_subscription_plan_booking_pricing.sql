ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS booking_fee DECIMAL(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS monthly_booking_limit INT DEFAULT NULL;

UPDATE subscription_plans
SET booking_fee = 3.00,
    monthly_booking_limit = 20
WHERE plan_name = 'Beginner';

UPDATE subscription_plans
SET booking_fee = 4.00,
    monthly_booking_limit = 30
WHERE plan_name = 'Professional';

UPDATE subscription_plans
SET booking_fee = 5.00,
    monthly_booking_limit = 100
WHERE plan_name = 'Enterprise';
