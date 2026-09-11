ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS gratuity_section_enabled TINYINT(1) NOT NULL DEFAULT 0
  AFTER Blockingonly_flag;

UPDATE companies
SET gratuity_section_enabled = 0
WHERE gratuity_section_enabled IS NULL;
