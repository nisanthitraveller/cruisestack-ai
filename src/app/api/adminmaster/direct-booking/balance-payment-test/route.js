import crypto from "crypto";
import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import { decryptIntegrationCredential } from "@/lib/integrationCredentials";

const BASE_URL = "https://uat.cordeliacruises.com/api/agent";
const TIMEOUT_MS = 60000;
const INSPECTION_LIFETIME_MS = 5 * 60 * 1000;
const BALANCE_KEYS = [
  "due_amount",
  "amount_due",
  "balance_amount",
  "outstanding_amount",
  "remaining_amount",
  "pending_amount",
  "dueamount",
  "amountdue",
  "balanceamount",
  "outstandingamount",
  "remainingamount",
  "pendingamount",
];

function clean(value) {
  return String(value ?? "").trim();
}

function fail(message, statusCode = 400, code = "UAT_BALANCE_TEST_ERROR") {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  throw error;
}

function numeric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = clean(value).replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

function signatureKey() {
  const secret = clean(process.env.INTEGRATION_CREDENTIAL_ENCRYPTION_KEY);
  if (!secret) fail("Integration credential encryption key is not configured", 500);
  return crypto.createHash("sha256").update(secret).digest();
}

function signInspection(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", signatureKey())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyInspection(value) {
  const [encoded, signature] = clean(value).split(".");
  if (!encoded || !signature) fail("Invalid balance inspection", 400);
  const expected = crypto
    .createHmac("sha256", signatureKey())
    .update(encoded)
    .digest("base64url");
  const supplied = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    supplied.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(supplied, expectedBuffer)
  ) {
    fail("Balance inspection signature is invalid", 400);
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    fail("Balance inspection could not be read", 400);
  }
  if (!payload?.expiresAt || Date.now() > Number(payload.expiresAt)) {
    fail("Balance inspection expired. Retrieve the booking again.", 409);
  }
  return payload;
}

function findBalanceCandidates(value, path = [], results = []) {
  if (!value || typeof value !== "object" || path.length > 8) return results;
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key];
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (BALANCE_KEYS.includes(normalizedKey)) {
      const amount = numeric(child);
      if (amount != null) results.push({ path: childPath.join("."), amount });
    }
    if (child && typeof child === "object") {
      findBalanceCandidates(child, childPath, results);
    }
  }
  return results;
}

function redact(value, key = "") {
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (!value || typeof value !== "object") return value;
  const output = {};
  const sensitive = /token|key|secret|password|email|phone|mobile|address|pan|gstin|dob|name/i;
  for (const [childKey, child] of Object.entries(value)) {
    output[childKey] = sensitive.test(childKey)
      ? "[REDACTED]"
      : redact(child, childKey || key);
  }
  return output;
}

async function providerFetch(path, options, supplierMutation = false) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timeout = error?.name === "TimeoutError";
    fail(
      timeout
        ? `Cordelia UAT did not respond to ${path} within 60 seconds`
        : `Unable to connect to Cordelia UAT ${path}`,
      timeout ? 504 : 502,
      supplierMutation ? "SUPPLIER_PAYMENT_UNCERTAIN" : "SUPPLIER_CONNECTION_ERROR",
    );
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 500) };
    }
  }
  if (!response.ok) {
    fail(
      clean(data?.message) || clean(data?.error) || `Cordelia returned HTTP ${response.status}`,
      response.status === 410 ? 409 : 502,
      supplierMutation ? "SUPPLIER_PAYMENT_REJECTED" : "SUPPLIER_API_ERROR",
    );
  }
  return data;
}

