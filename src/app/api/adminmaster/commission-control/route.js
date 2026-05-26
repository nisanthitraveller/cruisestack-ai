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

async function getTenantMasterCommissionTables(connection) {
  const [rows] = await connection.query(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME LIKE '%\\_master_commission'
      AND TABLE_NAME <> 'cruisestack_master_commission'
    ORDER BY TABLE_NAME ASC
    `,
  );

  return rows.map((row) => row.TABLE_NAME);
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

async function upsertTenantCommissionRow(connection, tableName, row) {
  await connection.query(
    `
    INSERT INTO ${quoteIdentifier(tableName)}
      (
        id,
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
      (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    ON DUPLICATE KEY UPDATE
      subscription_plan_id = VALUES(subscription_plan_id),
      cruiseline_id = VALUES(cruiseline_id),
      commission = VALUES(commission),
      discount = VALUES(discount),
      markup = VALUES(markup),
      gmc_discount = VALUES(gmc_discount),
      updated_at = NOW(),
      status = VALUES(status)
    `,
    [
      row.id,
      row.subscription_plan_id,
      row.cruiseline_id,
      row.commission,
      row.discount,
      row.markup,
      row.gmc_discount,
      row.status,
    ],
  );
}

async function deleteTenantCommissionRow(connection, tableName, id) {
  await connection.query(
    `
    DELETE FROM ${quoteIdentifier(tableName)}
    WHERE id = ?
    `,
    [id],
  );
}

async function syncCommissionRowToTenants(connection, row) {
  const tenantTables = await getTenantMasterCommissionTables(connection);

  for (const tenantTable of tenantTables) {
    await upsertTenantCommissionRow(connection, tenantTable, row);
  }

  return tenantTables.length;
}

async function deleteCommissionRowFromTenants(connection, id) {
  const tenantTables = await getTenantMasterCommissionTables(connection);

  for (const tenantTable of tenantTables) {
    await deleteTenantCommissionRow(connection, tenantTable, id);
  }

  return tenantTables.length;
}

async function syncAllCommissionRowsToTenants(connection) {
  const tenantTables = await getTenantMasterCommissionTables(connection);
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

  for (const tenantTable of tenantTables) {
    await connection.query(`DELETE FROM ${quoteIdentifier(tenantTable)}`);

    for (const row of rows) {
      await upsertTenantCommissionRow(connection, tenantTable, row);
    }
  }

  return {
    rows: rows.length,
    tenantTables: tenantTables.length,
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

      await connection.query(
        `
        DELETE FROM cruisestack_master_commission
        WHERE id = ?
        `,
        [id],
      );
      const tenantTables = await deleteCommissionRowFromTenants(connection, id);

      await connection.commit();

      return NextResponse.json({ success: true, tenantTables });
    }

    const payload = normalizeCommissionPayload(body);
    validateCommissionPayload(payload);

    if (action === "add") {
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
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
