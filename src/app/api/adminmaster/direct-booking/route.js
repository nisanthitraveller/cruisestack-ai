import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import { encryptIntegrationCredential } from "@/lib/integrationCredentials";

function clean(value) {
  return String(value || "").trim();
}

function normalizeCode(value, maxLength) {
  return clean(value)
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .slice(0, maxLength);
}

function errorResponse(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

async function saveProvider(connection, body) {
  const providerCode = normalizeCode(body.providerCode, 50);
  const providerName = clean(body.providerName);
  const adapterCode = clean(body.adapterCode)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 100);

  if (!providerCode || !providerName || !adapterCode) {
    throw Object.assign(
      new Error("Provider name, provider code and adapter code are required"),
      { statusCode: 400 },
    );
  }

  if (providerName.length > 150) {
    throw Object.assign(new Error("Provider name is too long"), {
      statusCode: 400,
    });
  }

  await connection.query(
    `
    INSERT INTO cruise_api_providers
      (provider_code, provider_name, adapter_code, status)
    VALUES (?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE
      provider_name = VALUES(provider_name),
      adapter_code = VALUES(adapter_code),
      status = 1
    `,
    [providerCode, providerName, adapterCode],
  );
}

async function assertReference(connection, table, id, label) {
  const allowedTables = new Set([
    "companies",
    "cruises",
    "cruise_api_providers",
  ]);
  if (!allowedTables.has(table)) throw new Error("Invalid reference table");

  const [rows] = await connection.query(
    `SELECT id FROM \`${table}\` WHERE id = ? LIMIT 1`,
    [id],
  );
  if (!rows[0]) {
    throw Object.assign(new Error(`${label} was not found`), {
      statusCode: 404,
    });
  }
}