async function ensureAuditTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cordelia_uat_balance_payment_tests (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      integration_id BIGINT UNSIGNED NOT NULL,
      booking_reference VARCHAR(100) NOT NULL,
      expected_due_amount DECIMAL(15,2) NOT NULL,
      status VARCHAR(40) NOT NULL,
      supplier_response LONGTEXT NULL,
      reconciled_response LONGTEXT NULL,
      last_error TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_cordelia_uat_balance_booking (integration_id, booking_reference)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function integrationCredentials(connection, integrationId) {
  const [rows] = await connection.query(
    `
    SELECT i.id, i.environment, c.company_name, c.slug,
           p.provider_code, p.adapter_code
    FROM company_cruiseline_integrations i
    JOIN companies c ON c.id = i.company_id
    JOIN cruise_api_providers p ON p.id = i.provider_id
    WHERE i.id = ? AND i.is_enabled = 1
    LIMIT 1
    `,
    [integrationId],
  );
  const integration = rows[0];
  if (!integration) fail("Enabled integration was not found", 404);
  if (integration.environment !== "UAT") fail("This test is restricted to UAT", 409);
  if (
    clean(integration.provider_code).toUpperCase() !== "CORDELIA" ||
    clean(integration.adapter_code).toLowerCase() !== "cordelia-agent-api" ||
    clean(integration.slug).toLowerCase().replace(/[-_]/g, "") !== "thomascook"
  ) {
    fail("Select the Thomas Cook Cordelia UAT integration", 409);
  }

  const [credentialRows] = await connection.query(
    `SELECT credential_key, encrypted_value
     FROM company_integration_credentials WHERE integration_id = ? ORDER BY id`,
    [integrationId],
  );
  const credentials = {};
  for (const row of credentialRows) {
    credentials[clean(row.credential_key).toUpperCase()] =
      decryptIntegrationCredential(row.encrypted_value);
  }
  if (!credentials.X_AGENT_ID || !credentials.X_AGENT_KEY) {
    fail("X_AGENT_ID and X_AGENT_KEY are required", 409);
  }
  return credentials;
}

async function authenticate(credentials) {
  const result = await providerFetch("/get_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-AGENT-ID": credentials.X_AGENT_ID,
      "X-AGENT-KEY": credentials.X_AGENT_KEY,
    },
  });
  const token = clean(result.token);
  if (!token) fail("Cordelia did not return an authentication token", 502);
  return token;
}

function authHeaders(credentials, token) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AGENT-ID": credentials.X_AGENT_ID,
    "X-AGENT-TOKEN": token,
  };
}

async function readSupplierState(bookingReference, credentials, token) {
  const encodedReference = encodeURIComponent(bookingReference);
  const [booking, wallet] = await Promise.all([
    providerFetch(`/bookings/show?booking_reference=${encodedReference}`, {
      method: "GET",
      headers: authHeaders(credentials, token),
    }),
    providerFetch("/wallet/balance", {
      method: "GET",
      headers: authHeaders(credentials, token),
    }),
  ]);
  const candidates = findBalanceCandidates(booking);
  return {
    booking,
    wallet,
    candidates,
    outstandingAmount: candidates.length ? candidates[0].amount : null,
  };
}

