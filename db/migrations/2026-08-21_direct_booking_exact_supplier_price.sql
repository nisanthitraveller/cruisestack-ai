ALTER TABLE company_cruiseline_integrations
  ADD COLUMN IF NOT EXISTS exact_supplier_price_enabled TINYINT(1) NOT NULL DEFAULT 1
  AFTER post_payment_booking_enabled;
