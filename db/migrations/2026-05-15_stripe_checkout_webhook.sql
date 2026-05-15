ALTER TABLE company_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_price_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_product_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_status varchar(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_period_start datetime DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_period_end datetime DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end tinyint(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamp NULL DEFAULT NULL ON UPDATE current_timestamp();

ALTER TABLE company_billing_history
  ADD COLUMN IF NOT EXISTS stripe_invoice_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_charge_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hosted_invoice_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS invoice_pdf text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paid_at datetime DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS failure_message text DEFAULT NULL;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id int(11) NOT NULL AUTO_INCREMENT,
  stripe_event_id varchar(255) NOT NULL,
  company_id int(11) DEFAULT NULL,
  event_type varchar(255) DEFAULT NULL,
  stripe_object_id varchar(255) DEFAULT NULL,
  processing_status enum('Received','Processed','Failed') DEFAULT 'Received',
  error_message text DEFAULT NULL,
  payload longtext DEFAULT NULL,
  received_at timestamp NOT NULL DEFAULT current_timestamp(),
  processed_at datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY stripe_event_id (stripe_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
