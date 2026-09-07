-- Beginner: $499 base, trip summary fee -> $0.25
UPDATE subscription_plans
SET trip_summary_fee = 0.25
WHERE id = 1;

-- New $599 row (from the previous migration) stays "Professional", booking fee -> $7
UPDATE subscription_plans
SET booking_fee = 7.00
WHERE plan_name = 'Professional'
  AND status = 1;

-- Reactivate the old $999 Professional row and rename it to Enterprise, booking fee -> $4
UPDATE subscription_plans
SET plan_name = 'Enterprise',
    status = 1,
    booking_fee = 4.00
WHERE id = 2;

-- Deactivate the old $2199 Enterprise row
UPDATE subscription_plans
SET status = 0
WHERE id = 3;