async function inspect(body, credentials, token, integrationId, connection) {
  const bookingReference = clean(body.bookingReference);
  if (!bookingReference) fail("Booking reference is required");
  if (bookingReference.length > 100) fail("Booking reference is too long");
  const state = await readSupplierState(bookingReference, credentials, token);
  const [attemptRows] = await connection.query(
    `SELECT status, expected_due_amount, last_error, updated_at
     FROM cordelia_uat_balance_payment_tests
     WHERE integration_id = ? AND booking_reference = ? LIMIT 1`,
    [integrationId, bookingReference],
  );
  const expiresAt = Date.now() + INSPECTION_LIFETIME_MS;
  return {
    bookingReference,
    outstandingAmount: state.outstandingAmount,
    balanceCandidates: state.candidates,
    walletBalance: numeric(state.wallet?.balance),
    booking: redact(state.booking),
    priorAttempt: attemptRows[0] || null,
    inspectionToken:
      state.outstandingAmount == null
        ? null
        : signInspection({
            integrationId,
            bookingReference,
            outstandingAmount: state.outstandingAmount,
            expiresAt,
          }),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

async function repay(body, credentials, token, integrationId, connection) {
  if (clean(body.confirmation) !== "PAY UAT BALANCE") {
    fail('Type "PAY UAT BALANCE" to confirm');
  }
  const inspected = verifyInspection(body.inspectionToken);
  if (Number(inspected.integrationId) !== integrationId) {
    fail("Balance inspection belongs to another integration", 409);
  }
  const bookingReference = clean(inspected.bookingReference);
  const before = await readSupplierState(bookingReference, credentials, token);
  if (before.outstandingAmount == null) {
    fail("Cordelia booking detail did not expose a documented due/balance amount", 409);
  }
  if (before.outstandingAmount <= 0) fail("This booking has no outstanding balance", 409);
  if (before.outstandingAmount !== Number(inspected.outstandingAmount)) {
    fail(
      `Outstanding balance changed from ${inspected.outstandingAmount} to ${before.outstandingAmount}. Inspect again.`,
      409,
    );
  }

  let attemptId;
  try {
    const [result] = await connection.query(
      `INSERT INTO cordelia_uat_balance_payment_tests
       (integration_id, booking_reference, expected_due_amount, status)
       VALUES (?, ?, ?, 'PROCESSING')`,
      [integrationId, bookingReference, before.outstandingAmount],
    );
    attemptId = result.insertId;
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      fail("A balance-payment attempt already exists for this UAT booking", 409, "DUPLICATE_ATTEMPT");
    }
    throw error;
  }

  try {
    const supplierResponse = await providerFetch(
      "/bookings/repay_due_amount",
      {
        method: "POST",
        headers: authHeaders(credentials, token),
        body: JSON.stringify({ booking_reference: bookingReference }),
      },
      true,
    );
    const after = await readSupplierState(bookingReference, credentials, token);
    const reconciled =
      after.outstandingAmount != null &&
      after.outstandingAmount < before.outstandingAmount;
    const status = reconciled ? "COMPLETED" : "RECONCILIATION_REQUIRED";
    await connection.query(
      `UPDATE cordelia_uat_balance_payment_tests
       SET status = ?, supplier_response = ?, reconciled_response = ? WHERE id = ?`,
      [
        status,
        JSON.stringify(redact(supplierResponse)),
        JSON.stringify(redact(after.booking)),
        attemptId,
      ],
    );
    return {
      bookingReference,
      status,
      paidAmount: before.outstandingAmount,
      outstandingBefore: before.outstandingAmount,
      outstandingAfter: after.outstandingAmount,
      walletBalanceBefore: numeric(before.wallet?.balance),
      walletBalanceAfter: numeric(after.wallet?.balance),
      supplierResponse: redact(supplierResponse),
      bookingAfter: redact(after.booking),
    };
  } catch (error) {
    const status =
      error?.code === "SUPPLIER_PAYMENT_UNCERTAIN"
        ? "MANUAL_REVIEW"
        : "FAILED";
    await connection
      .query(
        `UPDATE cordelia_uat_balance_payment_tests
         SET status = ?, last_error = ? WHERE id = ?`,
        [status, clean(error?.message).slice(0, 4000), attemptId],
      )
      .catch(() => {});
    throw error;
  }
}

export async function POST(request) {
  let connection;
  try {
    const admin = await getAdminMasterFromSession(request);
    if (!admin) fail("Master admin login required", 401);
    const body = await request.json();
    const integrationId = Number(body.integrationId);
    if (!integrationId) fail("Select a saved Thomas Cook UAT integration");
    connection = await pool.getConnection();
    await ensureAuditTable(connection);
    const credentials = await integrationCredentials(connection, integrationId);
    const token = await authenticate(credentials);
    const action = clean(body.action);
    const result =
      action === "inspect"
        ? await inspect(body, credentials, token, integrationId, connection)
        : action === "repay"
          ? await repay(body, credentials, token, integrationId, connection)
          : fail("Unsupported balance-payment test action");
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cordelia isolated UAT balance-payment test error", {
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
    });
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to run the UAT balance-payment test",
        code: error?.code || "UAT_BALANCE_TEST_ERROR",
      },
      { status: error?.statusCode || 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
