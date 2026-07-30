import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import { decryptIntegrationCredential } from "@/lib/integrationCredentials";

const PRODUCTION_BASE_URL =
  "https://www.cordeliacruises.com/api/agent";
const TIMEOUT_MS = 60000;

function clean(value) {
  return String(value || "").trim();
}

function apiError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

async function providerFetch(path, options) {
  let response;
  try {
    response = await fetch(`${PRODUCTION_BASE_URL}${path}`, {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      apiError(
        `Cordelia Production did not respond to ${path} within 60 seconds`,
        504,
      );
    }
    apiError(`Unable to connect to Cordelia Production ${path}`, 502);
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
    apiError(
      clean(data.message) ||
        clean(data.error) ||
        `Cordelia returned HTTP ${response.status}`,
      502,
    );
  }
  return data;
}

async function getCredentials(connection, integrationId) {
  const [integrations] = await connection.query(
    `
    SELECT i.id, i.environment, p.provider_code, p.adapter_code
    FROM company_cruiseline_integrations i
    JOIN cruise_api_providers p ON p.id = i.provider_id
    WHERE i.id = ?
    LIMIT 1
    `,
    [integrationId],
  );
  const integration = integrations[0];

  if (!integration) apiError("Production integration was not found", 404);
  if (integration.environment !== "PRODUCTION") {
    apiError("This test requires a Production integration", 409);
  }
  if (
    clean(integration.provider_code).toUpperCase() !== "CORDELIA" ||
    clean(integration.adapter_code).toLowerCase() !== "cordelia-agent-api"
  ) {
    apiError("Production diagnostics are not available for this provider", 409);
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
    credentials[clean(row.credential_key).toUpperCase()] =
      decryptIntegrationCredential(row.encrypted_value);
  }

  if (!credentials.X_AGENT_ID || !credentials.X_AGENT_KEY) {
    apiError("Save Production X_AGENT_ID and X_AGENT_KEY first", 409);
  }
  return credentials;
}

async function authenticate(credentials) {
  const data = await providerFetch("/get_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-AGENT-ID": credentials.X_AGENT_ID,
      "X-AGENT-KEY": credentials.X_AGENT_KEY,
    },
  });
  const token = clean(data.token);
  if (!token) apiError("Cordelia did not return an authentication token", 502);
  return { token, expiry: data.expiry ?? null };
}

function authHeaders(credentials, token) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AGENT-ID": credentials.X_AGENT_ID,
    "X-AGENT-TOKEN": token,
  };
}

function passengerCounts(body) {
  const adults = Number(body.adults);
  const children = Number(body.children || 0);
  const infants = Number(body.infants || 0);

  for (const [label, value] of [
    ["Adults", adults],
    ["Children", children],
    ["Infants", infants],
  ]) {
    if (!Number.isInteger(value) || value < 0 || value > 20) {
      apiError(`${label} must be a whole number between 0 and 20`);
    }
  }
  if (adults + children + infants < 1) {
    apiError("At least one passenger is required");
  }
  return { adults, children, infants };
}

function baseTestInput(body) {
  const itinerary = clean(body.itinerary);
  if (!itinerary) apiError("Itinerary ID is required");
  return {
    itinerary,
    priceType: clean(body.priceType),
    ...passengerCounts(body),
  };
}

export async function POST(request) {
  let connection;
  try {
    const admin = await getAdminMasterFromSession(request);
    if (!admin) apiError("Master admin login required", 401);

    const body = await request.json();
    const integrationId = Number(body.integrationId);
    const testType = clean(body.testType);
    if (!integrationId) apiError("Select a Production integration");

    connection = await pool.getConnection();
    const credentials = await getCredentials(connection, integrationId);
    const authentication = await authenticate(credentials);

    if (testType === "authentication") {
      return NextResponse.json({
        success: true,
        result: {
          authenticated: true,
          tokenExpiry: authentication.expiry ?? null,
        },
      });
    }

    const headers = authHeaders(credentials, authentication.token);

    if (testType === "wallet") {
      const wallet = await providerFetch("/wallet/balance.json", {
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

    if (testType === "itinerary") {
      const itinerary = clean(body.itinerary);
      if (!itinerary) apiError("Itinerary ID is required");

      const params = new URLSearchParams({ itinerary });
      const data = await providerFetch(
        `/itineraries/show.json?${params.toString()}`,
        {
          method: "GET",
          headers,
        },
      );
      return NextResponse.json({
        success: true,
        result: data,
      });
    }

    if (testType === "offers") {
      const itinerary = clean(body.itinerary);
      if (!itinerary) apiError("Itinerary ID is required");

      const params = new URLSearchParams({ itinerary_id: itinerary });
      const priceType = clean(body.priceType);
      if (priceType) params.set("price_type", priceType);

      const data = await providerFetch(`/offers?${params.toString()}`, {
        method: "GET",
        headers,
      });
      return NextResponse.json({
        success: true,
        result: data,
      });
    }

    if (testType === "availability") {
      const input = baseTestInput(body);
      const payload = {
        itinerary: input.itinerary,
        rooms: [
          {
            adults: input.adults,
            children: input.children,
            infants: input.infants,
          },
        ],
      };
      if (input.priceType) payload.price_type = input.priceType;

      const data = await providerFetch(
        "/itineraries/check_availability.json",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        },
      );
      return NextResponse.json({
        success: true,
        result: data,
      });
    }

    if (testType === "pricing") {
      const input = baseTestInput(body);
      const roomType = clean(body.roomType);
      if (!roomType) apiError("Room type is required");
      const room = {
        room_type: roomType,
        adults: input.adults,
        children: input.children,
        infants: input.infants,
      };
      const offerId = clean(body.offerId);
      if (offerId) room.offer_id = offerId;
      const payload = {
        itinerary: input.itinerary,
        addons: [],
        rooms: [room],
      };
      if (input.priceType) payload.price_type = input.priceType;

      const data = await providerFetch("/itineraries/pricing.json", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      return NextResponse.json({
        success: true,
        result: data,
      });
    }

    apiError("Unsupported Production diagnostic");
  } catch (error) {
    console.error("Admin master Production diagnostic error:", {
      message: error?.message,
      statusCode: error?.statusCode,
    });
    return NextResponse.json(
      { message: error?.message || "Unable to run Production diagnostic" },
      { status: error?.statusCode || 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
