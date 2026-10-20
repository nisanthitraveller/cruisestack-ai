/*
  Synchronize discount from gmc_discount.

  Updates only:
    - cruisestack_master_commission.discount
    - <tenant>_agent_commission.discount

  Never updates:
    - cruisestack_master_commission.gmc_discount
    - tour_agent_commission
    - any <tenant>_tour_agent_commission table

  p_commit_changes = FALSE: preview and rollback
  p_commit_changes = TRUE:  apply and commit
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS sync_discount_from_gmc$$

CREATE PROCEDURE sync_discount_from_gmc(IN p_commit_changes BOOLEAN)
BEGIN
    DECLARE finished INT DEFAULT 0;
    DECLARE tenant_table VARCHAR(255);
    DECLARE tenant_plan_id BIGINT;
    DECLARE affected_rows INT DEFAULT 0;

    DECLARE tenant_cursor CURSOR FOR
        SELECT DISTINCT
            tables_info.TABLE_NAME,
            subscriptions.plan_id
        FROM companies companies_info
        INNER JOIN company_subscriptions subscriptions
            ON subscriptions.id = (
                SELECT latest_subscription.id
                FROM company_subscriptions latest_subscription
                WHERE latest_subscription.company_id = companies_info.id
                ORDER BY latest_subscription.id DESC
                LIMIT 1
            )
        INNER JOIN INFORMATION_SCHEMA.TABLES tables_info
            ON tables_info.TABLE_SCHEMA = DATABASE()
           AND tables_info.TABLE_NAME = CONCAT(
               REPLACE(LOWER(companies_info.slug), '-', '_'),
               '_agent_commission'
           )
           AND tables_info.TABLE_NAME <> 'tour_agent_commission'
           AND tables_info.TABLE_NAME NOT LIKE '%\\_tour\\_agent\\_commission'
        WHERE companies_info.slug IS NOT NULL
          AND companies_info.slug <> '';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    DROP TEMPORARY TABLE IF EXISTS commission_sync_result;
    CREATE TEMPORARY TABLE commission_sync_result (
        table_name VARCHAR(255) NOT NULL,
        rows_updated INT NOT NULL
    ) ENGINE = MEMORY;

    START TRANSACTION;

    UPDATE cruisestack_master_commission
    SET
        discount = gmc_discount,
        updated_at = NOW()
    WHERE gmc_discount IS NOT NULL
      AND NOT (discount <=> gmc_discount);

    SET affected_rows = ROW_COUNT();
    INSERT INTO commission_sync_result (table_name, rows_updated)
    VALUES ('cruisestack_master_commission', affected_rows);

    OPEN tenant_cursor;

    tenant_loop: LOOP
        FETCH tenant_cursor INTO tenant_table, tenant_plan_id;

        IF finished = 1 THEN
            LEAVE tenant_loop;
        END IF;

        SET @tenant_plan_id = tenant_plan_id;
        SET @update_sql = CONCAT(
            'UPDATE `', REPLACE(tenant_table, '`', '``'), '` tenant_commission ',
            'INNER JOIN cruisestack_master_commission master_commission ',
            'ON master_commission.cruiseline_id = tenant_commission.cruiseline_id ',
            'AND master_commission.subscription_plan_id = ? ',
            'SET tenant_commission.discount = master_commission.gmc_discount, ',
            'tenant_commission.updated_at = NOW() ',
            'WHERE master_commission.gmc_discount IS NOT NULL ',
            'AND NOT (tenant_commission.discount <=> master_commission.gmc_discount)'
        );

        PREPARE update_statement FROM @update_sql;
        EXECUTE update_statement USING @tenant_plan_id;
        SET affected_rows = ROW_COUNT();
        DEALLOCATE PREPARE update_statement;

        INSERT INTO commission_sync_result (table_name, rows_updated)
        VALUES (tenant_table, affected_rows);
    END LOOP;

    CLOSE tenant_cursor;

    IF p_commit_changes = TRUE THEN
        COMMIT;
    ELSE
        ROLLBACK;
    END IF;

    SELECT
        CASE
            WHEN p_commit_changes = TRUE THEN 'COMMITTED'
            ELSE 'PREVIEW ONLY - ROLLED BACK'
        END AS execution_status;

    SELECT table_name, rows_updated
    FROM commission_sync_result
    ORDER BY table_name;
END$$

DELIMITER ;

