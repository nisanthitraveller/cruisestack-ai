-- The live Beginner Buy Button/subscription uses this price. Keeping the plan
-- mapping current lets checkout creation and webhook reconciliation resolve it.
UPDATE subscription_plans
SET stripe_price_id = 'price_1TbvisEmqvBXj5NHyZf7UfgD'
WHERE plan_name = 'Beginner';
