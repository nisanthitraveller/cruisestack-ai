import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

const allowedActions = new Set(["add", "delete", "import", "sync_all", "update"]);

const cruiseNameAliases = new Map([
  ["crystal cruises", "crystal"],
  ["fred oslen", "fred olsen"],
  ["holland america", "holland america line"],
  ["oceania cruise lines", "oceania cruises"],
  ["resorts world cruises", "star dreams cruises"],
  ["viking ocean cruises", "viking ocean"],
  ["viking river cruises", "viking river"],
]);

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, "``")}\``;
}

function normalizeCruiseName(value) {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return cruiseNameAliases.get(normalized) || normalized;
}

function getImportCell(row, names) {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (names.includes(normalizedKey)) return value;
  }
  return "";
}

function parseCommissionPercentage(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw || /^in\s*progress$/i.test(raw)) return null;

  const hasPercentSign = raw.includes("%");
  const numeric = Number(raw.replace(/,/g, "").replace(/%/g, "").trim());
  if (!Number.isFinite(numeric)) return null;

  const percentage = !hasPercentSign && numeric > 0 && numeric < 1
    ? numeric * 100
    : numeric;

  if (percentage < 0 || percentage > 100) return null;
  return Number(percentage.toFixed(4));
}

function levenshteinDistance(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= b.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function getCruiseSuggestions(value, cruises) {
  const normalizedInput = normalizeCruiseName(value);
  if (!normalizedInput) return [];

  return cruises
    .map((cruise) => {
      const normalizedCruise = normalizeCruiseName(cruise.name);
      const maxLength = Math.max(normalizedInput.length, normalizedCruise.length, 1);
      let score = 1 - levenshteinDistance(normalizedInput, normalizedCruise) / maxLength;

      if (
        normalizedInput.includes(normalizedCruise) ||
        normalizedCruise.includes(normalizedInput)
      ) {
        score = Math.max(score, 0.8);
      }

      return { id: Number(cruise.id), name: cruise.name, score };
    })
    .filter((cruise) => cruise.score >= 0.25)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, 3)
    .map(({ id, name }) => ({ id, name }));
}

function normalizeCommissionPayload(body) {
  return {
    commission: String(body.commission ?? "0").trim() || "0",
    cruiseline_id: Number(body.cruiseline_id || 0),
    discount: String(body.discount ?? "0").trim() || "0",
    gmc_discount: String(body.gmc_discount ?? "0").trim() || "0",
    markup: String(body.markup ?? "0").trim() || "0",
    status: Number(body.status ?? 1) === 1 ? 1 : 0,
    subscription_plan_id: Number(body.subscription_plan_id || 0),
  };
}

function validateCommissionPayload(payload) {
  if (!payload.cruiseline_id) {
    throw new Error("Cruiseline ID is required");
  }
}

function tableSafePrefix(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `
    SELECT TABLE_NAME AS table_name
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    LIMIT 1
    `,
    [tableName],
  );

  return Boolean(rows[0]?.table_name);
}

async function getMasterCommissionRow(connection, id) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      subscription_plan_id,
      cruiseline_id,
      commission,
      discount,
      markup,
      gmc_discount,
      status
    FROM cruisestack_master_commission
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function getDuplicateCommissionRow(connection, payload, excludeId = 0) {
  const [rows] = await connection.query(
    `
    SELECT id
    FROM cruisestack_master_commission
    WHERE cruiseline_id = ?
      AND id <> ?
    LIMIT 1
    `,
    [payload.cruiseline_id, excludeId],
  );

  return rows[0] || null;
}

async function assertUniquePlanCruiseline(connection, payload, excludeId = 0) {
  const duplicate = await getDuplicateCommissionRow(
    connection,
    payload,
    excludeId,
  );

  if (duplicate) {
    const error = new Error(
      "Commission for this cruiseline already exists. You can delete or update the existing row.",
    );
    error.statusCode = 409;
    throw error;
  }
}

