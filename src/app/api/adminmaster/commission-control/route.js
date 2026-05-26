import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

const allowedActions = new Set(["add", "delete", "sync_all", "update"]);

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, "``")}\``;
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
  if (!payload.subscription_plan_id || !payload.cruiseline_id) {
    throw new Error("Plan ID and cruiseline ID are required");
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
    WHERE subscription_plan_id = ?
      AND cruiseline_id = ?
      AND id <> ?
    LIMIT 1
    `,
    [payload.subscription_plan_id, payload.cruiseline_id, excludeId],
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
      "Commission for this plan and cruiseline already exists. You can delete or update the existing row.",
    );
    error.statusCode = 409;
    throw error;
  }
}

async function getSubscribedCompaniesForPlan(connection, planId) {
  const [rows] = await connection.query(
    `
    SELECT DISTINCT c.id, c.slug
    FROM companies c
    INNER JOIN company_subscriptions cs ON cs.company_id = c.id
    WHERE cs.plan_id = ?
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
    ORDER BY subscription_plan_id ASC, cruiseline_id ASC, id ASC
    `,
  );
  const updatedTenantTables = new Set();

  for (const row of rows) {
    const companies = await getSubscribedCompaniesForPlan(
      connection,
      row.subscription_plan_id,
    );

    for (const company of companies) {
      const context = await getTenantCommissionContext(connection, company);

      if (!context) {
        continue;
      }

      await upsertTenantAgentCommissionRow(connection, context, row);
      updatedTenantTables.add(context.commissionTable);
    }
  }

  return {
    rows: rows.length,
    tenantTables: updatedTenantTables.size,
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
        WHERE id = ?
        `,
        [id],
      );
      const tenantTables = await deleteCommissionRowFromTenants(connection, row);

      await connection.commit();

      return NextResponse.json({ success: true, tenantTables });
    }

    const payload = normalizeCommissionPayload(body);
    validateCommissionPayload(payload);

    if (action === "add") {
      await assertUniquePlanCruiseline(connection, payload);

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
      const tenantTables = await syncCommissionRowToTenants(connection, row);

      await connection.commit();

      return NextResponse.json({ success: true, tenantTables });
    }

    if (action === "update") {
      if (!id) {
        throw new Error("Commission row ID is required");
      }

      const previousRow = await getMasterCommissionRow(connection, id);

      if (!previousRow) {
        throw new Error("Commission row was not found");
      }

      await assertUniquePlanCruiseline(connection, payload, id);

      await connection.query(
        `
        UPDATE cruisestack_master_commission
        SET
          subscription_plan_id = ?,
          cruiseline_id = ?,
          commission = ?,
          discount = ?,
          markup = ?,
          gmc_discount = ?,
          updated_at = NOW(),
          status = ?
        WHERE id = ?
        `,
        [
          payload.subscription_plan_id,
          payload.cruiseline_id,
          payload.commission,
          payload.discount,
          payload.markup,
          payload.gmc_discount,
          payload.status,
          id,
        ],
      );
      const row = await getMasterCommissionRow(connection, id);

      if (!row) {
        throw new Error("Commission row was not found");
      }

      if (
        previousRow.subscription_plan_id !== row.subscription_plan_id ||
        previousRow.cruiseline_id !== row.cruiseline_id
      ) {
        await deleteCommissionRowFromTenants(connection, previousRow);
      }

      const tenantTables = await syncCommissionRowToTenants(connection, row);

      await connection.commit();

      return NextResponse.json({ success: true, tenantTables });
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
