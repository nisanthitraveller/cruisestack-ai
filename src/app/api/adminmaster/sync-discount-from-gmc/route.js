import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

const APPLY_CONFIRMATION = "COPY_GMC_TO_DISCOUNT";
const ROLLBACK_CONFIRMATION = "ROLLBACK_GMC_DISCOUNT_SYNC";
const MASTER_TABLE = "cruisestack_master_commission";
const RUNS_TABLE = "commission_discount_sync_runs";
const BACKUP_TABLE = "commission_discount_sync_backup";

function tableSafePrefix(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
}

function quoteIdentifier(value) {
  const name = String(value || "");
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Unsafe table name: ${name}`);
  }
  return `\`${name}\``;
}

function isAllowedTenantTable(tableName) {
  return (
    /^[a-z0-9_]+_agent_commission$/.test(tableName) &&
    tableName !== "tour_agent_commission" &&
    !tableName.endsWith("_tour_agent_commission")
  );
}

async function requireAdmin(request) {
  const admin = await getAdminMasterFromSession(request);
  if (!admin) {
    return {
      response: NextResponse.json(
        { success: false, message: "Master admin login required" },
        { status: 401 },
      ),
    };
  }
  return { admin };
}

async function ensureBackupTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${quoteIdentifier(RUNS_TABLE)} (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      requested_by VARCHAR(255) NULL,
      operation VARCHAR(30) NOT NULL,
      status VARCHAR(30) NOT NULL,
      master_rows INT UNSIGNED NOT NULL DEFAULT 0,
      tenant_rows INT UNSIGNED NOT NULL DEFAULT 0,
      tenant_tables INT UNSIGNED NOT NULL DEFAULT 0,
      details LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME NULL,
      rolled_back_at DATETIME NULL,
      rolled_back_by VARCHAR(255) NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${quoteIdentifier(BACKUP_TABLE)} (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      run_id BIGINT UNSIGNED NOT NULL,
      source_table VARCHAR(255) NOT NULL,
      source_row_id BIGINT NOT NULL,
      old_discount VARCHAR(100) NULL,
      new_discount VARCHAR(100) NULL,
      gmc_discount VARCHAR(100) NULL,
      subscription_plan_id BIGINT NULL,
      cruiseline_id BIGINT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_run_row (run_id, source_table, source_row_id),
      KEY run_id_index (run_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function getTenantContexts(connection) {
  const [companies] = await connection.query(`
    SELECT c.id AS company_id, c.slug, cs.plan_id AS subscription_plan_id
    FROM companies c
    INNER JOIN company_subscriptions cs
      ON cs.id = (
        SELECT latest_cs.id
        FROM company_subscriptions latest_cs
        WHERE latest_cs.company_id = c.id
        ORDER BY latest_cs.id DESC
        LIMIT 1
      )
    WHERE c.slug IS NOT NULL AND TRIM(c.slug) <> ''
    ORDER BY c.id ASC
  `);

  const candidates = new Map();
  for (const company of companies) {
    const prefix = tableSafePrefix(company.slug);
    const tableName = `${prefix}_agent_commission`;
    if (!prefix || !isAllowedTenantTable(tableName)) continue;

    const planId = Number(company.subscription_plan_id || 0);
    const existing = candidates.get(tableName);
    if (existing && existing.subscriptionPlanId !== planId) {
      throw new Error(
        `Tenant table ${tableName} maps to more than one subscription plan`,
      );
    }
    candidates.set(tableName, {
      tableName,
      companyId: Number(company.company_id),
      slug: company.slug,
      subscriptionPlanId: planId,
    });
  }

  const names = [...candidates.keys()];
  if (!names.length) return { contexts: [], missingTables: [] };

  const placeholders = names.map(() => "?").join(", ");
  const [tables] = await connection.query(
    `SELECT TABLE_NAME AS table_name
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN (${placeholders})`,
    names,
  );
  const existingNames = new Set(tables.map((row) => row.table_name));

  return {
    contexts: [...candidates.values()].filter((item) =>
      existingNames.has(item.tableName),
    ),
    missingTables: [...candidates.values()]
      .filter((item) => !existingNames.has(item.tableName))
      .map((item) => item.tableName),
  };
}

async function buildPreview(connection) {
  const [masterRows] = await connection.query(`
    SELECT COUNT(*) AS row_count
    FROM ${quoteIdentifier(MASTER_TABLE)}
    WHERE gmc_discount IS NOT NULL
      AND NOT (discount <=> gmc_discount)
  `);
  const { contexts, missingTables } = await getTenantContexts(connection);
  const tenantChanges = [];
  let tenantRows = 0;

  for (const context of contexts) {
    const table = quoteIdentifier(context.tableName);
    const usesTenantFallback = context.subscriptionPlanId <= 0;
    const [rows] = usesTenantFallback
      ? await connection.query(
          `SELECT COUNT(*) AS row_count
           FROM ${table} tenant
           WHERE tenant.gmc_discount IS NOT NULL
             AND NOT (tenant.discount <=> tenant.gmc_discount)`,
        )
      : await connection.query(
          `SELECT COUNT(*) AS row_count
           FROM ${table} tenant
           INNER JOIN ${quoteIdentifier(MASTER_TABLE)} master
             ON master.subscription_plan_id = ?
            AND master.cruiseline_id = tenant.cruiseline_id
           WHERE master.gmc_discount IS NOT NULL
             AND NOT (tenant.discount <=> master.gmc_discount)`,
          [context.subscriptionPlanId],
        );
    const rowCount = Number(rows[0]?.row_count || 0);
    tenantRows += rowCount;
    tenantChanges.push({
      companyId: context.companyId,
      slug: context.slug,
      table: context.tableName,
      subscriptionPlanId: context.subscriptionPlanId,
      source: usesTenantFallback ? "tenant_gmc_discount" : "master_gmc_discount",
      rowsToChange: rowCount,
    });
  }

  return {
    masterRowsToChange: Number(masterRows[0]?.row_count || 0),
    tenantRowsToChange: tenantRows,
    tenantTablesFound: contexts.length,
    tenantTablesWithChanges: tenantChanges.filter((item) => item.rowsToChange > 0).length,
    tenantChanges,
    missingTenantTables: missingTables,
    protectedTables: ["tour_agent_commission", "*_tour_agent_commission"],
  };
}

async function applySync(connection, admin) {
  await ensureBackupTables(connection);
  const requestedBy = admin.email || admin.user_id || String(admin.id || "admin");
  const [runResult] = await connection.query(
    `INSERT INTO ${quoteIdentifier(RUNS_TABLE)}
      (requested_by, operation, status)
     VALUES (?, 'apply', 'running')`,
    [requestedBy],
  );
  const runId = Number(runResult.insertId);

  try {
    await connection.beginTransaction();
    const { contexts, missingTables } = await getTenantContexts(connection);

    await connection.query(
      `INSERT INTO ${quoteIdentifier(BACKUP_TABLE)}
        (run_id, source_table, source_row_id, old_discount, new_discount,
         gmc_discount, subscription_plan_id, cruiseline_id)
       SELECT ?, ?, id, CAST(discount AS CHAR), CAST(gmc_discount AS CHAR),
              CAST(gmc_discount AS CHAR), subscription_plan_id, cruiseline_id
       FROM ${quoteIdentifier(MASTER_TABLE)}
       WHERE gmc_discount IS NOT NULL
         AND NOT (discount <=> gmc_discount)`,
      [runId, MASTER_TABLE],
    );
    const [masterResult] = await connection.query(`
      UPDATE ${quoteIdentifier(MASTER_TABLE)}
      SET discount = gmc_discount
      WHERE gmc_discount IS NOT NULL
        AND NOT (discount <=> gmc_discount)
    `);

    let tenantRows = 0;
    let tenantTables = 0;
    const changedTables = [];

    for (const context of contexts) {
      const table = quoteIdentifier(context.tableName);
      const usesTenantFallback = context.subscriptionPlanId <= 0;
      let result;

      if (usesTenantFallback) {
        await connection.query(
          `INSERT INTO ${quoteIdentifier(BACKUP_TABLE)}
            (run_id, source_table, source_row_id, old_discount, new_discount,
             gmc_discount, subscription_plan_id, cruiseline_id)
           SELECT ?, ?, tenant.id, CAST(tenant.discount AS CHAR),
                  CAST(tenant.gmc_discount AS CHAR), CAST(tenant.gmc_discount AS CHAR),
                  ?, tenant.cruiseline_id
           FROM ${table} tenant
           WHERE tenant.gmc_discount IS NOT NULL
             AND NOT (tenant.discount <=> tenant.gmc_discount)`,
          [runId, context.tableName, context.subscriptionPlanId],
        );

        [result] = await connection.query(
          `UPDATE ${table} tenant
           SET tenant.discount = tenant.gmc_discount
           WHERE tenant.gmc_discount IS NOT NULL
             AND NOT (tenant.discount <=> tenant.gmc_discount)`,
        );
      } else {
        await connection.query(
          `INSERT INTO ${quoteIdentifier(BACKUP_TABLE)}
            (run_id, source_table, source_row_id, old_discount, new_discount,
             gmc_discount, subscription_plan_id, cruiseline_id)
           SELECT ?, ?, tenant.id, CAST(tenant.discount AS CHAR),
                  CAST(master.gmc_discount AS CHAR), CAST(master.gmc_discount AS CHAR),
                  ?, tenant.cruiseline_id
           FROM ${table} tenant
           INNER JOIN ${quoteIdentifier(MASTER_TABLE)} master
             ON master.subscription_plan_id = ?
            AND master.cruiseline_id = tenant.cruiseline_id
           WHERE master.gmc_discount IS NOT NULL
             AND NOT (tenant.discount <=> master.gmc_discount)`,
          [runId, context.tableName, context.subscriptionPlanId, context.subscriptionPlanId],
        );

        [result] = await connection.query(
          `UPDATE ${table} tenant
           INNER JOIN ${quoteIdentifier(MASTER_TABLE)} master
             ON master.subscription_plan_id = ?
            AND master.cruiseline_id = tenant.cruiseline_id
           SET tenant.discount = master.gmc_discount
           WHERE master.gmc_discount IS NOT NULL
             AND NOT (tenant.discount <=> master.gmc_discount)`,
          [context.subscriptionPlanId],
        );
      }
      const changed = Number(result.affectedRows || 0);
      tenantRows += changed;
      if (changed > 0) {
        tenantTables += 1;
        changedTables.push({
          table: context.tableName,
          rows: changed,
          source: usesTenantFallback
            ? "tenant_gmc_discount"
            : "master_gmc_discount",
        });
      }
    }

    const details = JSON.stringify({ changedTables, missingTables });
    await connection.query(
      `UPDATE ${quoteIdentifier(RUNS_TABLE)}
       SET status = 'committed', master_rows = ?, tenant_rows = ?,
           tenant_tables = ?, details = ?, completed_at = NOW()
       WHERE id = ?`,
      [masterResult.affectedRows, tenantRows, tenantTables, details, runId],
    );
    await connection.commit();

    return {
      runId,
      masterRowsChanged: Number(masterResult.affectedRows || 0),
      tenantRowsChanged: tenantRows,
      tenantTablesChanged: tenantTables,
      changedTables,
      missingTenantTables: missingTables,
    };
  } catch (error) {
    await connection.rollback();
    await connection.query(
      `UPDATE ${quoteIdentifier(RUNS_TABLE)}
       SET status = 'failed', details = ?, completed_at = NOW()
       WHERE id = ?`,
      [JSON.stringify({ error: error.message }), runId],
    );
    throw error;
  }
}

async function rollbackSync(connection, admin, runId) {
  await ensureBackupTables(connection);
  const [runs] = await connection.query(
    `SELECT id, status, rolled_back_at
     FROM ${quoteIdentifier(RUNS_TABLE)}
     WHERE id = ? AND operation = 'apply'
     LIMIT 1`,
    [runId],
  );
  const run = runs[0];
  if (!run || run.status !== "committed") {
    throw new Error("A committed apply run with this runId was not found");
  }
  if (run.rolled_back_at) throw new Error("This run has already been rolled back");

  const [tables] = await connection.query(
    `SELECT DISTINCT source_table
     FROM ${quoteIdentifier(BACKUP_TABLE)}
     WHERE run_id = ?`,
    [runId],
  );
  let restoredRows = 0;

  await connection.beginTransaction();
  try {
    for (const row of tables) {
      const tableName = row.source_table;
      if (tableName !== MASTER_TABLE && !isAllowedTenantTable(tableName)) {
        throw new Error(`Rollback rejected protected table: ${tableName}`);
      }
      const [result] = await connection.query(
        `UPDATE ${quoteIdentifier(tableName)} target
         INNER JOIN ${quoteIdentifier(BACKUP_TABLE)} backup
           ON backup.source_row_id = target.id
          AND backup.run_id = ?
          AND backup.source_table = ?
         SET target.discount = backup.old_discount`,
        [runId, tableName],
      );
      restoredRows += Number(result.affectedRows || 0);
    }

    await connection.query(
      `UPDATE ${quoteIdentifier(RUNS_TABLE)}
       SET rolled_back_at = NOW(), rolled_back_by = ?
       WHERE id = ?`,
      [admin.email || admin.user_id || String(admin.id || "admin"), runId],
    );
    await connection.commit();
    return { runId, restoredRows };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  let connection;
  try {
    connection = await pool.getConnection();
    const preview = await buildPreview(connection);
    return NextResponse.json({
      success: true,
      mode: "preview",
      message: "No database values were changed.",
      apply: {
        method: "POST",
        body: { action: "apply", confirmation: APPLY_CONFIRMATION },
      },
      preview,
    });
  } catch (error) {
    console.error("[sync-discount-from-gmc] preview failed", error);
    return NextResponse.json(
      { success: false, message: error.message || "Preview failed" },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  let connection;
  try {
    const body = await request.json();
    const action = String(body.action || "preview").toLowerCase();
    connection = await pool.getConnection();

    if (action === "preview") {
      return NextResponse.json({
        success: true,
        mode: "preview",
        message: "No database values were changed.",
        preview: await buildPreview(connection),
      });
    }

    if (action === "apply") {
      if (body.confirmation !== APPLY_CONFIRMATION) {
        return NextResponse.json(
          {
            success: false,
            message: `Apply requires confirmation: ${APPLY_CONFIRMATION}`,
          },
          { status: 400 },
        );
      }
      const result = await applySync(connection, auth.admin);
      return NextResponse.json({
        success: true,
        mode: "apply",
        message: "GMC discounts were copied successfully. Backup rows were retained.",
        ...result,
      });
    }

    if (action === "rollback") {
      if (body.confirmation !== ROLLBACK_CONFIRMATION) {
        return NextResponse.json(
          {
            success: false,
            message: `Rollback requires confirmation: ${ROLLBACK_CONFIRMATION}`,
          },
          { status: 400 },
        );
      }
      const runId = Number(body.runId || 0);
      if (!runId) {
        return NextResponse.json(
          { success: false, message: "A valid runId is required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        mode: "rollback",
        message: "The selected sync run was rolled back.",
        ...(await rollbackSync(connection, auth.admin, runId)),
      });
    }

    return NextResponse.json(
      { success: false, message: "Action must be preview, apply, or rollback" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[sync-discount-from-gmc] request failed", error);
    return NextResponse.json(
      { success: false, message: error.message || "Commission sync failed" },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}
