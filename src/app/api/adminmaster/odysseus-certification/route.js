import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 60000;

const ENDPOINTS = {
  "cruise-search": { path: "cruise", method: "POST" },
  "cruise-search-counters": { path: "cruise/facets", method: "POST" },
  "cruise-itinerary": { path: "cruise/Itinerary", method: "GET" },
  "fare-code-availability": "reservation/cruise/listfarecodes",
  "category-availability": "reservation/cruise/ListCategories",
  "cabin-availability": "reservation/cruise/listcabins",
  "cabin-hold": "reservation/cruise/holdcabin",
  "past-passenger-lookup": "reservation/cruise/GetPastPaxDetails",
  "get-cabin-details": "reservation/cruise/getcabindetails",
  "special-services": "reservation/cruise/listSpecialservices",
  "list-dinings": "reservation/cruise/listdinings",
  "addons-availability": "reservation/cruise/ListAddOns",
  "list-prices": "reservation/cruise/listprices",
  "create-without-payment": "reservation/cruise/create",
  "read-supplier-pay": "reservation/cruise/readfromsupplier",
  "read-reservation": "reservation/cruise/read",
  tokenization: "payment/TokenizeCard",
  "pay-to-supplier": "reservation/cruise/paytosupplier",
  "read-supplier-view": "reservation/cruise/readfromsupplier",
  "cancel-reservation": "reservation/cruise/cancel",
};

function cleanBaseUrl(value) {
  const baseUrl = String(value || "").trim();
  if (!baseUrl) return "";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function certificationCredentials() {
  return {
    siteItemId: String(
      process.env.ODYSSEUS_CERT_SITE_ITEM_ID ||
        process.env.SITE_SANDBOX_ITEM_ID ||
        process.env.SITE_ITEM_ID ||
        "",
    ).trim(),
    clientId: String(
      process.env.ODYSSEUS_CERT_CLIENT_ID ||
        process.env.CLIENT_SANDBOX_ID ||
        process.env.CLIENT_ID ||
        "",
    ).trim(),
    clientSecret: String(
      process.env.ODYSSEUS_CERT_CLIENT_SECRET ||
        process.env.CLIENT_SANDBOX_SECRET ||
        process.env.CLIENT_SECRET ||
        "",
    ).trim(),
  };
}

function certificationBaseUrl() {
  return cleanBaseUrl(
    process.env.ODYSSEUS_CERT_API_BASE_URL ||
      process.env.API_SANDBOX_BASE_URL ||
      process.env.API_BASE_URL,
  );
}

function maskSensitive(value, key = "") {
  if (Array.isArray(value)) {
    return value.map((item) => maskSensitive(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        maskSensitive(childValue, childKey),
      ]),
    );
  }

  const normalizedKey = key.toLowerCase();
  if (
    [
      "cardnumber",
      "card_number",
      "cvv",
      "cvc",
      "securitycode",
      "security_code",
      "password",
      "clientsecret",
      "client_secret",
      "authorization",
    ].includes(normalizedKey)
  ) {
    return value ? "••••••••" : value;
  }

  if (normalizedKey === "number" && typeof value === "string") {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 12) return `•••• •••• •••• ${digits.slice(-4)}`;
  }

  return value;
}

async function readProviderBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 100000) };
  }
}

export async function GET() {
  const admin = await getAdminMasterFromSession(await cookies());
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const credentials = certificationCredentials();
  return NextResponse.json({
    configured: Boolean(
      certificationBaseUrl() &&
        credentials.siteItemId &&
        credentials.clientId &&
        credentials.clientSecret,
    ),
    environment: "SANDBOX",
    endpointIds: Object.keys(ENDPOINTS),
  });
}

export async function POST(request) {
  const admin = await getAdminMasterFromSession(await cookies());
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const stepId = String(body?.stepId || "");
    const endpointConfig = ENDPOINTS[stepId];
    if (!endpointConfig) {
      return NextResponse.json({ message: "Unsupported certification step" }, { status: 400 });
    }

    if (!body?.requestBody || typeof body.requestBody !== "object" || Array.isArray(body.requestBody)) {
      return NextResponse.json({ message: "Request body must be a JSON object" }, { status: 400 });
    }

    const serialized = JSON.stringify(body.requestBody);
    if (serialized.length > 1000000) {
      return NextResponse.json({ message: "Request body exceeds the 1 MB limit" }, { status: 413 });
    }

    const defaultBaseUrl = certificationBaseUrl();
    const tokenizationBaseUrl = cleanBaseUrl(
      process.env.ODYSSEUS_CERT_TOKENIZATION_BASE_URL ||
        process.env.API_BASE_URL_TOKENIZATION ||
        defaultBaseUrl,
    );
    const baseUrl = stepId === "tokenization" ? tokenizationBaseUrl : defaultBaseUrl;

    if (!baseUrl) {
      return NextResponse.json(
        {
          message:
            "Configure ODYSSEUS_CERT_API_BASE_URL before running certification requests",
        },
        { status: 409 },
      );
    }

    const credentials = certificationCredentials();
    if (
      !credentials.siteItemId ||
      !credentials.clientId ||
      !credentials.clientSecret
    ) {
      return NextResponse.json(
        {
          message:
            "Configure the Odysseus certification SiteItemId, client ID and client secret before running requests",
        },
        { status: 409 },
      );
    }

    const endpoint =
      typeof endpointConfig === "string" ? endpointConfig : endpointConfig.path;
    const method =
      typeof endpointConfig === "string" ? "POST" : endpointConfig.method;
    let target = new URL(endpoint, baseUrl);
    if (stepId === "cruise-itinerary") {
      const itineraryId = String(body.requestBody.itineraryId || "").trim();
      if (!/^\d+$/.test(itineraryId)) {
        return NextResponse.json(
          { message: "A numeric itineraryId is required" },
          { status: 400 },
        );
      }
      target = new URL(`${endpoint}/${encodeURIComponent(itineraryId)}`, baseUrl);
    }
    const startedAt = Date.now();
    const providerResponse = await fetch(target, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        SiteItemId: credentials.siteItemId,
        Authorization: `Basic ${Buffer.from(
          `${credentials.clientId}:${credentials.clientSecret}`,
        ).toString("base64")}`,
      },
      ...(method === "POST" ? { body: serialized } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const providerBody = await readProviderBody(providerResponse);

    return NextResponse.json({
      ok: providerResponse.ok && providerBody?.isSucceed !== false,
      providerStatus: providerResponse.status,
      durationMs: Date.now() - startedAt,
      endpoint: target.pathname,
      request: maskSensitive(body.requestBody),
      response: maskSensitive(providerBody),
      requestId: providerBody?.data?.trackingInfo?.requestId || null,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError";
    return NextResponse.json(
      {
        message: timedOut
          ? "Odysseus Sandbox did not respond within 60 seconds"
          : error?.message || "Unable to run Odysseus certification request",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}
