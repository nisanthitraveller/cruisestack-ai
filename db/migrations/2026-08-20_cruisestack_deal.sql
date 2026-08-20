ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS deals_enabled TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS cruisestack_deal (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id INT(11) NOT NULL,
  package_id VARCHAR(200) NOT NULL,
  package_url VARCHAR(500) DEFAULT NULL,
  deal_title VARCHAR(255) NOT NULL,
  deal_image VARCHAR(500) DEFAULT NULL,
  cruise_line VARCHAR(255) NOT NULL,
  cruise_logo VARCHAR(500) DEFAULT NULL,
  ship_name VARCHAR(255) NOT NULL,
  destination VARCHAR(255) DEFAULT NULL,
  departure_port_code VARCHAR(20) DEFAULT NULL,
  passengers_count INT NOT NULL DEFAULT 2,
  no_nights INT DEFAULT NULL,
  cabin VARCHAR(100) DEFAULT NULL,
  travel_date DATE NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  absolute_price DECIMAL(12,2) NOT NULL,
  discounted_price DECIMAL(12,2) NOT NULL,
  reduction_percent DECIMAL(6,2) DEFAULT NULL,
  offer_validity_date DATE DEFAULT NULL,
  source ENUM('manual', 'csv', 'api') NOT NULL DEFAULT 'manual',
  status TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cruisestack_deal (company_id, package_id, cabin, travel_date),
  KEY idx_cruisestack_deal_company_status (company_id, status),
  KEY idx_cruisestack_deal_dates (travel_date, offer_validity_date),
  CONSTRAINT fk_cruisestack_deal_company
    FOREIGN KEY (company_id) REFERENCES companies (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
