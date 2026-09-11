ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS Blockingonly_flag TINYINT(1) NOT NULL DEFAULT 1
  AFTER chatbot;

UPDATE companies
SET Blockingonly_flag = 1;

ALTER TABLE companies
  MODIFY COLUMN Blockingonly_flag TINYINT(1) NOT NULL DEFAULT 1;
