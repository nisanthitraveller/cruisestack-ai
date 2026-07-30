import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import { decryptIntegrationCredential } from "@/lib/integrationCredentials";

const CORDELIA_UAT_BASE_URL =
  "https://uat.cordeliacruises.com/api/agent";
const REQUEST_TIMEOUT_MS = 20000;

function apiError(message, statusCode = 400, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function clean(value) {
  return String(value || "").trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function readProviderResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 500) };
    }
  }

  if (!response.ok) {
    const message =
      clean(data?.message) ||
      clean(data?.error) ||
      `Cordelia returned HTTP ${response.status}`;
    throw apiError(message, 502, { providerStatus: response.status });
  }

  return data || {};
}

async function cordeliaFetch(path, options = {}) {
  try {
    const response = await fetch(`${CORDELIA_UAT_BASE_URL}${path}`, {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return readProviderResponse(response);
  } catch (error) {
    if (error?.statusCode) throw error;
    if (error?.name === "TimeoutError") {
      throw apiError("Cordelia did not respond within 20 seconds", 504);
    }
    throw apiError("Unable to connect to the Cordelia UAT API", 502);
  }
}

async function loadIntegration(connection, integrationId) {
  const [integrations] = await connection.query(
    `
    SELECT
      i.id,
      i.environment,
      i.is_enabled,
      p.provider_code,
      p.adapter_code
    FROM company_cruiseline_integrations i
    JOIN cruise_api_providers p ON p.id = i.provider_id
    WHERE i.id = ?
    LIMIT 1
    `,
    [integrationId],
  );
  const integration = integrations[0];

  if (!integration) throw apiError("Integration was not found", 404);
  if (String(integration.environment) !== "UAT") {
    throw apiError("Diagnostics are restricted to UAT integrations", 409);
  }
  if (
    String(integration.provider_code).toUpperCase() !== "CORDELIA" ||
    String(integration.adapter_code).toLowerCase() !== "cordelia-agent-api"
  ) {
    throw apiError(
      "UAT diagnostics are not implemented for this provider adapter",
      409,
    );
  }

  const [rows] = await connection.query(
    `
    SELECT credential_key, encrypted_value
    FROM company_integration_credentials
    WHERE integration_id = ?
    ORDER BY id
    `,
    [integrationId],
  );
  const credentials = {};

  for (const row of rows) {
    credentials[String(row.credential_key).toUpperCase()] =
      decryptIntegrationCredential(row.encrypted_value);
  }

  if (!credentials.X_AGENT_ID || !credentials.X_AGENT_KEY) {
    throw apiError(
      "Save X_AGENT_ID and X_AGENT_KEY before running UAT diagnostics",
      409,
    );
  }

  return { integration, credentials };
}

async function authenticate(credentials) {
  const data = await cordeliaFetch("/get_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-AGENT-ID": credentials.X_AGENT_ID,
      "X-AGENT-KEY": credentials.X_AGENT_KEY,
    },
  });
  const token = clean(data.token);

  if (!token) {
    throw apiError(
      "Cordelia authentication succeeded but did not return a token",
      502,
    );
  }

  return {
    token,
    expiry: data.expiry ?? null,
  };
}

function authenticatedHeaders(credentials, token) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AGENT-ID": credentials.X_AGENT_ID,
    "X-AGENT-TOKEN": token,
  };
}

function tokenExpiry(expiry) {
  if (expiry == null || expiry === "") return null;

  const numericExpiry = Number(expiry);
  if (Number.isFinite(numericExpiry)) {
    const milliseconds =
      numericExpiry < 100000000000 ? numericExpiry * 1000 : numericExpiry;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? String(expiry) : date.toISOString();
  }

  const date = new Date(String(expiry));
  return Number.isNaN(date.getTime()) ? String(expiry) : date.toISOString();
}

function pricingRequest(body) {
  const itinerary = clean(body.itinerary);
  const roomType = clean(body.roomType);
  const adults = Number(body.adults);
  const children = Number(body.children || 0);
  const infants = Number(body.infants || 0);
  const offerId = clean(body.offerId);
  const priceType = clean(body.priceType);

  if (!itinerary || !roomType) {
    throw apiError("Itinerary ID and room type are required");
  }

  for (const [label, value] of [
    ["Adults", adults],
    ["Children", children],
    ["Infants", infants],
  ]) {
    if (!Number.isInteger(value) || value < 0 || value > 20) {
      throw apiError(`${label} must be a whole number between 0 and 20`);
    }
  }

  if (adults + children + infants < 1) {
    throw apiError("At least one passenger is required");
  }

  const room = {
    room_type: roomType,
    adults,
    children,
    infants,
  };
  if (offerId) room.offer_id = offerId;

  const requestBody = {
    itinerary,
    addons: [],
    rooms: [room],
  };
  if (priceType) requestBody.price_type = priceType;

  return requestBody;
}

function sanitizedPricing(data) {
  return {
    available: Boolean(data.available),
    basePrice: safeNumber(data.base_price),
    portCharges: safeNumber(data.port_charges),
    gratuity: safeNumber(data.gratuity),
    fuelSurcharge: safeNumber(data.fuel_surcharge),
    insurance: safeNumber(data.insurance),
    discount: safeNumber(data.discount),
    tax: safeNumber(data.tax),
    tcsTax: safeNumber(data.tcs_tax),
    agentCommissionPercentage: safeNumber(data.agent_commission_pct),
    agentCommission: safeNumber(data.agent_commission),
    totalPrice: safeNumber(data.total_price),
    grossPrice: safeNumber(data.gross_price),
    partialPayableAmount: safeNumber(data.partial_payable_amount),
    dueDate: data.due_date ?? null,
    paymentOptionId: data.payment_option_id ?? null,
    rooms: Array.isArray(data.rooms)
      ? data.rooms.map((room) => ({
          available: Boolean(room.available),
          roomType: clean(room.room_type),
          price: safeNumber(room.price),
          priceKey: clean(room.price_key),
          sequenceNumber: safeNumber(room.seq_no),
          offersApplied: room.offers_applied ?? null,
        }))
      : [],
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
    const integrationId = Number(body.integrationId || 0);
    const testType = clean(body.testType);

    if (!integrationId) {
      throw apiError("Save and select an integration before testing");
    }

    connection = await pool.getConnection();
    const { credentials } = await loadIntegration(connection, integrationId);
    const authentication = await authenticate(credentials);

    if (testType === "authentication") {
      return NextResponse.json({
        success: true,
        result: {
          authenticated: true,
          tokenExpiry: tokenExpiry(authentication.expiry),
        },
      });
    }

    const headers = authenticatedHeaders(credentials, authentication.token);

    if (testType === "wallet") {
      const wallet = await cordeliaFetch("/wallet/balance.json", {
        method: "GET",
        headers,
      });

      return NextResponse.json({
        success: true,
        result: {
          status: wallet.status ?? null,
          balance: wallet.balance ?? null,
        },
      });
    }

    if (testType === "pricing") {
      const data = await cordeliaFetch("/itineraries/pricing.json", {
        method: "POST",
        headers,
        body: JSON.stringify(pricingRequest(body)),
      });

      return NextResponse.json({
        success: true,
        result: sanitizedPricing(data),
      });
    }

    throw apiError("Unsupported diagnostic test");
  } catch (error) {
    console.error("Admin master direct booking diagnostic error:", {
      message: error?.message,
      statusCode: error?.statusCode,
      details: error?.details,
    });
    return NextResponse.json(
      {
        message: error?.message || "Unable to run UAT diagnostic",
        details: error?.details || null,
      },
      { status: error?.statusCode || 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
