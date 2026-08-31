ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS enable_commission_sync tinyint(1) NOT NULL DEFAULT 1
  AFTER deals_enabled;

UPDATE companies
SET enable_commission_sync = 1
WHERE enable_commission_sync IS NULL;
