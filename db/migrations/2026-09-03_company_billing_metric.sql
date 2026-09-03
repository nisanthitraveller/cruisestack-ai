ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS billing_metric ENUM('booking_count', 'trip_summary_count')
  NOT NULL DEFAULT 'booking_count'
  AFTER enable_commission_sync;

UPDATE companies
SET billing_metric = 'booking_count'
WHERE billing_metric IS NULL;
