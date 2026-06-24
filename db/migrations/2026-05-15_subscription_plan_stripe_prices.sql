ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS stripe_price_id varchar(255) DEFAULT NULL;

INSERT INTO subscription_plans (plan_name, stripe_price_id)
SELECT 'Beginner', 'price_1TXERSEmqvBXj5NHd0ImLbQk'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE plan_name = 'Beginner'
);

INSERT INTO subscription_plans (plan_name, stripe_price_id)
SELECT 'Professional', 'price_1TXERoEmqvBXj5NHejeHS6Kk'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE plan_name = 'Professional'
);

INSERT INTO subscription_plans (plan_name, stripe_price_id)
SELECT 'Enterprise', 'price_1TXESAEmqvBXj5NHO4QDybcN'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE plan_name = 'Enterprise'
);

UPDATE subscription_plans
SET stripe_price_id = 'price_1TXERSEmqvBXj5NHd0ImLbQk'
WHERE plan_name = 'Beginner';

UPDATE subscription_plans
SET stripe_price_id = 'price_1TXERoEmqvBXj5NHejeHS6Kk'
WHERE plan_name = 'Professional';

UPDATE subscription_plans
SET stripe_price_id = 'price_1TXESAEmqvBXj5NHO4QDybcN'
WHERE plan_name = 'Enterprise';
