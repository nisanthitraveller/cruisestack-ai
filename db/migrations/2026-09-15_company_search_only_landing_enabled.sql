ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS search_only_landing_enabled TINYINT(1) NOT NULL DEFAULT 0
  AFTER gratuity_section_enabled;

UPDATE companies
SET search_only_landing_enabled = 0
WHERE search_only_landing_enabled IS NULL;