async function saveIntegration(connection, body) {
  const integrationId = Number(body.id || 0);
  const companyId = Number(body.companyId || 0);
  const cruiselineId = Number(body.cruiselineId || 0);
  const providerId = Number(body.providerId || 0);
  const environment =
    String(body.environment).toUpperCase() === "PRODUCTION"
      ? "PRODUCTION"
      : "UAT";
  const isEnabled = body.isEnabled === true ? 1 : 0;
  const inrFlowEnabled = body.inrFlowEnabled === true ? 1 : 0;
  const balanceCheck =
    body.prePaymentBalanceCheckEnabled === true ? 1 : 0;
  const postPaymentBooking =
    body.postPaymentBookingEnabled === true ? 1 : 0;
  const exactSupplierPrice =
    body.exactSupplierPriceEnabled === true ? 1 : 0;

  if (!companyId || !cruiselineId || !providerId) {
    throw Object.assign(
      new Error("Company, cruise line and API provider are required"),
      { statusCode: 400 },
    );
  }

  await assertReference(connection, "companies", companyId, "Company");
  await assertReference(connection, "cruises", cruiselineId, "Cruise line");
  await assertReference(
    connection,
    "cruise_api_providers",
    providerId,
    "API provider",
  );

  let savedId = integrationId;

  if (integrationId) {
    const [duplicates] = await connection.query(
      `
      SELECT id
      FROM company_cruiseline_integrations
      WHERE company_id = ?
        AND cruiseline_id = ?
        AND provider_id = ?
        AND environment = ?
        AND id <> ?
      LIMIT 1
      `,
      [companyId, cruiselineId, providerId, environment, integrationId],
    );
    if (duplicates[0]) {
      throw Object.assign(
        new Error(
          `This ${environment} company, cruise line and provider integration already exists`,
        ),
        { statusCode: 409 },
      );
    }

    const [result] = await connection.query(
      `
      UPDATE company_cruiseline_integrations
      SET
        company_id = ?,
        cruiseline_id = ?,
        provider_id = ?,
        environment = ?,
        is_enabled = ?,
        inr_flow_enabled = ?,
        pre_payment_balance_check_enabled = ?,
        post_payment_booking_enabled = ?,
        exact_supplier_price_enabled = ?
      WHERE id = ?
      `,
      [
        companyId,
        cruiselineId,
        providerId,
        environment,
        isEnabled,
        inrFlowEnabled,
        balanceCheck,
        postPaymentBooking,
        exactSupplierPrice,
        integrationId,
      ],
    );

    if (!result.affectedRows) {
      throw Object.assign(new Error("Integration was not found"), {
        statusCode: 404,
      });
    }
  } else {
    const [duplicates] = await connection.query(
      `
      SELECT id
      FROM company_cruiseline_integrations
      WHERE company_id = ?
        AND cruiseline_id = ?
        AND provider_id = ?
        AND environment = ?
      LIMIT 1
      `,
      [companyId, cruiselineId, providerId, environment],
    );
    if (duplicates[0]) {
      throw Object.assign(
        new Error(
          `This ${environment} company, cruise line and provider integration already exists`,
        ),
        { statusCode: 409 },
      );
    }

    const [result] = await connection.query(
      `
      INSERT INTO company_cruiseline_integrations
        (
          company_id, cruiseline_id, provider_id, environment, is_enabled,
          inr_flow_enabled, pre_payment_balance_check_enabled,
          post_payment_booking_enabled, exact_supplier_price_enabled
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyId,
        cruiselineId,
        providerId,
        environment,
        isEnabled,
        inrFlowEnabled,
        balanceCheck,
        postPaymentBooking,
        exactSupplierPrice,
      ],
    );
    savedId = result.insertId;
  }

  const credentials = Array.isArray(body.credentials) ? body.credentials : [];
  const seenKeys = new Set();

  for (const credential of credentials) {
    const credentialKey = normalizeCode(credential?.key, 100);
    const value = String(credential?.value || "");

    if (!credentialKey || seenKeys.has(credentialKey)) continue;
    seenKeys.add(credentialKey);

    if (!value) continue;

    const [existingCredentials] = await connection.query(
      `
      SELECT id
      FROM company_integration_credentials
      WHERE integration_id = ? AND credential_key = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [savedId, credentialKey],
    );
    const encryptedValue = encryptIntegrationCredential(value);

    if (existingCredentials[0]) {
      await connection.query(
        `
        UPDATE company_integration_credentials
        SET encrypted_value = ?
        WHERE id = ?
        `,
        [encryptedValue, existingCredentials[0].id],
      );
    } else {
      await connection.query(
        `
        INSERT INTO company_integration_credentials
          (integration_id, credential_key, encrypted_value)
        VALUES (?, ?, ?)
        `,
        [savedId, credentialKey, encryptedValue],
      );
    }
  }

  if (seenKeys.size) {
    await connection.query(
      `
      DELETE FROM company_integration_credentials
      WHERE integration_id = ?
        AND credential_key NOT IN (?)
      `,
      [savedId, [...seenKeys]],
    );
  } else {
    await connection.query(
      `DELETE FROM company_integration_credentials WHERE integration_id = ?`,
      [savedId],
    );
  }

  return savedId;
}

export async function POST(request) {
  let connection;

  try {
    const admin = await getAdminMasterFromSession(request);
    if (!admin) return errorResponse("Master admin login required", 401);

    const body = await request.json();
    const action = clean(body.action);
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (action === "save_provider") {
      await saveProvider(connection, body);
    } else if (action === "save_integration") {
      await saveIntegration(connection, body);
    } else {
      await connection.rollback();
      return errorResponse("Unsupported direct booking action", 400);
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error("Admin master direct booking error:", error);

    if (error?.code === "ER_DUP_ENTRY") {
      return errorResponse(
        "This company, cruise line and provider integration already exists",
        409,
      );
    }

    return errorResponse(
      error?.statusCode ? error.message : "Unable to save direct booking settings",
      error?.statusCode || 500,
    );
  } finally {
    if (connection) connection.release();
  }
}
