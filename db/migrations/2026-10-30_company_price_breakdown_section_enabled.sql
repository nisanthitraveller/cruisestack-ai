SET @price_breakdown_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'companies'
    AND COLUMN_NAME = 'price_breakdown_section_enabled'
);

SET @price_breakdown_migration = IF(
  @price_breakdown_column_exists = 0,
  'ALTER TABLE companies ADD COLUMN price_breakdown_section_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER commission_section_enabled',
  'SELECT 1'
);

PREPARE price_breakdown_statement FROM @price_breakdown_migration;
EXECUTE price_breakdown_statement;
DEALLOCATE PREPARE price_breakdown_statement;
