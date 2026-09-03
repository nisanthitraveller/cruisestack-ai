ALTER TABLE companies
  MODIFY COLUMN billing_metric ENUM('none', 'booking_count', 'trip_summary_count')
  NOT NULL DEFAULT 'none';

UPDATE companies
SET billing_metric = 'none';
