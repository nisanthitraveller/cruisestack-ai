ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS commission_section_enabled TINYINT(1) NOT NULL DEFAULT 1
  AFTER gratuity_section_enabled;

UPDATE companies
SET commission_section_enabled = 1
WHERE commission_section_enabled IS NULL;