async function getTenantCommissionTables(connection) {
  const [rows] = await connection.query(
    `
    SELECT TABLE_NAME AS table_name
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME LIKE '%\\_agent_commission'
      AND TABLE_NAME <> 'tour_agent_commission'
      AND TABLE_NAME NOT LIKE 'tour\\_%'
    ORDER BY TABLE_NAME ASC
    `,
  );

  return rows.map((row) => row.table_name);
}

async function getCompaniesByCommissionTable(connection) {
  const [companies] = await connection.query(
    `SELECT id, slug FROM companies WHERE slug IS NOT NULL AND slug <> ''`,
  );
  const companyByTable = new Map();

  for (const company of companies) {
    const prefix = tableSafePrefix(company.slug);
    if (prefix) companyByTable.set(`${prefix}_agent_commission`, company);
  }

  return companyByTable;
}

async function getSharedMasterCommissionRows(connection) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      subscription_plan_id,
      cruiseline_id,
      commission,
      discount,
      markup,
      gmc_discount,
      status,
      updated_at
    FROM cruisestack_master_commission
    ORDER BY updated_at DESC, id DESC
    `,
  );
  const sharedRows = new Map();

  for (const row of rows) {
    const cruiseId = Number(row.cruiseline_id);
    if (!sharedRows.has(cruiseId)) sharedRows.set(cruiseId, row);
  }

  return Array.from(sharedRows.values()).sort(
    (left, right) => Number(left.cruiseline_id) - Number(right.cruiseline_id),
  );
}

async function syncCommissionRowToAllTenantTables(connection, row) {
  const tables = await getTenantCommissionTables(connection);
  const companyByTable = await getCompaniesByCommissionTable(connection);
  let updatedRows = 0;

  for (const tableName of tables) {
    const [result] = await connection.query(
      `
      UPDATE ${quoteIdentifier(tableName)}
      SET
        commission = ?,
        discount = ?,
        markup = ?,
        gmc_discount = ?,
        updated_at = NOW(),
        status = ?
      WHERE cruiseline_id = ?
      `,
      [
        row.commission,
        row.discount,
        row.markup,
        row.gmc_discount,
        row.status,
        row.cruiseline_id,
      ],
    );
    updatedRows += Number(result.affectedRows || 0);

    if (Number(result.affectedRows || 0) === 0) {
      const company = companyByTable.get(tableName);
      if (company) {
        const context = await getTenantCommissionContext(connection, company);
        if (context) {
          await upsertTenantAgentCommissionRow(connection, context, row);
        }
      }
    }
  }

  return { tenantTables: tables.length, updatedRows };
}

async function getSubscribedCompaniesForPlan(connection, planId) {
  const [rows] = await connection.query(
    `
    SELECT DISTINCT c.id, c.slug
    FROM companies c
    INNER JOIN company_subscriptions cs ON cs.company_id = c.id
    WHERE cs.plan_id = ?
      AND COALESCE(c.enable_commission_sync, 1) = 1
      AND c.slug IS NOT NULL
      AND c.slug <> ''
      AND (
        cs.status = 1
        OR cs.payment_status = 'Paid'
      )
    ORDER BY c.id ASC
    `,
    [planId],
  );

  return rows;
}

async function getTenantCommissionContext(connection, company) {
  const tablePrefix = tableSafePrefix(company.slug);

  if (!tablePrefix) {
    return null;
  }

  const commissionTable = `${tablePrefix}_agent_commission`;
  const hasCommissionTable = await tableExists(connection, commissionTable);

  if (!hasCommissionTable) {
    return null;
  }

  const [existingCommissionRows] = await connection.query(
    `
    SELECT tour_agent_id, company_id
    FROM ${quoteIdentifier(commissionTable)}
    WHERE company_id = ?
    ORDER BY id ASC
    LIMIT 1
    `,
    [company.id],
  );

  if (existingCommissionRows[0]?.tour_agent_id) {
    return {
      commissionTable,
      companyId: existingCommissionRows[0].company_id || company.id,
      tourAgentId: existingCommissionRows[0].tour_agent_id,
    };
  }

  const agentTable = `${tablePrefix}_agent`;
  const hasAgentTable = await tableExists(connection, agentTable);

  if (!hasAgentTable) {
    return null;
  }

  const [agents] = await connection.query(
    `
    SELECT id, company_id
    FROM ${quoteIdentifier(agentTable)}
    WHERE company_id = ?
    ORDER BY type = 'Admin' DESC, id ASC
    LIMIT 1
    `,
    [company.id],
  );

  if (!agents[0]?.id) {
    return null;
  }

  return {
    commissionTable,
    companyId: agents[0].company_id || company.id,
    tourAgentId: agents[0].id,
  };
}

async function upsertTenantAgentCommissionRow(connection, context, row) {
  const [existing] = await connection.query(
    `
    SELECT id
    FROM ${quoteIdentifier(context.commissionTable)}
    WHERE tour_agent_id = ?
      AND company_id = ?
      AND cruiseline_id = ?
    LIMIT 1
    `,
    [context.tourAgentId, context.companyId, row.cruiseline_id],
  );

  if (existing[0]?.id) {
    await connection.query(
      `
      UPDATE ${quoteIdentifier(context.commissionTable)}
      SET
        commission = ?,
        discount = ?,
        markup = ?,
        gmc_discount = ?,
        updated_at = NOW(),
        status = ?
      WHERE id = ?
      `,
      [
        row.commission,
        row.discount,
        row.markup,
        row.gmc_discount,
        row.status,
        existing[0].id,
      ],
    );
    return;
  }

  await connection.query(
    `
    INSERT INTO ${quoteIdentifier(context.commissionTable)}
      (
        tour_agent_id,
        cruiseline_id,
        commission,
        discount,
        markup,
        gmc_discount,
        created_at,
        updated_at,
        status,
        company_id
      )
    VALUES
      (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
    `,
    [
      context.tourAgentId,
      row.cruiseline_id,
      row.commission,
      row.discount,
      row.markup,
      row.gmc_discount,
      row.status,
      context.companyId,
    ],
  );
}

async function syncCommissionRowToTenants(connection, row) {
  const companies = await getSubscribedCompaniesForPlan(
    connection,
    row.subscription_plan_id,
  );
  let tenantTables = 0;

  for (const company of companies) {
    const context = await getTenantCommissionContext(connection, company);

    if (!context) {
      continue;
    }

    await upsertTenantAgentCommissionRow(connection, context, row);
    tenantTables += 1;
  }

  return tenantTables;
}

async function deleteCommissionRowFromTenants(connection, row) {
  const companies = await getSubscribedCompaniesForPlan(
    connection,
    row.subscription_plan_id,
  );
  let tenantTables = 0;

  for (const company of companies) {
    const context = await getTenantCommissionContext(connection, company);

    if (!context) {
      continue;
    }

    await connection.query(
      `
      DELETE FROM ${quoteIdentifier(context.commissionTable)}
      WHERE tour_agent_id = ?
        AND company_id = ?
        AND cruiseline_id = ?
      `,
      [context.tourAgentId, context.companyId, row.cruiseline_id],
    );
    tenantTables += 1;
  }

  return tenantTables;
}

async function syncAllCommissionRowsToTenants(connection) {
  const rows = await getSharedMasterCommissionRows(connection);
  const tables = await getTenantCommissionTables(connection);
  let updatedRows = 0;

  for (const row of rows) {
    await connection.query(
      `
      UPDATE cruisestack_master_commission
      SET
        commission = ?,
        discount = ?,
        markup = ?,
        gmc_discount = ?,
        status = ?
      WHERE cruiseline_id = ?
      `,
      [
        row.commission,
        row.discount,
        row.markup,
        row.gmc_discount,
        row.status,
        row.cruiseline_id,
      ],
    );
    const result = await syncCommissionRowToAllTenantTables(connection, row);
    updatedRows += result.updatedRows;
  }

  return {
    rows: rows.length,
    tenantTables: tables.length,
    updatedRows,
  };
}

export async function POST(request) {
  let connection;

  try {
    const admin = await getAdminMasterFromSession(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Master admin login required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const action = String(body.action || "");

    if (!allowedActions.has(action)) {
      return NextResponse.json(
        { message: "Invalid commission action" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (action === "sync_all") {
      const result = await syncAllCommissionRowsToTenants(connection);

      await connection.commit();

      return NextResponse.json({ success: true, ...result });
    }

    if (action === "import") {
      let planId = Number(body.subscription_plan_id || 0);
      const importRows = Array.isArray(body.rows) ? body.rows : [];
      const previewOnly = body.preview === true;

      if (!planId) {
        const [plans] = await connection.query(
          "SELECT id FROM subscription_plans ORDER BY id ASC LIMIT 1",
        );
        planId = Number(plans[0]?.id || 0);
      }
      if (!planId) {
        throw new Error("At least one subscription plan must exist");
      }
      if (!importRows.length) {
        throw new Error("The spreadsheet does not contain any data rows");
      }

      const [cruises] = await connection.query(
        "SELECT id, name FROM cruises ORDER BY id ASC",
      );
      const cruiseByName = new Map();
      for (const cruise of cruises) {
        const key = normalizeCruiseName(cruise.name);
        if (key && !cruiseByName.has(key)) cruiseByName.set(key, cruise);
      }

      const [existingRows] = await connection.query(
        `SELECT cruiseline_id
         FROM cruisestack_master_commission`,
      );
      const existingCruiseIds = new Set(
        existingRows.map((row) => Number(row.cruiseline_id)),
      );
      const seenCruiseIds = new Set();
      const summary = {
        inserted: [],
        skippedExisting: [],
        skippedInvalidCommission: [],
        skippedUnmatchedCruise: [],
        tenantTablesUpdated: 0,
      };
      const previewRows = [];

      for (let index = 0; index < importRows.length; index += 1) {
        const importRow = importRows[index];
        const rowNumber = index + 2;
        const cruiseName = String(
          getImportCell(importRow, ["cruiseline", "cruiselines", "cruisename"]),
        ).trim();
        const commissionValue = getImportCell(importRow, ["commission"]);
        const percentage = parseCommissionPercentage(commissionValue);
        if (percentage === null) {
          const item = {
            commission: String(commissionValue || ""),
            cruiseName,
            rowNumber,
          };
          summary.skippedInvalidCommission.push(item);
          previewRows.push({
            inputCommission: item.commission,
            inputCruiseName: cruiseName,
            matchedCruiseId: null,
            matchedCruiseName: "",
            parsedCommission: null,
            rowNumber,
            status: "invalid",
            suggestions: [],
          });
          continue;
        }
        const cruise = cruiseByName.get(normalizeCruiseName(cruiseName));

        if (!cruise) {
          const suggestions = getCruiseSuggestions(cruiseName, cruises);
          summary.skippedUnmatchedCruise.push({ cruiseName, rowNumber, suggestions });
          previewRows.push({
            inputCommission: String(commissionValue || ""),
            inputCruiseName: cruiseName,
            matchedCruiseId: null,
            matchedCruiseName: "",
            parsedCommission: percentage,
            rowNumber,
            status: "unmatched",
            suggestions,
          });
          continue;
        }

        const cruiseId = Number(cruise.id);
        if (existingCruiseIds.has(cruiseId) || seenCruiseIds.has(cruiseId)) {
          summary.skippedExisting.push({
            cruiseName: cruise.name,
            rowNumber,
          });
          previewRows.push({
            inputCommission: String(commissionValue || ""),
            inputCruiseName: cruiseName,
            matchedCruiseId: cruiseId,
            matchedCruiseName: cruise.name,
            parsedCommission: percentage,
            rowNumber,
            status: "existing",
            suggestions: [],
          });
          continue;
        }

        previewRows.push({
          inputCommission: String(commissionValue || ""),
          inputCruiseName: cruiseName,
          matchedCruiseId: cruiseId,
          matchedCruiseName: cruise.name,
          parsedCommission: percentage,
          rowNumber,
          status: "ready",
          suggestions: [],
        });
        seenCruiseIds.add(cruiseId);

        if (previewOnly) {
          summary.inserted.push({
            commission: percentage,
            cruiseName: cruise.name,
            rowNumber,
          });
          continue;
        }

        const [result] = await connection.query(
          `INSERT INTO cruisestack_master_commission
            (subscription_plan_id, cruiseline_id, commission, discount, markup,
             gmc_discount, created_at, updated_at, status)
           VALUES (?, ?, 0, ?, 0, ?, NOW(), NOW(), 1)`,
          [planId, cruiseId, percentage, percentage],
        );
        const insertedRow = await getMasterCommissionRow(connection, result.insertId);
        const syncResult = await syncCommissionRowToAllTenantTables(
          connection,
          insertedRow,
        );
        summary.tenantTablesUpdated += syncResult.tenantTables;
        summary.inserted.push({
          commission: percentage,
          cruiseName: cruise.name,
          rowNumber,
        });
      }

      await connection.commit();
      return NextResponse.json({ previewOnly, previewRows, success: true, summary });
    }

    const id = Number(body.id || 0);

    if (action === "delete") {
      if (!id) {
        throw new Error("Commission row ID is required");
      }

      const row = await getMasterCommissionRow(connection, id);

      if (!row) {
        throw new Error("Commission row was not found");
      }

      await connection.query(
        `
        DELETE FROM cruisestack_master_commission
        WHERE cruiseline_id = ?
        `,
        [row.cruiseline_id],
      );
      const tenantTables = await getTenantCommissionTables(connection);
      for (const tableName of tenantTables) {
        await connection.query(
          `DELETE FROM ${quoteIdentifier(tableName)} WHERE cruiseline_id = ?`,
          [row.cruiseline_id],
        );
      }

      await connection.commit();

      return NextResponse.json({ success: true, tenantTables: tenantTables.length });
    }

    const payload = normalizeCommissionPayload(body);
    validateCommissionPayload(payload);

    if (action === "add") {
      await assertUniquePlanCruiseline(connection, payload);

      if (!payload.subscription_plan_id) {
        const [plans] = await connection.query(
          "SELECT id FROM subscription_plans ORDER BY id ASC LIMIT 1",
        );
        payload.subscription_plan_id = Number(plans[0]?.id || 0);
      }
      if (!payload.subscription_plan_id) {
        throw new Error("At least one subscription plan must exist");
      }

      const [result] = await connection.query(
        `
        INSERT INTO cruisestack_master_commission
          (
            subscription_plan_id,
            cruiseline_id,
            commission,
            discount,
            markup,
            gmc_discount,
            created_at,
            updated_at,
            status
          )
        VALUES
          (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
        `,
        [
          payload.subscription_plan_id,
          payload.cruiseline_id,
          payload.commission,
          payload.discount,
          payload.markup,
          payload.gmc_discount,
          payload.status,
        ],
      );
      const row = await getMasterCommissionRow(connection, result.insertId);
      const syncResult = await syncCommissionRowToAllTenantTables(connection, row);

      await connection.commit();

      return NextResponse.json({ success: true, ...syncResult });
    }

    if (action === "update") {
      if (!id) {
        throw new Error("Commission row ID is required");
      }

      const previousRow = await getMasterCommissionRow(connection, id);

      if (!previousRow) {
        throw new Error("Commission row was not found");
      }

      await connection.query(
        `
        UPDATE cruisestack_master_commission
        SET
          commission = ?,
          discount = ?,
          markup = ?,
          gmc_discount = ?,
          updated_at = NOW(),
          status = ?
        WHERE cruiseline_id = ?
        `,
        [
          payload.commission,
          payload.discount,
          payload.markup,
          payload.gmc_discount,
          payload.status,
          previousRow.cruiseline_id,
        ],
      );
      const row = await getMasterCommissionRow(connection, id);

      if (!row) {
        throw new Error("Commission row was not found");
      }

      const syncResult = await syncCommissionRowToAllTenantTables(connection, row);

      await connection.commit();

      return NextResponse.json({ success: true, ...syncResult });
    }

    await connection.rollback();

    return NextResponse.json(
      { message: "Unhandled commission action" },
      { status: 400 },
    );
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Adminmaster commission control error:", error);

    return NextResponse.json(
      { message: error.message || "Unable to update master commission" },
      { status: error.statusCode || 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
